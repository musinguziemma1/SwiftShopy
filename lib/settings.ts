import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

export async function getSettings(category?: string) {
  try {
    return await convex.query(api.admin.getSettings, category ? { category: category as any } : {});
  } catch {
    return [];
  }
}

export async function getSetting(key: string) {
  try {
    return await convex.query(api.admin.getSettingByKey, { key });
  } catch {
    return null;
  }
}

export async function upsertSetting(category: string, key: string, value: any, description?: string) {
  return await convex.mutation(api.admin.upsertSetting, {
    category: category as any,
    key,
    value,
    description,
  });
}

export async function bulkSaveSettings(settings: Array<{ category: string; key: string; value: any; description?: string }>) {
  return await convex.mutation(api.admin.bulkUpsertSettings, {
    settings: settings.map(s => ({ ...s, category: s.category as any })),
  });
}
