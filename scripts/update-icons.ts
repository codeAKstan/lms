import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.focusArea.updateMany({
        where: { title: { contains: "Tech Education" } },
        data: { icon: "GraduationCap" }
    });
    console.log("Updated Tech Education");

    await prisma.focusArea.updateMany({
        where: { title: { contains: "Digital Skills" } },
        data: { icon: "Code2" }
    });
    console.log("Updated Digital Skills");
}

main().catch(console.error).finally(() => prisma.$disconnect());
