import { prisma } from "@/lib/prisma";
import Link from "next/link";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const stageLabels: Record<string, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Won",
  closed_lost: "Lost",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
  const [
    customerCount,
    supplierCount,
    productCount,
    activeDeals,
    pendingOrderCount,
    recentOrders,
    dealsByStage,
    topCustomers,
    lowStock,
  ] = await Promise.all([
    prisma.customer.count({ where: { status: "active" } }),
    prisma.supplier.count({ where: { status: "active" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.deal.aggregate({
      where: { stage: { notIn: ["closed_won", "closed_lost"] } },
      _sum: { value: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.deal.groupBy({
      by: ["stage"],
      _count: true,
      _sum: { value: true },
    }),
    prisma.customer
      .findMany({
        take: 5,
        include: {
          orders: { select: { total: true } },
          _count: { select: { orders: true } },
        },
      })
      .then((cs) =>
        cs
          .map((c) => ({
            id: c.id,
            name: c.name,
            orderCount: c._count.orders,
            totalRevenue: c.orders.reduce((s, o) => s + o.total, 0),
          }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
      ),
    prisma.product.findMany({
      where: { isActive: true, stockQty: { lte: 10 } },
      orderBy: { stockQty: "asc" },
      take: 5,
      select: { id: true, name: true, sku: true, stockQty: true, reorderQty: true },
    }),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your distribution business</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Active Customers"
          value={customerCount}
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          color="bg-blue-50"
        />
        <StatCard
          title="Suppliers"
          value={supplierCount}
          icon={<svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          color="bg-indigo-50"
        />
        <StatCard
          title="Products"
          value={productCount}
          icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          color="bg-purple-50"
        />
        <StatCard
          title="Pipeline Value"
          value={fmt(activeDeals._sum.value ?? 0)}
          subtitle={`${activeDeals._count} active deals`}
          icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="bg-green-50"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrderCount}
          icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          color="bg-orange-50"
        />
        <StatCard
          title="Low Stock"
          value={lowStock.length}
          subtitle="items need reorder"
          icon={<svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customer.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{fmt(order.total)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pipeline by Stage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Deal Pipeline</h2>
            <Link href="/deals" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="p-5 space-y-3">
            {dealsByStage.length === 0 ? (
              <p className="text-sm text-gray-400">No deals yet</p>
            ) : (
              dealsByStage.map((d) => (
                <div key={d.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{stageLabels[d.stage] ?? d.stage}</span>
                    <span className="text-gray-900 font-medium">{d._count} · {fmt(d._sum.value ?? 0)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, ((d._sum.value ?? 0) / Math.max(activeDeals._sum.value ?? 1, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Customers</h2>
            <Link href="/customers" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topCustomers.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No customers yet</p>
            ) : (
              topCustomers.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.orderCount} orders</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{fmt(c.totalRevenue)}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Low Stock Alert</h2>
            <Link href="/products" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStock.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">All products are well stocked</p>
            ) : (
              lowStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${p.stockQty === 0 ? "text-red-600" : "text-orange-500"}`}>
                      {p.stockQty} in stock
                    </p>
                    <p className="text-xs text-gray-400">Reorder at {p.reorderQty}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
