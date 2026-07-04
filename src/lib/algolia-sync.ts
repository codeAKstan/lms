import { prisma } from '@/lib/prisma';
import algoliasearch from 'algoliasearch';
import { logger } from '@/lib/logger';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

/**
 * Synchronizes all published courses from the Prisma database to Algolia.
 * This performs a full replacement of the index, ensuring that unpublished or deleted courses
 * are removed, and new/updated courses are added.
 */
export async function syncAllCoursesToAlgolia() {
    console.log("syncAllCoursesToAlgolia: START");
    try {
        if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
            console.log("Missing credentials!");
            logger.warn('Algolia credentials missing in environment. Skipping sync.');
            return { success: false, error: 'Algolia credentials missing' };
        }

        console.log("Init Algolia client...");
        const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
        const index = client.initIndex('courses');

        console.log("Fetching courses from Prisma...");
        // Fetch all published courses
        const courses = await prisma.course.findMany({
            where: {
                published: true,
                deletedAt: null
            },
            select: {
                id: true,
                title: true,
                description: true,
                subtitle: true,
                slug: true,
                price: true,
                category: true,
                level: true,
                language: true,
                rating: true,
                studentCount: true,
                thumbnail: true,
                totalHours: true,
                instructor: {
                    select: {
                        name: true
                    }
                }
            }
        });

        console.log(`Found ${courses.length} courses. Mapping to Algolia objects...`);

        // Map to Algolia objects with categorical duration
        const algoliaObjects = courses.map(course => {
            let durationCategory = "Under 4 weeks";
            if (course.totalHours >= 4 && course.totalHours <= 8) durationCategory = "4-8 weeks";
            else if (course.totalHours > 8) durationCategory = "8+ weeks";

            return {
                objectID: course.id,
                title: course.title,
                description: course.description,
                subtitle: course.subtitle,
                slug: course.slug,
                price: Number(course.price) || 0,
                category: course.category,
                level: course.level,
                duration: durationCategory,
                language: course.language,
                rating: Number(course.rating) || 0,
                studentCount: course.studentCount,
                thumbnail: course.thumbnail,
                instructorName: course.instructor?.name || "Unknown Instructor"
            };
        });

        console.log("Saving objects to Algolia...");
        // Use saveObjects to update existing and add new
        await index.saveObjects(algoliaObjects);
        
        console.log("Save complete!");

        logger.info(`Successfully synced ${algoliaObjects.length} courses to Algolia.`);
        return { success: true, count: algoliaObjects.length };
    } catch (error) {
        console.error('Failed to sync courses to Algolia:', error);
        logger.error({ error }, 'Failed to sync courses to Algolia');
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
