import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage") ?? "";

  const deals = await prisma.deal.findMany({
    where: stage ? { stage } : {},
    include: {
      customer: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const deal = await prisma.deal.create({ data: body });
  return NextResponse.json(deal, { status: 201 });
}
