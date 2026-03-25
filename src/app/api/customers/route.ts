import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      AND: [
        search ? { name: { contains: search } } : {},
        status ? { status } : {},
      ],
    },
    include: {
      _count: { select: { orders: true, deals: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const customer = await prisma.customer.create({ data: body });
  return NextResponse.json(customer, { status: 201 });
}
