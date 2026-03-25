import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pos = await prisma.purchaseOrder.findMany({
    include: {
      supplier: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = await prisma.purchaseOrder.count();
  const poNumber = `PO-${String(count + 1001).padStart(5, "0")}`;
  const po = await prisma.purchaseOrder.create({
    data: { ...body, poNumber },
  });
  return NextResponse.json(po, { status: 201 });
}
