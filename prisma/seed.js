const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.event.count();
  if (existing > 0) return;

  await prisma.event.create({
    data: {
      name: "Sample Event",
      date: new Date("2026-12-20"),
      seats: {
        create: Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => ({
            seatNumber: `${String.fromCharCode(65 + r)}${c + 1}`,
            row: String.fromCharCode(65 + r),
            column: c + 1,
          })),
        ).flat(),
      },
    },
  });
}

main().finally(() => prisma.$disconnect());
