import { prisma } from "@/lib/prisma";
import Link from "next/link";

const typeColors: Record<string, string> = {
  call: "bg-blue-100 text-blue-700",
  email: "bg-purple-100 text-purple-700",
  meeting: "bg-green-100 text-green-700",
  note: "bg-gray-100 text-gray-600",
  task: "bg-orange-100 text-orange-700",
};

const typeIcons: Record<string, string> = {
  call: "📞",
  email: "✉️",
  meeting: "🤝",
  note: "📝",
  task: "✅",
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { type = "", status = "" } = await searchParams;

  const activities = await prisma.activity.findMany({
    where: {
      AND: [
        type ? { type } : {},
        status ? { status } : {},
      ],
    },
    include: {
      user: { select: { name: true } },
      customer: { select: { name: true, id: true } },
      deal: { select: { title: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-500 text-sm mt-1">{activities.length} activities</p>
        </div>
      </div>

      <form className="flex gap-3 mb-6">
        <select name="type" defaultValue={type}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="note">Note</option>
          <option value="task">Task</option>
        </select>
        <select name="status" defaultValue={status}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <button type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          Filter
        </button>
      </form>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No activities found</div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
              <div className="text-2xl flex-shrink-0 mt-0.5">{typeIcons[a.type] ?? "📌"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[a.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {a.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${a.status === "done" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {a.status}
                  </span>
                  {a.dueDate && (
                    <span className="text-xs text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 mt-1">{a.subject}</p>
                {a.body && <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{a.body}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                  {a.user && <span>{a.user.name}</span>}
                  {a.customer && (
                    <Link href={`/customers/${a.customer.id}`} className="text-blue-600 hover:underline">
                      {a.customer.name}
                    </Link>
                  )}
                  {a.deal && (
                    <Link href={`/deals/${a.deal.id}`} className="text-blue-600 hover:underline">
                      {a.deal.title}
                    </Link>
                  )}
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
