import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const suppliers = await prisma.supplier.findMany({
    where: search ? { name: { contains: search } } : {},
    include: { _count: { select: { products: true, purchaseOrders: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supplier = await prisma.supplier.create({ data: body });
  return NextResponse.json(supplier, { status: 201 });
}
