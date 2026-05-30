import type { ExpoConfig } from "expo/config";

// Migrated from app.json so we can surface Supabase config from the environment (loaded by the Expo
// CLI from .env) into expoConfig.extra, where the client reads it via expo-constants.
const config: ExpoConfig = {
  name: "Daggerheart Builder",
  slug: "daggerheart-builder",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "daggerheart-builder",
  userInterfaceStyle: "automatic",
  platforms: ["ios", "android", "web"],
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: false,
  },
  web: {
    bundler: "metro",
  },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  },
};

export default config;
