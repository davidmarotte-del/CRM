import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status = "", search = "" } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        status ? { status } : {},
        search ? { OR: [{ orderNumber: { contains: search } }, { customer: { name: { contains: search } } }] } : {},
      ],
    },
    include: {
      customer: { select: { name: true } },
      assignedTo: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const totalRevenue = orders
    .filter((o) => ["delivered", "shipped"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders · Revenue: {fmt(totalRevenue)}</p>
        </div>
        <Link href="/orders/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New Order
        </Link>
      </div>

      <form className="flex gap-3 mb-6">
        <input name="search" defaultValue={search} placeholder="Search orders..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72" />
        <select name="status" defaultValue={status}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          Filter
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Order #</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Items</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Total</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Assigned To</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No orders found.{" "}
                  <Link href="/orders/new" className="text-blue-600 hover:underline">Create your first order</Link>
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/orders/${o.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 font-mono">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-900">{o.customer.name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{o._count.items}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">{fmt(o.total)}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{o.assignedTo?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{new Date(o.orderDate).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
