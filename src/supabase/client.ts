// URL polyfill must be imported before supabase-js so URL parsing works under Hermes/React Native.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Supabase project config comes from app.config.ts -> expoConfig.extra (sourced from .env).
const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl = extra.supabaseUrl as string | undefined;
const supabaseAnonKey = extra.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase config. Copy .env.example to .env and set SUPABASE_URL and SUPABASE_ANON_KEY.",
  );
}

// Single shared client. AsyncStorage persists the session across launches on web and native;
// detectSessionInUrl is off because we don't use OAuth redirect / magic-link flows (ADR-0007).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
