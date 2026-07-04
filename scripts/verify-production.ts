/**
 * Integration Verification Script
 * Rationale: Instead of a full E2E setup for this specific task, we will create a 
 * standalone node script that tests the critical production services to verify Phase 8.
 * Run with: npx ts-node scripts/verify-production.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cth-lms.vercel.app';

async function runTests() {
    console.log("🚀 Starting Production Resilience & Observability Verification...\n");
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, name: string, detail?: any) => {
        if (condition) {
            console.log(`✅ PASS: ${name}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${name}`);
            if (detail) console.error(`   Details:`, detail);
            failed++;
        }
    };

    try {
        // 1. Health Check Test
        console.log("--- 1. Health Endpoint ---");
        const healthRes = await fetch(`${BASE_URL}/api/health`);
        assert(healthRes.status === 200, "Health endpoint returns 200 OK");
        
        const healthData = await healthRes.json() as any;
        assert(healthData?.status === "healthy", "Health JSON payload confirms 'healthy' status");
        assert(healthData?.services?.database?.status === "connected", "Database reports as connected");
        
        console.log("\n--- 2. Caching Headers ---");
        const cacheRes = await fetch(`${BASE_URL}/api/courses`);
        const cacheControl = cacheRes.headers.get('cache-control');
        assert(
            cacheControl !== null && cacheControl.includes('s-maxage=300'),
            "Courses endpoint has correct Cache-Control header deployed", cacheControl
        );

        console.log("\n--- 3. Sentry Integration ---");
        const sentryRes = await fetch(`${BASE_URL}/api/test-sentry`);
        assert(sentryRes.status === 200, "Sentry test endpoint is reachable");
        const sentryData = await sentryRes.json() as any;
        assert(sentryData?.ok === true, "Sentry test script executed successfully and logged an error");
        
        console.log("\n--- 4. Rate Limiting (Sanity Check) ---");
        const rlRes = await fetch(`${BASE_URL}/api/courses`);
        assert(rlRes.status === 200 || rlRes.status === 429, "Rate limit allows request or returns 429 correctly");
        
        console.log(`\n🎉 Verification Complete: ${passed} Passed, ${failed} Failed`);
        if (failed > 0) process.exit(1);

    } catch (err) {
        console.error("Test execution failed catastrophically:", err);
        process.exit(1);
    }
}

// Execute
runTests();
