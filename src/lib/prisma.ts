import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getDbPath() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  return url.startsWith("file:") ? url : `file:${url}`;
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: getDbPath() });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
