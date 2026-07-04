import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { syncAllCoursesToAlgolia } from '@/lib/algolia-sync'

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // Enforce Admin Access
        await requireRole('ADMIN');

        const result = await syncAllCoursesToAlgolia();

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Synced ${result.count} courses to Algolia` 
        })

    } catch (error: unknown) {
        logger.error({ error }, '')
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
    }
}

