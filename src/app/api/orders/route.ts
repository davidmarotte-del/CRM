import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        status ? { status } : {},
        search ? { OR: [{ orderNumber: { contains: search } }, { customer: { name: { contains: search } } }] } : {},
      ],
    },
    include: {
      customer: { select: { name: true } },
      assignedTo: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Generate order number
  const count = await prisma.order.count();
  const orderNumber = `SO-${String(count + 1001).padStart(5, "0")}`;
  const order = await prisma.order.create({
    data: { ...body, orderNumber },
    include: { customer: { select: { name: true } } },
  });
  return NextResponse.json(order, { status: 201 });
}
