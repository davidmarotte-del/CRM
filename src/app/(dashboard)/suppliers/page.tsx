import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;

  const suppliers = await prisma.supplier.findMany({
    where: search ? { name: { contains: search } } : {},
    include: { _count: { select: { products: true, purchaseOrders: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 text-sm mt-1">{suppliers.length} total</p>
        </div>
        <Link href="/suppliers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Add Supplier
        </Link>
      </div>

      <form className="flex gap-3 mb-6">
        <input name="search" defaultValue={search} placeholder="Search suppliers..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72" />
        <button type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Phone</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">City</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Products</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">POs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No suppliers found.{" "}
                  <Link href="/suppliers/new" className="text-blue-600 hover:underline">
                    Add your first supplier
                  </Link>
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/suppliers/${s.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s.email ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s.city ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s._count.products}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s._count.purchaseOrders}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
