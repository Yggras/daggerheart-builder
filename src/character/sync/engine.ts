import AsyncStorage from "@react-native-async-storage/async-storage";
import { type RealtimeChannel, type RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { AppState, type NativeEventSubscription } from "react-native";
import { supabase } from "../../supabase/client";
import {
  deleteCharacter,
  getCharacter,
  listCharacters,
  putCharacterRaw,
  saveCharacter,
  subscribeToStore,
  type StoreEvent,
} from "../store";
import type { Character } from "../schema";
import { deleteRemote, fetchAllRemote, rowToCharacter, upsertRemote, type CharacterRow } from "./remote";

// Continuous, automatic character sync. Local edits flow into a persisted outbound queue and are
// pushed to Supabase; remote changes stream back via Realtime and are applied with last-write-wins.
// The engine never blocks the UI: AsyncStorage stays the local source of truth and all failures are
// retried (timer / reconnect / app-foreground). See docs/brain/architecture/sync-model.md.

const QUEUE_KEY = "daggerheart.sync.queue.v1";
const RETRY_INTERVAL_MS = 12_000;

export type SyncStatus = "idle" | "syncing" | "offline";

type PersistedQueue = { upserts: string[]; deletes: string[] };

class SyncEngine {
  private ownerId: string | null = null;
  private pendingUpserts = new Set<string>();
  private pendingDeletes = new Set<string>();
  private status: SyncStatus = "idle";

  private unsubscribeStore: (() => void) | null = null;
  private channel: RealtimeChannel | null = null;
  private appStateSub: NativeEventSubscription | null = null;
  private retryTimer: ReturnType<typeof setInterval> | null = null;
  private draining = false;

  private statusListeners = new Set<(status: SyncStatus) => void>();

  // ---- lifecycle -----------------------------------------------------------------------------

  async start(ownerId: string): Promise<void> {
    if (this.ownerId === ownerId) return;
    if (this.ownerId) this.stop();
    this.ownerId = ownerId;

    await this.loadQueue();
    this.unsubscribeStore = subscribeToStore((event) => this.onStoreEvent(event));
    this.subscribeRealtime(ownerId);

    this.appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") void this.drain();
    });
    this.retryTimer = setInterval(() => {
      if (this.pendingUpserts.size || this.pendingDeletes.size) void this.drain();
    }, RETRY_INTERVAL_MS);

    await this.reconcile(ownerId);
    void this.drain();
  }

  stop(): void {
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    if (this.channel) {
      void supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.appStateSub?.remove();
    this.appStateSub = null;
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
    this.ownerId = null;
    this.pendingUpserts.clear();
    this.pendingDeletes.clear();
    this.setStatus("idle");
  }

  // ---- status --------------------------------------------------------------------------------

  getStatus(): SyncStatus {
    return this.status;
  }

  subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: SyncStatus): void {
    if (this.status === status) return;
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }

  // ---- outbound queue ------------------------------------------------------------------------

  private onStoreEvent(event: StoreEvent): void {
    if (event.origin !== "local") return; // never re-push rows we applied from a pull
    if (event.type === "upsert") {
      this.pendingUpserts.add(event.character.id);
      this.pendingDeletes.delete(event.character.id);
    } else {
      this.pendingDeletes.add(event.id);
      this.pendingUpserts.delete(event.id);
    }
    void this.persistQueue();
    void this.drain();
  }

  private async drain(): Promise<void> {
    if (this.draining || !this.ownerId) return;
    if (!this.pendingUpserts.size && !this.pendingDeletes.size) return;
    this.draining = true;
    this.setStatus("syncing");
    const ownerId = this.ownerId;
    try {
      for (const id of [...this.pendingDeletes]) {
        await deleteRemote(id);
        this.pendingDeletes.delete(id);
        await this.persistQueue();
      }
      for (const id of [...this.pendingUpserts]) {
        const character = await getCharacter(id); // read latest so rapid edits coalesce
        if (!character) {
          this.pendingUpserts.delete(id);
          continue;
        }
        await upsertRemote(character, ownerId);
        this.pendingUpserts.delete(id);
        await this.persistQueue();
      }
      this.setStatus(this.pendingUpserts.size || this.pendingDeletes.size ? "offline" : "idle");
    } catch (error) {
      // Network/Supabase failure: keep the queue and retry later. Stay offline-first.
      console.warn("Sync: drain failed; will retry.", error);
      this.setStatus("offline");
    } finally {
      this.draining = false;
    }
  }

  private async loadQueue(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedQueue;
      this.pendingUpserts = new Set(parsed.upserts ?? []);
      this.pendingDeletes = new Set(parsed.deletes ?? []);
    } catch {
      this.pendingUpserts = new Set();
      this.pendingDeletes = new Set();
    }
  }

  private async persistQueue(): Promise<void> {
    const payload: PersistedQueue = {
      upserts: [...this.pendingUpserts],
      deletes: [...this.pendingDeletes],
    };
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(payload));
  }

  // ---- inbound Realtime ----------------------------------------------------------------------

  private subscribeRealtime(ownerId: string): void {
    this.channel = supabase
      .channel(`characters:${ownerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "characters", filter: `owner_id=eq.${ownerId}` },
        (payload: RealtimePostgresChangesPayload<CharacterRow>) => void this.onRemoteChange(payload),
      )
      .subscribe((channelStatus) => {
        if (channelStatus === "SUBSCRIBED") void this.drain(); // reconnect → flush anything queued
      });
  }

  private async onRemoteChange(
    payload: RealtimePostgresChangesPayload<CharacterRow>,
  ): Promise<void> {
    if (payload.eventType === "DELETE") {
      const id = (payload.old as Partial<CharacterRow>)?.id;
      if (id) await deleteCharacter(id, "remote");
      return;
    }
    const row = payload.new as Pick<CharacterRow, "id" | "data">;
    const remote = rowToCharacter(row);
    if (!remote) return;
    const local = await getCharacter(remote.id);
    if (!local || remote.meta.updatedAt > local.meta.updatedAt) {
      await putCharacterRaw(remote); // preserves remote updatedAt; emits a "remote" event
    }
  }

  // ---- initial reconcile ---------------------------------------------------------------------

  private async reconcile(ownerId: string): Promise<void> {
    let remoteList: Character[];
    try {
      remoteList = await fetchAllRemote(ownerId);
    } catch (error) {
      console.warn("Sync: initial fetch failed; working from local until reconnect.", error);
      this.setStatus("offline");
      return;
    }

    const localList = await listCharacters();
    const localById = new Map(localList.map((c) => [c.id, c]));
    const remoteById = new Map(remoteList.map((c) => [c.id, c]));

    for (const id of new Set([...localById.keys(), ...remoteById.keys()])) {
      const local = localById.get(id);
      const remote = remoteById.get(id);

      if (local && !remote) {
        this.enqueueUpsert(id); // local-only → push (backfills ownerId at send time)
        if (!local.meta.ownerId) await this.backfillOwner(local, ownerId);
      } else if (remote && !local) {
        await putCharacterRaw(remote); // remote-only → pull
      } else if (local && remote) {
        if (local.meta.updatedAt > remote.meta.updatedAt) this.enqueueUpsert(id);
        else if (remote.meta.updatedAt > local.meta.updatedAt) await putCharacterRaw(remote);
      }
    }
    await this.persistQueue();
  }

  private async backfillOwner(character: Character, ownerId: string): Promise<void> {
    // Stamp ownerId locally without changing updatedAt semantics for LWW; saveCharacter would bump
    // the timestamp, which is acceptable here since we're about to push anyway.
    await saveCharacter({ ...character, meta: { ...character.meta, ownerId } });
  }

  private enqueueUpsert(id: string): void {
    this.pendingUpserts.add(id);
    this.pendingDeletes.delete(id);
  }
}

export const syncEngine = new SyncEngine();
