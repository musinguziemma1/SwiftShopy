import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { requireAdmin } from "@/lib/api-auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { type, format = "json", filters = {} } = await req.json();

    let data: any[] = [];

    switch (type) {
      case "sellers":
      case "users": {
        const sellers = await convex.query(api.users.listSellers, {});
        data = sellers.map(s => ({
          id: s._id,
          name: s.name,
          email: s.email,
          storeName: s.storeName,
          status: s.isActive ? "active" : "inactive",
          revenue: s.revenue,
          orders: s.orderCount,
          products: s.productCount,
          joinDate: new Date(s.joinDate ?? s._creationTime).toLocaleDateString(),
        }));
        break;
      }
      case "products": {
        const stores = await convex.query(api.stores.list, {});
        for (const store of stores) {
          const products = await convex.query(api.products.getByStore, { storeId: store._id as any });
          data.push(...products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            sales: p.sales ?? 0,
            category: p.category ?? "General",
            store: store.name,
            status: p.isActive ? "active" : "inactive",
          })));
        }
        break;
      }
      case "orders": {
        const orders = await convex.query(api.orders.list, {});
        data = orders.map(o => ({
          id: o.orderNumber,
          customer: o.customerName,
          phone: o.customerPhone,
          total: o.total,
          status: o.status,
          items: o.items.length,
          date: new Date(o.createdAt ?? o._creationTime).toLocaleDateString(),
        }));
        break;
      }
      case "transactions": {
        const transactions = await convex.query(api.transactions.list, {});
        data = transactions.map(t => ({
          id: t._id,
          amount: t.amount,
          currency: t.currency,
          provider: t.provider,
          status: t.status,
          customerPhone: t.customerPhone,
          date: new Date(t._creationTime).toLocaleDateString(),
        }));
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    if (filters.status) data = data.filter((d: any) => d.status === filters.status);

    if (data.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 400 });
    }

    if (format === "csv") {
      const headers = Object.keys(data[0]);
      const rows = data.map((row: any) =>
        headers.map(h => {
          const val = row[h];
          const str = val === null || val === undefined ? "" : String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-export-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ data, count: data.length, type, exportedAt: new Date().toISOString() });
  } catch (err: unknown) {
    console.error("[api/admin/export] Error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
