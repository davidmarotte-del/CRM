import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  });
  if (!po) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/purchase-orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{po.poNumber}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[po.status] ?? "bg-gray-100 text-gray-600"}`}>
              {po.status}
            </span>
          </div>
          <Link href={`/suppliers/${po.supplierId}`} className="text-sm text-blue-600 hover:text-blue-700 mt-0.5">
            {po.supplier.name}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-400">Order Date</p>
          <p className="text-sm font-medium mt-0.5">{new Date(po.orderDate).toLocaleDateString()}</p>
        </div>
        {po.expectedDate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Expected Delivery</p>
            <p className="text-sm font-medium mt-0.5">{new Date(po.expectedDate).toLocaleDateString()}</p>
          </div>
        )}
        {po.receivedDate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Received</p>
            <p className="text-sm font-medium mt-0.5">{new Date(po.receivedDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Items</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-2.5">Product</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-2.5">Qty</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-2.5">Unit Cost</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-2.5">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {po.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{item.product.sku}</p>
                </td>
                <td className="px-5 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                <td className="px-5 py-3 text-sm text-right text-gray-600">{fmt(item.unitCost)}</td>
                <td className="px-5 py-3 text-sm font-medium text-right text-gray-900">{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td colSpan={3} className="px-5 py-3 text-sm font-bold text-right text-gray-900">Total</td>
              <td className="px-5 py-3 text-base font-bold text-right text-gray-900">{fmt(po.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
