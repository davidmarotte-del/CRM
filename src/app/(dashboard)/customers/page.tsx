import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  prospect: "bg-blue-100 text-blue-700",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search = "", status = "" } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: {
      AND: [
        search ? { name: { contains: search } } : {},
        status ? { status } : {},
      ],
    },
    include: { _count: { select: { orders: true, deals: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} total</p>
        </div>
        <Link
          href="/customers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Customer
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search customers..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Filter
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
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Orders</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Deals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No customers found.{" "}
                  <Link href="/customers/new" className="text-blue-600 hover:underline">
                    Add your first customer
                  </Link>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${c.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {c.name}
                    </Link>
                    {c.industry && <p className="text-xs text-gray-400">{c.industry}</p>}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c.email ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c.city ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c._count.orders}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c._count.deals}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
