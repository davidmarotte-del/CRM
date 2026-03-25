import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      AND: [
        search ? { OR: [{ name: { contains: search } }, { sku: { contains: search } }] } : {},
        category ? { category } : {},
      ],
    },
    include: { supplier: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = await prisma.product.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}
