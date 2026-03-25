import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STAGES = [
  { key: "prospecting", label: "Prospecting", color: "bg-gray-100 border-gray-300" },
  { key: "qualification", label: "Qualification", color: "bg-blue-50 border-blue-300" },
  { key: "proposal", label: "Proposal", color: "bg-purple-50 border-purple-300" },
  { key: "negotiation", label: "Negotiation", color: "bg-orange-50 border-orange-300" },
  { key: "closed_won", label: "Won", color: "bg-green-50 border-green-300" },
  { key: "closed_lost", label: "Lost", color: "bg-red-50 border-red-300" },
];

const stageBadge: Record<string, string> = {
  prospecting: "bg-gray-100 text-gray-600",
  qualification: "bg-blue-100 text-blue-700",
  proposal: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "list" } = await searchParams;

  const deals = await prisma.deal.findMany({
    include: {
      customer: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const totalValue = deals
    .filter((d) => !["closed_lost"].includes(d.stage))
    .reduce((s, d) => s + d.value, 0);

  const dealsByStage = STAGES.reduce<Record<string, typeof deals>>((acc, s) => {
    acc[s.key] = deals.filter((d) => d.stage === s.key);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 text-sm mt-1">{deals.length} deals · Pipeline: {fmt(totalValue)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Link href="/deals?view=list"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view !== "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              List
            </Link>
            <Link href="/deals?view=kanban"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Kanban
            </Link>
          </div>
          <Link href="/deals/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Add Deal
          </Link>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage.key] ?? [];
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage.key} className={`flex-shrink-0 w-72 rounded-xl border-2 ${stage.color}`}>
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">{stage.label}</span>
                    <span className="text-xs text-gray-500">{stageDeals.length}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{fmt(stageValue)}</p>
                </div>
                <div className="p-3 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {stageDeals.map((d) => (
                    <Link key={d.id} href={`/deals/${d.id}`}
                      className="block bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{d.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{d.customer.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{d.assignedTo?.name ?? "Unassigned"}</span>
                        <span className="text-sm font-semibold text-gray-900">{fmt(d.value)}</span>
                      </div>
                    </Link>
                  ))}
                  {stageDeals.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">No deals</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Stage</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Value</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Probability</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Assigned To</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Expected Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No deals found.{" "}
                    <Link href="/deals/new" className="text-blue-600 hover:underline">Create your first deal</Link>
                  </td>
                </tr>
              ) : (
                deals.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/deals/${d.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {d.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{d.customer.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge[d.stage] ?? "bg-gray-100 text-gray-600"}`}>
                        {d.stage.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{fmt(d.value)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.probability}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{d.probability}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{d.assignedTo?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {d.expectedClose ? new Date(d.expectedClose).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
