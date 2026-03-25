import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      contacts: true,
      products: { where: { isActive: true }, take: 20 },
      purchaseOrders: { orderBy: { createdAt: "desc" }, take: 10 },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(supplier);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const supplier = await prisma.supplier.update({ where: { id }, data: body });
  return NextResponse.json(supplier);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.supplier.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
