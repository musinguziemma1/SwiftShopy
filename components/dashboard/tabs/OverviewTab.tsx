import { memo } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, DollarSign, ShoppingCart, Users, MessageSquare } from "lucide-react";
import { containerVariants, itemVariants, fadeInVariants, statusColor, statusIconLabel, fmt } from "../utils";
import { Product, Order, Store } from "../utils";

interface OverviewTabProps {
  session: any;
  store: Store | null;
  products: Product[];
  orders: Order[];
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueChange: number;
    ordersChange: number;
    productsChange: number;
    customersChange: number;
  };
}

const OverviewTab = memo<OverviewTabProps>(({ session, store, products, orders, stats }) => {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <motion.div variants={fadeInVariants}>
        <h1 className="text-2xl font-bold mb-1">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name?.split(" ")[0]}! Here&apos;s what&apos;s happening with your store.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="p-6 glass rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Today&apos;s Summary
          </h3>
          <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Sales Today", value: "UGX 450,000", icon: <DollarSign className="w-5 h-5" />, bg: "bg-green-500/20", color: "text-green-500" },
            { label: "Orders", value: "12", badge: "3 pending", icon: <ShoppingCart className="w-5 h-5" />, bg: "bg-blue-500/20", color: "text-blue-500" },
            { label: "New Customers", value: "5", icon: <Users className="w-5 h-5" />, bg: "bg-purple-500/20", color: "text-purple-500" },
            { label: "Messages", value: "8", badge: "unread", icon: <MessageSquare className="w-5 h-5" />, bg: "bg-orange-500/20", color: "text-orange-500" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl glass hover:shadow-smooth transition-all cursor-pointer">
              <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                {item.icon}
              </div>
              <div className="text-2xl font-bold mb-1">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
              {item.badge && <span className="inline-block mt-2 px-2 py-0.5 bg-muted rounded-full text-xs">{item.badge}</span>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: fmt(stats.totalRevenue), change: stats.revenueChange, color: "from-green-500 to-emerald-500" },
          { title: "Total Orders", value: stats.totalOrders.toLocaleString(), change: stats.ordersChange, color: "from-blue-500 to-indigo-500" },
          { title: "Total Products", value: stats.totalProducts.toString(), change: stats.productsChange, color: "from-purple-500 to-pink-500" },
          { title: "Total Customers", value: stats.totalCustomers.toLocaleString(), change: stats.customersChange, color: "from-orange-500 to-amber-500" },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }} variants={itemVariants} className="p-5 glass rounded-xl cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${s.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {s.change >= 0 ? "↑" : "↓"} {Math.abs(s.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.title}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="p-6 glass rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Sales Goals
          </h3>
        </div>
        <div className="space-y-6">
          {[
            { period: "Daily Goal", target: 1_000_000, current: 450_000, pct: 45 },
            { period: "Weekly Goal", target: 5_000_000, current: 3_200_000, pct: 64 },
            { period: "Monthly Goal", target: 20_000_000, current: 12_500_000, pct: 62.5 },
          ].map((g, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{g.period}</span>
                <span className="text-sm text-muted-foreground">{fmt(g.current)} / {fmt(g.target)}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full" />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">{g.pct}% complete</span>
                <span className="text-xs font-medium text-primary">{fmt(g.target - g.current)} to go</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-6">
        <div className="p-6 glass rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Revenue Overview</h3>
          <div className="h-64 flex items-end gap-2 justify-between">
            {[65,45,78,52,90,67,85,72,95,80,88,92].map((h, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex-1 bg-gradient-to-t from-primary to-indigo-500 rounded-t cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        </div>

        <div className="p-6 glass rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Sales by Category</h3>
          <div className="space-y-4">
            {[
              { name: "Electronics", value: 45, color: "bg-blue-500" },
              { name: "Fashion", value: 30, color: "bg-purple-500" },
              { name: "Food & Beverage", value: 15, color: "bg-green-500" },
              { name: "Beauty", value: 10, color: "bg-pink-500" },
            ].map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-sm text-muted-foreground">{c.value}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`h-full ${c.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid lg:grid-cols-3 gap-6">
        <div className="p-6 glass rounded-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: "New order received", detail: "Order #1234", time: "2 min ago", color: "text-green-500", bg: "bg-green-500/20" },
              { action: "Payment confirmed", detail: "UGX 250,000", time: "15 min ago", color: "text-blue-500", bg: "bg-blue-500/20" },
              { action: "Product updated", detail: "Smart Watch Pro", time: "1 hour ago", color: "text-purple-500", bg: "bg-purple-500/20" },
            ].map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${a.bg} ${a.color} flex items-center justify-center shrink-0`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 glass rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 6).map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl glass hover:shadow-smooth transition-all cursor-pointer">
                <div>
                  <div className="font-medium mb-1">{order.id}</div>
                  <div className="text-sm text-muted-foreground">{order.customer}</div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-semibold">{fmt(order.amount)}</div>
                  <div className="text-xs text-muted-foreground">{order.items} items</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                  {statusIconLabel(order.status)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default OverviewTab;