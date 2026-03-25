import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search = "", category = "" } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        AND: [
          search ? { OR: [{ name: { contains: search } }, { sku: { contains: search } }] } : {},
          category ? { category } : {},
        ],
      },
      include: { supplier: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} active products</p>
        </div>
        <Link href="/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Add Product
        </Link>
      </div>

      <form className="flex gap-3 mb-6">
        <input name="search" defaultValue={search} placeholder="Search by name or SKU..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72" />
        <select name="category" defaultValue={category}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Categories</option>
          {categories.map((c) => c.category && (
            <option key={c.category} value={c.category}>{c.category}</option>
          ))}
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
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">SKU</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Supplier</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Cost</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Price</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No products found.{" "}
                  <Link href="/products/new" className="text-blue-600 hover:underline">Add your first product</Link>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-gray-500">{p.sku}</td>
                  <td className="px-5 py-3">
                    <Link href={`/products/${p.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{p.category ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{p.supplier?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{fmt(p.costPrice)}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{fmt(p.salePrice)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-medium ${p.stockQty <= p.reorderQty ? "text-red-600" : "text-gray-900"}`}>
                      {p.stockQty} {p.unit}
                    </span>
                    {p.stockQty <= p.reorderQty && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Low</span>
                    )}
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
