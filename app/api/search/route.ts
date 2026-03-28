import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "all";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], message: "Query too short" });
  }

  try {
    const results: any = { stores: [], products: [] };

    if (type === "all" || type === "stores") {
      const stores = await convex.query(api.stores.list, {});
      results.stores = stores.filter(s =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.slug.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 10);
    }

    if (type === "all" || type === "products") {
      const stores = await convex.query(api.stores.list, {});
      for (const store of stores) {
        const products = await convex.query(api.products.getByStore, { storeId: store._id as any });
        const matching = products.filter(p =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.description?.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 5);
        results.products.push(...matching.map(p => ({ ...p, storeName: store.name })));
      }
      results.products = results.products.slice(0, 20);
    }

    return NextResponse.json({ results, query: q });
  } catch (error) {
    console.error("[Search] Error:", error);
    return NextResponse.json({ results: { stores: [], products: [] }, error: "Search failed" });
  }
}
