import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";

  const activities = await prisma.activity.findMany({
    where: {
      AND: [
        type ? { type } : {},
        status ? { status } : {},
      ],
    },
    include: {
      user: { select: { name: true } },
      customer: { select: { name: true } },
      deal: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const activity = await prisma.activity.create({ data: body });
  return NextResponse.json(activity, { status: 201 });
}
