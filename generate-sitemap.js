/**
 * generate-sitemap.js
 * Generate sitemap.xml otomatis: halaman statis + semua lokasi & berita dari Supabase.
 *
 * Cara pakai:
 * 1. npm install @supabase/supabase-js --save-dev  (kalau belum ada)
 * 2. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di bawah (sama seperti di .env project kamu)
 * 3. Jalankan: node generate-sitemap.js
 * 4. Ini akan membuat file public/sitemap.xml
 * 5. Jalankan npm run build seperti biasa — sitemap.xml otomatis ikut ke folder dist/
 *
 * Supaya otomatis tiap build, tambahkan ke package.json:
 *   "scripts": {
 *     "build": "node generate-sitemap.js && vite build"
 *   }
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// GANTI dengan URL & key Supabase kamu (sama seperti di file .env)
const SUPABASE_URL = "https://ibyyaaangdhzgmspwhvk.supabase.co";
const SUPABASE_ANON_KEY = "GANTI_DENGAN_ANON_KEY_KAMU";

const DOMAIN = "https://sigsenggreng.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const urls = [];

  // Halaman statis
  const halamanStatis = ["/", "/peta", "/kategori", "/tentang"];
  halamanStatis.forEach((path) => {
    urls.push({ loc: `${DOMAIN}${path}`, priority: path === "/" ? "1.0" : "0.8" });
  });

  // Halaman lokasi/potensi (butuh kategoriSlug + slug lokasi)
  const { data: lokasiList, error: errLokasi } = await supabase
    .from("lokasi")
    .select("slug, kategori_potensi ( slug )")
    .eq("status", "aktif")
    .eq("tampil_di_peta", true);

  if (errLokasi) {
    console.error("Gagal ambil data lokasi:", errLokasi.message);
  } else {
    (lokasiList || []).forEach((row) => {
      const kategoriSlug = row.kategori_potensi?.slug;
      if (kategoriSlug && row.slug) {
        urls.push({
          loc: `${DOMAIN}/potensi/${kategoriSlug}/${row.slug}`,
          priority: "0.7",
        });
      }
    });
  }

  // Halaman berita
  const { data: beritaList, error: errBerita } = await supabase
    .from("berita")
    .select("slug")
    .eq("status", "terbit");

  if (errBerita) {
    console.error("Gagal ambil data berita:", errBerita.message);
  } else {
    (beritaList || []).forEach((row) => {
      urls.push({ loc: `${DOMAIN}/berita/${row.slug}`, priority: "0.6" });
    });
  }

  // Susun XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  fs.writeFileSync("public/sitemap.xml", xml, "utf-8");
  console.log(`✓ sitemap.xml dibuat dengan ${urls.length} URL di public/sitemap.xml`);
}

main();