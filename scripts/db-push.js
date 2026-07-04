const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const result = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"](.*)['"]$/, '$1');
            result[key] = value;
        }
    });
    return result;
}

const env = parseEnv(path.join(__dirname, '../.env'));
let url = env.DATABASE_URL;

if (url) {
    // Switch to Session Mode (5432) and remove pgbouncer param
    url = url.replace(':6543', ':5432').replace('?pgbouncer=true', '');
    console.log("Using Connection URL (masked):", url.replace(/:[^:]*@/, ':****@'));

    try {
        console.log("Running prisma db push...");
        execSync('npx prisma db push --accept-data-loss', {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: url }
        });
        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
} else {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}
