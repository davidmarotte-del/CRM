import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  prospect: "bg-blue-100 text-blue-700",
};

const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const dealStageColors: Record<string, string> = {
  prospecting: "bg-gray-100 text-gray-600",
  qualification: "bg-blue-100 text-blue-700",
  proposal: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contacts: true,
      deals: {
        include: { assignedTo: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!customer) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const totalRevenue = customer.orders
    .filter((o) => ["delivered", "shipped"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customers" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[customer.status] ?? "bg-gray-100 text-gray-600"}`}>
              {customer.status}
            </span>
          </div>
          {customer.industry && <p className="text-gray-500 text-sm mt-0.5">{customer.industry}</p>}
        </div>
        <Link href={`/customers/${id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Info</h2>
            <dl className="space-y-3">
              {customer.email && (
                <div>
                  <dt className="text-xs text-gray-400">Email</dt>
                  <dd className="text-sm text-gray-900">{customer.email}</dd>
                </div>
              )}
              {customer.phone && (
                <div>
                  <dt className="text-xs text-gray-400">Phone</dt>
                  <dd className="text-sm text-gray-900">{customer.phone}</dd>
                </div>
              )}
              {customer.website && (
                <div>
                  <dt className="text-xs text-gray-400">Website</dt>
                  <dd className="text-sm text-gray-900">{customer.website}</dd>
                </div>
              )}
              {(customer.city || customer.state) && (
                <div>
                  <dt className="text-xs text-gray-400">Location</dt>
                  <dd className="text-sm text-gray-900">
                    {[customer.address, customer.city, customer.state, customer.zipCode].filter(Boolean).join(", ")}
                  </dd>
                </div>
              )}
              {customer.creditLimit != null && (
                <div>
                  <dt className="text-xs text-gray-400">Credit Limit</dt>
                  <dd className="text-sm font-semibold text-gray-900">{fmt(customer.creditLimit)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{customer.orders.length}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{customer.deals.length}</p>
                <p className="text-xs text-gray-500">Deals</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center col-span-2">
                <p className="text-xl font-bold text-blue-700">{fmt(totalRevenue)}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Contacts</h2>
            {customer.contacts.length === 0 ? (
              <p className="text-sm text-gray-400">No contacts added</p>
            ) : (
              <ul className="space-y-3">
                {customer.contacts.map((c) => (
                  <li key={c.id}>
                    <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-gray-400">{c.title}</p>
                    {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                    {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {customer.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Deals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Deals</h2>
              <Link href={`/deals/new?customerId=${id}`} className="text-sm text-blue-600 hover:text-blue-700">+ New deal</Link>
            </div>
            {customer.deals.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No deals yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {customer.deals.map((d) => (
                  <Link key={d.id} href={`/deals/${d.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.title}</p>
                      <p className="text-xs text-gray-400">{d.assignedTo?.name ?? "Unassigned"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dealStageColors[d.stage] ?? "bg-gray-100 text-gray-600"}`}>
                        {d.stage.replace("_", " ")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{fmt(d.value)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Orders</h2>
              <Link href={`/orders/new?customerId=${id}`} className="text-sm text-blue-600 hover:text-blue-700">+ New order</Link>
            </div>
            {customer.orders.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No orders yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {customer.orders.map((o) => (
                  <Link key={o.id} href={`/orders/${o.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{o.orderNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(o.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColors[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {o.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{fmt(o.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            </div>
            {customer.activities.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No activities yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {customer.activities.map((a) => (
                  <div key={a.id} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">{a.type}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${a.status === "done" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mt-0.5">{a.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
