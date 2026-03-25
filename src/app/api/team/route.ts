import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, department: true, isActive: true, createdAt: true,
      _count: { select: { assignedDeals: true, assignedOrders: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hashed = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: { ...body, password: hashed },
    select: { id: true, name: true, email: true, role: true, department: true },
  });
  return NextResponse.json(user, { status: 201 });
}
