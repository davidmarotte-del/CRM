import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function PurchaseOrdersPage() {
  const pos = await prisma.purchaseOrder.findMany({
    include: {
      supplier: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{pos.length} total</p>
        </div>
        <Link href="/purchase-orders/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New PO
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">PO #</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Supplier</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Items</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Total</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Order Date</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Expected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No purchase orders found.{" "}
                  <Link href="/purchase-orders/new" className="text-blue-600 hover:underline">Create one</Link>
                </td>
              </tr>
            ) : (
              pos.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/purchase-orders/${po.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 font-mono">
                      {po.poNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-900">{po.supplier.name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[po.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{po._count.items}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">{fmt(po.total)}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{new Date(po.orderDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
