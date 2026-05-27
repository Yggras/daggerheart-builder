import type { SrdEntry } from "../srd/schema";

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatKind(kind: SrdEntry["kind"]) {
  return kind
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const familyNames: Record<SrdEntry["kind"], string> = {
  adversary: "Adversaries",
  environment: "Environments",
  class: "Classes",
  subclass: "Subclasses",
  domain_card: "Domain Cards",
  ancestry: "Ancestries",
  community: "Communities",
  weapon: "Weapons",
  armor: "Armor",
  loot: "Loot",
  rule_reference: "Rules Reference",
};

export function formatFamilyName(kind: SrdEntry["kind"]) {
  return familyNames[kind];
}

export function formatTags(tags: string[]) {
  return tags.map((tag) => tag.replaceAll("-", " ")).join(" • ");
}
