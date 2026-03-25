import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:/home/user/CRM/dev.db" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPw = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@distcrm.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@distcrm.com",
      password: adminPw,
      role: "admin",
      department: "Management",
    },
  });

  // Create team members
  const pw = await bcrypt.hash("password123", 10);
  const team = await Promise.all([
    prisma.user.upsert({
      where: { email: "sarah@distcrm.com" },
      update: {},
      create: { name: "Sarah Johnson", email: "sarah@distcrm.com", password: pw, role: "manager", department: "Sales", phone: "555-0101" },
    }),
    prisma.user.upsert({
      where: { email: "mike@distcrm.com" },
      update: {},
      create: { name: "Mike Davis", email: "mike@distcrm.com", password: pw, role: "sales_rep", department: "Sales", phone: "555-0102" },
    }),
    prisma.user.upsert({
      where: { email: "lisa@distcrm.com" },
      update: {},
      create: { name: "Lisa Chen", email: "lisa@distcrm.com", password: pw, role: "sales_rep", department: "Sales", phone: "555-0103" },
    }),
    prisma.user.upsert({
      where: { email: "tom@distcrm.com" },
      update: {},
      create: { name: "Tom Wilson", email: "tom@distcrm.com", password: pw, role: "warehouse", department: "Operations", phone: "555-0104" },
    }),
    prisma.user.upsert({
      where: { email: "anna@distcrm.com" },
      update: {},
      create: { name: "Anna Martinez", email: "anna@distcrm.com", password: pw, role: "finance", department: "Finance", phone: "555-0105" },
    }),
  ]);

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: "supplier-1" },
    update: {},
    create: {
      id: "supplier-1",
      name: "Pacific Wholesale Co.",
      email: "orders@pacificwholesale.com",
      phone: "800-555-0200",
      address: "1200 Industrial Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      status: "active",
      paymentTerms: "Net 30",
      notes: "Primary beverage supplier",
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { id: "supplier-2" },
    update: {},
    create: {
      id: "supplier-2",
      name: "Global Distribution Inc.",
      email: "supply@globaldist.com",
      phone: "800-555-0201",
      address: "500 Commerce Park",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      status: "active",
      paymentTerms: "Net 45",
      notes: "Electronics & accessories",
    },
  });

  const supplier3 = await prisma.supplier.upsert({
    where: { id: "supplier-3" },
    update: {},
    create: {
      id: "supplier-3",
      name: "East Coast Foods Ltd.",
      email: "procurement@ecfoods.com",
      phone: "800-555-0202",
      city: "New York",
      state: "NY",
      status: "active",
      paymentTerms: "Net 30",
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({ where: { sku: "BEV-001" }, update: {}, create: { sku: "BEV-001", name: "Premium Orange Juice 1L", category: "Beverages", unit: "case", costPrice: 18.50, salePrice: 28.00, stockQty: 250, reorderQty: 50, supplierId: supplier1.id } }),
    prisma.product.upsert({ where: { sku: "BEV-002" }, update: {}, create: { sku: "BEV-002", name: "Spring Water 500ml 24-pack", category: "Beverages", unit: "case", costPrice: 8.00, salePrice: 14.50, stockQty: 500, reorderQty: 100, supplierId: supplier1.id } }),
    prisma.product.upsert({ where: { sku: "BEV-003" }, update: {}, create: { sku: "BEV-003", name: "Energy Drink 250ml 24-pack", category: "Beverages", unit: "case", costPrice: 22.00, salePrice: 36.00, stockQty: 8, reorderQty: 50, supplierId: supplier1.id } }),
    prisma.product.upsert({ where: { sku: "FOOD-001" }, update: {}, create: { sku: "FOOD-001", name: "Mixed Nuts 500g", category: "Snacks", unit: "each", costPrice: 6.50, salePrice: 11.00, stockQty: 180, reorderQty: 30, supplierId: supplier3.id } }),
    prisma.product.upsert({ where: { sku: "FOOD-002" }, update: {}, create: { sku: "FOOD-002", name: "Protein Bar Box (12 units)", category: "Snacks", unit: "case", costPrice: 15.00, salePrice: 24.00, stockQty: 5, reorderQty: 40, supplierId: supplier3.id } }),
    prisma.product.upsert({ where: { sku: "ELEC-001" }, update: {}, create: { sku: "ELEC-001", name: "USB-C Cable 1m", category: "Electronics", unit: "each", costPrice: 3.50, salePrice: 8.99, stockQty: 400, reorderQty: 100, supplierId: supplier2.id } }),
    prisma.product.upsert({ where: { sku: "ELEC-002" }, update: {}, create: { sku: "ELEC-002", name: "Wireless Earbuds", category: "Electronics", unit: "each", costPrice: 22.00, salePrice: 49.99, stockQty: 75, reorderQty: 20, supplierId: supplier2.id } }),
    prisma.product.upsert({ where: { sku: "ELEC-003" }, update: {}, create: { sku: "ELEC-003", name: "Power Bank 10000mAh", category: "Electronics", unit: "each", costPrice: 18.00, salePrice: 39.99, stockQty: 12, reorderQty: 25, supplierId: supplier2.id } }),
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({ where: { id: "cust-1" }, update: {}, create: { id: "cust-1", name: "Metro Convenience Stores", email: "purchasing@metroconv.com", phone: "555-0301", city: "Seattle", state: "WA", industry: "Retail", status: "active", creditLimit: 50000, createdById: admin.id } }),
    prisma.customer.upsert({ where: { id: "cust-2" }, update: {}, create: { id: "cust-2", name: "Valley Hotels Group", email: "procurement@valleyhotels.com", phone: "555-0302", city: "Phoenix", state: "AZ", industry: "Hospitality", status: "active", creditLimit: 100000, createdById: team[0].id } }),
    prisma.customer.upsert({ where: { id: "cust-3" }, update: {}, create: { id: "cust-3", name: "FreshMart Supermarkets", email: "orders@freshmart.com", phone: "555-0303", city: "Denver", state: "CO", industry: "Grocery", status: "active", creditLimit: 75000, createdById: team[1].id } }),
    prisma.customer.upsert({ where: { id: "cust-4" }, update: {}, create: { id: "cust-4", name: "Sunrise Cafes", email: "info@sunrisecafes.com", phone: "555-0304", city: "Portland", state: "OR", industry: "Food Service", status: "active", createdById: team[2].id } }),
    prisma.customer.upsert({ where: { id: "cust-5" }, update: {}, create: { id: "cust-5", name: "TechHub Retail", email: "buy@techhub.com", phone: "555-0305", city: "San Francisco", state: "CA", industry: "Electronics Retail", status: "prospect", createdById: team[1].id } }),
    prisma.customer.upsert({ where: { id: "cust-6" }, update: {}, create: { id: "cust-6", name: "Airport Shops Inc.", email: "supply@airportshops.com", phone: "555-0306", city: "Dallas", state: "TX", industry: "Travel Retail", status: "active", creditLimit: 30000 } }),
  ]);

  // Create orders
  await prisma.order.upsert({
    where: { orderNumber: "SO-01001" },
    update: {},
    create: {
      orderNumber: "SO-01001",
      customerId: customers[0].id,
      assignedToId: team[1].id,
      status: "delivered",
      subtotal: 1120.00, tax: 89.60, total: 1209.60,
      items: { create: [
        { productId: products[0].id, quantity: 20, unitPrice: 28.00, discount: 0, total: 560.00 },
        { productId: products[1].id, quantity: 40, unitPrice: 14.50, discount: 0, total: 580.00 },
      ]},
    },
  });

  await prisma.order.upsert({
    where: { orderNumber: "SO-01002" },
    update: {},
    create: {
      orderNumber: "SO-01002",
      customerId: customers[1].id,
      assignedToId: team[0].id,
      status: "shipped",
      subtotal: 2400.00, tax: 192.00, total: 2592.00,
      items: { create: [
        { productId: products[1].id, quantity: 100, unitPrice: 14.50, discount: 0, total: 1450.00 },
        { productId: products[0].id, quantity: 34, unitPrice: 28.00, discount: 0, total: 952.00 },
      ]},
    },
  });

  await prisma.order.upsert({
    where: { orderNumber: "SO-01003" },
    update: {},
    create: {
      orderNumber: "SO-01003",
      customerId: customers[2].id,
      assignedToId: team[2].id,
      status: "pending",
      subtotal: 3500.00, tax: 280.00, total: 3780.00,
      items: { create: [
        { productId: products[0].id, quantity: 50, unitPrice: 28.00, discount: 0, total: 1400.00 },
        { productId: products[3].id, quantity: 100, unitPrice: 11.00, discount: 0, total: 1100.00 },
        { productId: products[5].id, quantity: 112, unitPrice: 8.99, discount: 0, total: 1006.88 },
      ]},
    },
  });

  await prisma.order.upsert({
    where: { orderNumber: "SO-01004" },
    update: {},
    create: {
      orderNumber: "SO-01004",
      customerId: customers[3].id,
      status: "confirmed",
      subtotal: 840.00, tax: 67.20, total: 907.20,
      items: { create: [
        { productId: products[0].id, quantity: 30, unitPrice: 28.00, discount: 0, total: 840.00 },
      ]},
    },
  });

  // Create deals
  await Promise.all([
    prisma.deal.upsert({ where: { id: "deal-1" }, update: {}, create: { id: "deal-1", title: "Annual Beverage Supply Contract", customerId: customers[0].id, assignedToId: team[1].id, stage: "negotiation", value: 85000, probability: 70, expectedClose: new Date("2026-04-30"), notes: "They want a 5% volume discount for annual commitment" } }),
    prisma.deal.upsert({ where: { id: "deal-2" }, update: {}, create: { id: "deal-2", title: "Hotel Chain Electronics Package", customerId: customers[1].id, assignedToId: team[0].id, stage: "proposal", value: 45000, probability: 50, expectedClose: new Date("2026-05-15"), notes: "50 rooms, need USB-C cables and power banks" } }),
    prisma.deal.upsert({ where: { id: "deal-3" }, update: {}, create: { id: "deal-3", title: "TechHub Electronics Distribution", customerId: customers[4].id, assignedToId: team[1].id, stage: "qualification", value: 120000, probability: 30, expectedClose: new Date("2026-06-30"), notes: "New prospect, need to understand their volume requirements" } }),
    prisma.deal.upsert({ where: { id: "deal-4" }, update: {}, create: { id: "deal-4", title: "FreshMart Q2 Snack Supply", customerId: customers[2].id, assignedToId: team[2].id, stage: "closed_won", value: 32000, probability: 100, notes: "Contract signed" } }),
    prisma.deal.upsert({ where: { id: "deal-5" }, update: {}, create: { id: "deal-5", title: "Airport Shops Seasonal Bundle", customerId: customers[5].id, stage: "prospecting", value: 18000, probability: 15, expectedClose: new Date("2026-07-01") } }),
  ]);

  // Create activities (only if none exist)
  const activityCount = await prisma.activity.count();
  if (activityCount === 0) {
    await prisma.activity.createMany({
      data: [
        { type: "call", subject: "Discussed annual contract terms", status: "done", customerId: customers[0].id, dealId: "deal-1", userId: team[1].id, doneAt: new Date("2026-03-20") },
        { type: "email", subject: "Sent product catalog to TechHub", status: "done", customerId: customers[4].id, dealId: "deal-3", userId: team[1].id },
        { type: "meeting", subject: "Site visit - Hotel chain", status: "open", customerId: customers[1].id, dealId: "deal-2", userId: team[0].id, dueDate: new Date("2026-03-28") },
        { type: "task", subject: "Prepare Q2 proposal for FreshMart", status: "open", customerId: customers[2].id, userId: team[2].id, dueDate: new Date("2026-03-27") },
        { type: "note", subject: "Customer requested extended payment terms", status: "done", customerId: customers[0].id, userId: team[1].id },
      ],
    });
  }

  console.log("✅ Seed complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:   admin@distcrm.com / admin123");
  console.log("  Manager: sarah@distcrm.com / password123");
  console.log("  Sales:   mike@distcrm.com  / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
