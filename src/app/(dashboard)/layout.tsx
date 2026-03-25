import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="ml-64 flex-1 bg-gray-50 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
