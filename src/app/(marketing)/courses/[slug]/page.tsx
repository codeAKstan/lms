import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CourseLandingClient from './CourseLandingClient';

// Helper to fetch directly from DB/API
async function getCourse(slug: string) {
    // Note: Since this is Server Component, we can fetch from DB directly if in same project, 
    // or use absolute URL to API. 
    // Using Prisma for performance/simplicity in Server Component

    const course = await prisma.course.findFirst({
        where: {
            slug,
            deletedAt: null
        },
        include: {
            instructor: {
                select: { name: true, bio: true, avatar: true }
            },
            modules: {
                include: {
                    lessons: {
                        select: { id: true, title: true, duration: true, isFree: true, videoUrl: true }
                    }
                }
            },
            reviews: {
                include: {
                    user: {
                        select: { name: true, avatar: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return course;
}

// Update type definition for next.js 15+
type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const course = await getCourse(slug);

    if (!course) {
        return {
            title: 'Course Not Found',
        };
    }

    return {
        title: course.title,
        description: course.description,
        openGraph: {
            title: course.title,
            description: course.description,
            images: [course.thumbnail || '/og-course-placeholder.jpg'],
            type: 'article',
        },
    };
}

export default async function CourseLandingPage({ params }: Props) {
    const { slug } = await params;
    const course = await getCourse(slug);

    if (!course) {
        notFound();
    }

    // Pass data as initialCourse to hydration
    return <CourseLandingClient slug={slug} initialCourse={course} />;
}
