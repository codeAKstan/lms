const { Client } = require('pg');
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

if (!url) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

// Switch to Session Mode (5432)
url = url.replace(':6543', ':5432').replace('?pgbouncer=true', '');
console.log("Connecting to:", url.replace(/:[^:]*@/, ':****@'));

const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await client.connect();
        console.log("Connected successfully.");

        console.log("Checking for missing columns...");

        // Check if columns exist
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'courses' AND column_name IN ('totalHours', 'lectures');
        `);

        const existingColumns = res.rows.map(r => r.column_name);
        console.log("Existing columns found:", existingColumns);

        if (!existingColumns.includes('totalHours')) {
            console.log("Adding 'totalHours' column...");
            await client.query(`ALTER TABLE "courses" ADD COLUMN "totalHours" INTEGER NOT NULL DEFAULT 0;`);
            console.log("Added 'totalHours'.");
        } else {
            console.log("'totalHours' already exists.");
        }

        if (!existingColumns.includes('lectures')) {
            console.log("Adding 'lectures' column...");
            await client.query(`ALTER TABLE "courses" ADD COLUMN "lectures" INTEGER NOT NULL DEFAULT 0;`);
            console.log("Added 'lectures'.");
        } else {
            console.log("'lectures' already exists.");
        }

        console.log("Migration complete!");

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.jsend();
    }
}

migrate();
