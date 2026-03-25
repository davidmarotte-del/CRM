import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    customerCount,
    supplierCount,
    productCount,
    activeDeals,
    pendingOrders,
    recentOrders,
    dealsByStage,
    topCustomers,
    lowStock,
  ] = await Promise.all([
    prisma.customer.count({ where: { status: "active" } }),
    prisma.supplier.count({ where: { status: "active" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.deal.aggregate({
      where: { stage: { notIn: ["closed_won", "closed_lost"] } },
      _sum: { value: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.deal.groupBy({
      by: ["stage"],
      _count: true,
      _sum: { value: true },
    }),
    prisma.customer.findMany({
      take: 5,
      include: {
        orders: { select: { total: true } },
        _count: { select: { orders: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { stockQty: "asc" },
      take: 5,
      select: { id: true, name: true, sku: true, stockQty: true, reorderQty: true },
    }),
  ]);

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentRevenue = await prisma.order.findMany({
    where: {
      status: { in: ["delivered", "shipped"] },
      orderDate: { gte: sixMonthsAgo },
    },
    select: { total: true, orderDate: true },
  });

  const monthlyRevenue: Record<string, number> = {};
  recentRevenue.forEach((o) => {
    const key = o.orderDate.toISOString().slice(0, 7);
    monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + o.total;
  });

  const topCustomersWithRevenue = topCustomers
    .map((c) => ({
      id: c.id,
      name: c.name,
      orderCount: c._count.orders,
      totalRevenue: c.orders.reduce((sum, o) => sum + o.total, 0),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return NextResponse.json({
    stats: {
      customers: customerCount,
      suppliers: supplierCount,
      products: productCount,
      activeDealValue: activeDeals._sum.value ?? 0,
      activeDealCount: activeDeals._count,
      pendingOrders,
    },
    recentOrders,
    dealsByStage,
    topCustomers: topCustomersWithRevenue,
    lowStock: lowStock.filter((p) => p.stockQty <= p.reorderQty),
    monthlyRevenue,
  });
}
