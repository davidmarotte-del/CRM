import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      assignedTo: { select: { id: true, name: true } },
      items: { include: { product: { select: { id: true, name: true, sku: true } } } },
    },
  });
  if (!order) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
              {order.status}
            </span>
          </div>
          <Link href={`/customers/${order.customerId}`} className="text-sm text-blue-600 hover:text-blue-700 mt-0.5">
            {order.customer.name}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-400">Order Date</p>
          <p className="text-sm font-medium mt-0.5">{new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        {order.deliveryDate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Delivery Date</p>
            <p className="text-sm font-medium mt-0.5">{new Date(order.deliveryDate).toLocaleDateString()}</p>
          </div>
        )}
        {order.assignedTo && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Assigned To</p>
            <p className="text-sm font-medium mt-0.5">{order.assignedTo.name}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Line Items</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-2.5">Product</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-2.5">Qty</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-2.5">Unit Price</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-2.5">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{item.product.sku}</p>
                </td>
                <td className="px-5 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                <td className="px-5 py-3 text-sm text-right text-gray-600">{fmt(item.unitPrice)}</td>
                <td className="px-5 py-3 text-sm font-medium text-right text-gray-900">{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-100 bg-gray-50">
              <td colSpan={3} className="px-5 py-2.5 text-sm text-right text-gray-500">Subtotal</td>
              <td className="px-5 py-2.5 text-sm font-medium text-right">{fmt(order.subtotal)}</td>
            </tr>
            {order.tax > 0 && (
              <tr className="border-t border-gray-50">
                <td colSpan={3} className="px-5 py-2.5 text-sm text-right text-gray-500">Tax</td>
                <td className="px-5 py-2.5 text-sm text-right">{fmt(order.tax)}</td>
              </tr>
            )}
            {order.discount > 0 && (
              <tr className="border-t border-gray-50">
                <td colSpan={3} className="px-5 py-2.5 text-sm text-right text-gray-500">Discount</td>
                <td className="px-5 py-2.5 text-sm text-right text-red-600">-{fmt(order.discount)}</td>
              </tr>
            )}
            <tr className="border-t border-gray-200">
              <td colSpan={3} className="px-5 py-3 text-sm font-bold text-right text-gray-900">Total</td>
              <td className="px-5 py-3 text-base font-bold text-right text-gray-900">{fmt(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {(order.shippingAddr || order.notes) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {order.shippingAddr && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Shipping Address</p>
              <p className="text-sm">{order.shippingAddr}</p>
            </div>
          )}
          {order.notes && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
