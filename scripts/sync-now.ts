import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { syncAllCoursesToAlgolia } from '../src/lib/algolia-sync';

async function run() {
    console.log("Starting sync...");
    const res = await syncAllCoursesToAlgolia();
    console.log("Result:", res);
    process.exit(0);
}

run();
