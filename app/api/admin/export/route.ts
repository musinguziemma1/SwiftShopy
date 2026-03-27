import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type, format = "json", filters = {} } = await req.json();

    const sampleData: Record<string, any[]> = {
      users: [
        { id: "user1", name: "Sarah Nakato", email: "sarah@example.com", role: "seller", status: "active", joinDate: "2024-01-15" },
        { id: "user2", name: "David Okello", email: "david@example.com", role: "seller", status: "active", joinDate: "2023-11-20" },
        { id: "user3", name: "Grace Nambi", email: "grace@example.com", role: "seller", status: "active", joinDate: "2024-02-10" },
      ],
      sellers: [
        { id: "S001", name: "Sarah Nakato", storeName: "Nakato Styles", revenue: 15450000, orders: 234, products: 45, status: "active" },
        { id: "S002", name: "David Okello", storeName: "Tech Hub UG", revenue: 22890000, orders: 456, products: 67, status: "active" },
        { id: "S003", name: "Grace Nambi", storeName: "Grace's Kitchen", revenue: 8100000, orders: 178, products: 23, status: "active" },
      ],
      orders: [
        { id: "ORD-001", customer: "Aisha Nambi", total: 85000, status: "paid", items: 1, date: "2024-01-15" },
        { id: "ORD-002", customer: "Brenda Atim", total: 190000, status: "paid", items: 2, date: "2024-01-15" },
        { id: "ORD-003", customer: "Christine Achola", total: 70000, status: "pending", items: 1, date: "2024-01-14" },
      ],
      transactions: [
        { id: "TXN-001", amount: 450000, provider: "mtn_momo", status: "successful", date: "2024-01-15" },
        { id: "TXN-002", amount: 890000, provider: "mtn_momo", status: "successful", date: "2024-01-15" },
        { id: "TXN-003", amount: 250000, provider: "mtn_momo", status: "pending", date: "2024-01-14" },
      ],
      products: [
        { id: "P001", name: "Ankara Print Wrap Dress", price: 85000, stock: 20, store: "Nakato Styles", status: "active" },
        { id: "P002", name: "Samsung Galaxy A15", price: 850000, stock: 10, store: "Tech Hub UG", status: "active" },
        { id: "P003", name: "Rolex (Ugandan) – 2 Pack", price: 8000, stock: 100, store: "Apio's Kitchen", status: "active" },
      ],
      support_tickets: [
        { id: "TKT-001", subject: "Payment not received", priority: "critical", status: "open", assignee: "Support Team", created: "2024-01-15" },
        { id: "TKT-002", subject: "How to add products?", priority: "low", status: "open", assignee: "Unassigned", created: "2024-01-15" },
      ],
      audit_logs: [
        { id: "AUD-001", admin: "Admin User", action: "seller_approved", target: "Sarah Nakato", date: "2024-01-15 10:30" },
        { id: "AUD-002", admin: "Admin User", action: "product_deactivated", target: "Running Shoes Pro", date: "2024-01-15 09:15" },
      ],
    };

    let data = sampleData[type] || [];

    if (filters.status) data = data.filter((d: any) => d.status === filters.status);
    if (filters.startDate) data = data.filter((d: any) => d.date >= filters.startDate);
    if (filters.endDate) data = data.filter((d: any) => d.date <= filters.endDate);

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

    return NextResponse.json({
      data,
      count: data.length,
      type,
      exportedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[api/admin/export] Error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
