"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";

export type UserResult = {
    id: string;
    name: string;
    email: string;
    role: string; // "STUDENT" | "INSTRUCTOR" | "ADMIN"
    createdAt: Date;
    status: "active" | "banned";
    coursesEnrolled: number;
    coursesCreated: number;
};

type GetUsersParams = {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
};

export async function getUsers({
    page = 1,
    limit = 10,
    search = "",
    role = "all",
}: GetUsersParams) {
    noStore();
    await requireRole('ADMIN');
    try {
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            AND: [
                search
                    ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } },
                        ],
                    }
                    : {},
                role && role !== "all"
                    ? { role: role.toUpperCase() as "STUDENT" | "INSTRUCTOR" | "ADMIN" }
                    : {},
            ],
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    isBanned: true,
                    _count: {
                        select: {
                            enrollments: true,
                            coursesCreated: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedUsers: UserResult[] = users.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.toLowerCase(),
            createdAt: user.createdAt,
            status: user.isBanned ? "banned" : "active",
            coursesEnrolled: user._count.enrollments,
            coursesCreated: user._count.coursesCreated,
        }));

        return {
            users: formattedUsers,
            total,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}

export async function toggleUserBan(userId: string, shouldBan: boolean) {
    await requireRole('ADMIN');
    try {
        await prisma.user.update({
             where: { id: userId },
             data: { isBanned: shouldBan },
         });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error toggling user ban:", error);
        return { success: false, error: "Failed to update user status" };
    }
}

export async function updateUserRole(userId: string, role: string) {
    await requireRole('ADMIN');
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: role.toUpperCase() as "STUDENT" | "INSTRUCTOR" | "ADMIN" },
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update role" };
    }
}
