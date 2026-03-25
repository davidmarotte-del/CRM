import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { supplier: true },
  });
  if (!product) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const margin = product.costPrice > 0
    ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
    : "N/A";

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-500 text-sm font-mono">{product.sku}</p>
        </div>
        <Link href={`/products/${id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-1">Cost Price</p>
          <p className="text-2xl font-bold text-gray-900">{fmt(product.costPrice)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-1">Sale Price</p>
          <p className="text-2xl font-bold text-blue-600">{fmt(product.salePrice)}</p>
        </div>
        <div className={`rounded-xl shadow-sm border p-5 ${product.stockQty <= product.reorderQty ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
          <p className="text-xs text-gray-400 mb-1">Stock</p>
          <p className={`text-2xl font-bold ${product.stockQty <= product.reorderQty ? "text-red-600" : "text-gray-900"}`}>
            {product.stockQty} <span className="text-sm font-normal">{product.unit}</span>
          </p>
          {product.stockQty <= product.reorderQty && (
            <p className="text-xs text-red-500 mt-1">Reorder needed (min: {product.reorderQty})</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-1">Margin</p>
          <p className="text-2xl font-bold text-green-600">{margin}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-xs text-gray-400">Category</dt><dd className="text-sm">{product.category ?? "—"}</dd></div>
          <div><dt className="text-xs text-gray-400">Unit</dt><dd className="text-sm">{product.unit}</dd></div>
          <div><dt className="text-xs text-gray-400">Supplier</dt>
            <dd className="text-sm">
              {product.supplier ? (
                <Link href={`/suppliers/${product.supplier.id}`} className="text-blue-600 hover:underline">
                  {product.supplier.name}
                </Link>
              ) : "—"}
            </dd>
          </div>
          <div><dt className="text-xs text-gray-400">Status</dt>
            <dd className="text-sm"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{product.isActive ? "Active" : "Inactive"}</span></dd>
          </div>
        </dl>
        {product.description && (
          <div className="mt-4">
            <dt className="text-xs text-gray-400 mb-1">Description</dt>
            <dd className="text-sm text-gray-600 whitespace-pre-wrap">{product.description}</dd>
          </div>
        )}
      </div>
    </div>
  );
}
