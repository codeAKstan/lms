import { logger } from '@/lib/logger'
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export const revalidate = 60;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.getAll("category");
    const levels = searchParams.getAll("level");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minDuration = searchParams.get("minDuration");
    const maxDuration = searchParams.get("maxDuration");
    const minRating = searchParams.get("minRating");
    const sort = searchParams.get("sort"); // "newest" | "trending" | "featured"
    const limit = searchParams.get("limit");

    const pageParam = searchParams.get("page");
    
    // Pagination defaults
    const take = limit ? parseInt(limit) : 20;
    const page = pageParam ? parseInt(pageParam) : 1;
    const skip = (page - 1) * take;

    const cacheKey = `api:courses:${request.url.split('?')[1] || 'all'}`;

    if (redis) {
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return NextResponse.json(cachedData);
            }
        } catch (error) {
            logger.error({ error }, '');
            // Non-fatal, proceed to DB
        }
    }

    // Build the where clause
    const where: Prisma.CourseWhereInput = {
        published: true,
        deletedAt: null,
    };

    if (categories.length > 0 && !categories.includes("All")) {
        where.category = { in: categories };
    }

    if (levels.length > 0 && !levels.includes("All Levels")) {
        where.level = { in: levels };
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (minPrice) where.price = { ...where.price as object, gte: parseInt(minPrice) };
    if (maxPrice) where.price = { ...where.price as object, lte: parseInt(maxPrice) };

    if (minDuration) where.totalHours = { ...where.totalHours as object, gte: parseInt(minDuration) };
    if (maxDuration) where.totalHours = { ...where.totalHours as object, lte: parseInt(maxDuration) };

    if (minRating) where.rating = { gte: parseFloat(minRating) };

    // Build the orderBy
    let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "trending") orderBy = { studentCount: "desc" };
    else if (sort === "featured") orderBy = { featured: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    // "newest" is the default (createdAt desc)

    try {
        // Run count and query in parallel
        const [totalItems, courses] = await prisma.$transaction([
            prisma.course.count({ where }),
            prisma.course.findMany({
                where,
                orderBy,
                skip,
                take,
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    subtitle: true,
                    thumbnail: true,
                    price: true,
                    originalPrice: true,
                    currency: true,
                    rating: true,
                    studentCount: true,
                    totalHours: true,
                    lectures: true,
                    level: true,
                    difficulty: true,
                    category: true,
                    language: true,
                    published: true,
                    featured: true,
                    bestseller: true,
                    trending: true,
                    learningOutcomes: true,
                    createdAt: true,
                    instructor: {
                        select: {
                            name: true,
                            avatar: true,
                        },
                    },
                },
            }),
        ]);

        const responseData = {
            data: courses,
            metadata: {
                totalItems,
                totalPages: Math.ceil(totalItems / take),
                currentPage: page,
                limit: take
            }
        };

        if (redis) {
            try {
                // Cache for 5 minutes (300 seconds)
                await redis.setex(cacheKey, 300, responseData);
            } catch (error) {
                logger.error({ error }, '');
            }
        }

        return NextResponse.json(responseData, {
            headers: {
                // Public cache for 5 minutes, stale-while-revalidate for an hour
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
            }
        });
    } catch (error) {
        logger.error({ error }, '');
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}


