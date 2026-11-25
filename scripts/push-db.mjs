// scripts/push-db.mjs
import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

// 1. Ambil DATABASE_URL dari .env.local atau environment
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=')) {
        dbUrl = trimmed.slice('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
        break;
      }
    }
  }
}

if (!dbUrl || dbUrl.includes('username:password') || dbUrl.includes('ep-xxxx')) {
  console.error('\n\x1b[31m[ERROR] DATABASE_URL belum diatur dengan benar di .env.local!\x1b[0m');
  console.log('Buka file .env.local dan ganti nilainya dengan Connection String dari dashboard Neon Anda.\n');
  process.exit(1);
}

// 2. Baca file SQL
const sqlPath = path.resolve(process.cwd(), 'supabase', 'neon_setup.sql');
if (!fs.existsSync(sqlPath)) {
  console.error(`\x1b[31m[ERROR] File ${sqlPath} tidak ditemukan!\x1b[0m`);
  process.exit(1);
}

const sqlRaw = fs.readFileSync(sqlPath, 'utf-8');

// 3. Pecah statement SQL secara cerdas (menjaga blok DO $$ dan fungsi plpgsql)
function parseStatements(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;

  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) continue; // Lewati baris komentar

    const matches = line.match(/\$\$/g);
    if (matches && matches.length % 2 === 1) {
      inDollarQuote = !inDollarQuote;
    }

    current += line + '\n';

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  if (current.trim().length > 0) {
    statements.push(current.trim());
  }

  return statements;
}

const statements = parseStatements(sqlRaw);
console.log(`\n\x1b[36m-> Menghubungkan ke Neon Database...\x1b[0m`);
console.log(`\x1b[36m-> Ditemukan ${statements.length} perintah SQL (Tabel, Prosedur, dan Data Realistis UMKM)...\x1b[0m\n`);

const sql = neon(dbUrl);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt
    .split('\n')[0]
    .replace(/\s+/g, ' ')
    .slice(0, 50);

  try {
    process.stdout.write(`\r[${i + 1}/${statements.length}] Menjalankan: ${preview}... `);
    await sql.query(stmt);
    successCount++;
  } catch (err) {
    failCount++;
    console.error(`\n\x1b[33m[PERINGATAN pada langkah ${i + 1}]\x1b[0m: ${err.message || err}`);
  }
}

if (failCount === 0) {
  console.log(`\n\n\x1b[32m[SUKSES] Seluruh ${successCount} perintah berhasil dieksekusi 100% tanpa error!\x1b[0m`);
  console.log('\x1b[32mDatabase Neon siap digunakan dengan data realistis UMKM Jawa Timur.\x1b[0m\n');
} else {
  console.log(`\n\n\x1b[33m[SELESAI] ${successCount} berhasil, ${failCount} ada catatan.\x1b[0m\n`);
}
