import { mutation } from "./_generated/server";

export const generateDailySummary = mutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();

    const orders = await ctx.db.query("orders")
      .filter(q => q.gte(q.field("createdAt"), startOfDay))
      .collect();

    const totalOrders = orders.length;
    const totalRevenue = orders.filter(o => o.status === "paid").reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;

    const admins = await ctx.db.query("users")
      .filter(q => q.eq(q.field("role"), "admin"))
      .collect();

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        type: "system_alert",
        title: "Daily Summary",
        message: `Today: ${totalOrders} orders, UGX ${totalRevenue.toLocaleString()} revenue, ${pendingOrders} pending`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { totalOrders, totalRevenue, pendingOrders };
  },
});
