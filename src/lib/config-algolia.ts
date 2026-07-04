import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

async function configureAlgolia() {
    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
        console.error('Missing credentials');
        return;
    }

    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
    const index = client.initIndex('courses');

    console.log("Setting attributesForFaceting...");
    await index.setSettings({
        attributesForFaceting: [
            'category',
            'level',
            'duration' // Even if it doesn't exist yet, it's safe to add
        ]
    });
    console.log("Settings applied successfully!");
}

configureAlgolia();
