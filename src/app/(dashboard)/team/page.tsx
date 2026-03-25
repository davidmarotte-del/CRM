import { prisma } from "@/lib/prisma";
import Link from "next/link";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-purple-100 text-purple-700",
  sales_rep: "bg-blue-100 text-blue-700",
  warehouse: "bg-yellow-100 text-yellow-700",
  finance: "bg-green-100 text-green-700",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Rep",
  warehouse: "Warehouse",
  finance: "Finance",
};

export default async function TeamPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, department: true, isActive: true,
      _count: { select: { assignedDeals: true, assignedOrders: true } },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const active = users.filter((u) => u.isActive).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm mt-1">{active} active members · {users.length} total</p>
        </div>
        <Link href="/team/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Add Member
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((u) => (
          <Link key={u.id} href={`/team/${u.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-lg ${u.isActive ? "bg-blue-600" : "bg-gray-400"}`}>
                {u.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                  {!u.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {roleLabels[u.role] ?? u.role}
                  </span>
                  {u.department && (
                    <span className="text-xs text-gray-400">{u.department}</span>
                  )}
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{u._count.assignedDeals}</p>
                    <p className="text-xs text-gray-400">Deals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{u._count.assignedOrders}</p>
                    <p className="text-xs text-gray-400">Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {users.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <p>No team members yet.</p>
            <Link href="/team/new" className="text-blue-600 hover:underline text-sm mt-2 block">Add first member</Link>
          </div>
        )}
      </div>
    </div>
  );
}
