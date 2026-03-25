import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contacts: true,
      deals: { include: { assignedTo: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const customer = await prisma.customer.update({ where: { id }, data: body });
  return NextResponse.json(customer);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
