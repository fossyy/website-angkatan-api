import fs from "fs";
import readline from "readline";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const directory_name = "schema";

async function tanya(pertanyaan) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(pertanyaan, (jawaban) => {
      rl.close();
      resolve(jawaban.trim());
    });
  });
}

async function migrate() {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  await client.connect();

  let filenames = [];
  try {
    filenames = fs.readdirSync(directory_name);
    console.log("File schema yang ditemukan:", filenames);
  } catch (err) {
    console.error("Gagal membaca folder schema:", err);
    await client.end();
    process.exit(1);
  }

  const reset = await tanya(
    "Apakah ingin menghapus semua tabel sebelum migrasi? (yes/NO): "
  );

  if (reset.toLowerCase() === "yes") {
    const konfirmasi = await tanya(
      "Ketik 'BENER BANG!!!' untuk konfirmasi penghapusan semua tabel: "
    );
    if (konfirmasi === "BENER BANG!!!") {
      console.log("Menghapus tabel berdasarkan nama file...");
      for (const schema of filenames) {
        const tableName = schema.replace(".sql", "");
        const dropQuery = `DROP TABLE IF EXISTS public.${tableName} CASCADE;`;
        try {
          await client.query(dropQuery);
          console.log(`Tabel ${tableName} berhasil dihapus`);
        } catch (err) {
          console.error(`Gagal menghapus tabel ${tableName}:`, err);
        }
      }
      console.log("Semua tabel berhasil dihapus.");
    } else {
      console.log("Konfirmasi salah. Proses reset dibatalkan.");
    }
  } else {
    console.log("Pilihan default (NO). Tidak menghapus tabel apa pun.");
  }

  for (const schema of filenames) {
    const filepath = `${directory_name}/${schema}`;
    console.log(`Menjalankan migrasi: ${filepath}`);

    const sql = fs.readFileSync(filepath, "utf8");

    try {
      await client.query(sql);
      console.log(`Migrasi untuk ${schema} selesai.`);
    } catch (err) {
      console.error(`Gagal menjalankan migrasi ${schema}:`, err);
    }
  }

  await client.end();
  console.log("Semua migrasi selesai dijalankan.");
}

migrate().catch((err) => {
  console.error("Terjadi kesalahan saat menjalankan migrasi:", err);
  process.exit(1);
});
