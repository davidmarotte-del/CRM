import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const poStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      contacts: true,
      products: { where: { isActive: true }, take: 20, orderBy: { name: "asc" } },
      purchaseOrders: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!supplier) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/suppliers" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${supplier.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
              {supplier.status}
            </span>
          </div>
        </div>
        <Link href={`/suppliers/${id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Info</h2>
            <dl className="space-y-3">
              {supplier.email && <div><dt className="text-xs text-gray-400">Email</dt><dd className="text-sm">{supplier.email}</dd></div>}
              {supplier.phone && <div><dt className="text-xs text-gray-400">Phone</dt><dd className="text-sm">{supplier.phone}</dd></div>}
              {supplier.website && <div><dt className="text-xs text-gray-400">Website</dt><dd className="text-sm">{supplier.website}</dd></div>}
              {supplier.paymentTerms && <div><dt className="text-xs text-gray-400">Payment Terms</dt><dd className="text-sm font-medium">{supplier.paymentTerms}</dd></div>}
              {supplier.city && <div><dt className="text-xs text-gray-400">Location</dt><dd className="text-sm">{[supplier.city, supplier.state].filter(Boolean).join(", ")}</dd></div>}
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Contacts ({supplier.contacts.length})</h2>
            {supplier.contacts.length === 0 ? (
              <p className="text-sm text-gray-400">No contacts</p>
            ) : (
              <ul className="space-y-3">
                {supplier.contacts.map((c) => (
                  <li key={c.id}>
                    <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                    {c.title && <p className="text-xs text-gray-400">{c.title}</p>}
                    {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Products ({supplier.products.length})</h2>
              <Link href={`/products/new?supplierId=${id}`} className="text-sm text-blue-600 hover:text-blue-700">+ Add product</Link>
            </div>
            {supplier.products.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No products</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {supplier.products.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku} · {p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{fmt(p.salePrice)}</p>
                      <p className="text-xs text-gray-400">Stock: {p.stockQty}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Purchase Orders</h2>
              <Link href={`/purchase-orders/new?supplierId=${id}`} className="text-sm text-blue-600 hover:text-blue-700">+ New PO</Link>
            </div>
            {supplier.purchaseOrders.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No purchase orders</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {supplier.purchaseOrders.map((po) => (
                  <Link key={po.id} href={`/purchase-orders/${po.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{po.poNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(po.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${poStatusColors[po.status] ?? "bg-gray-100"}`}>
                        {po.status}
                      </span>
                      <span className="text-sm font-medium">{fmt(po.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
