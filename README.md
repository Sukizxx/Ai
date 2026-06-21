# NeiroAI

Web AI multi-model dengan tema hitam/putih/abu-abu, animasi smooth (Framer Motion), live preview HTML, dan mode diskusi multi-AI. Dibangun di atas Next.js 16 + Tailwind v4, ngobrol ke model gratis OpenRouter.

## 1. Setup

```bash
npm install
```

Buat file `.env.local` di root project (sudah ada template-nya), isi dengan API key OpenRouter kamu:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**PENTING:** API key yang sempat kamu kirim di chat sudah terekspos publik di history percakapan ini. Revoke key itu di openrouter.ai/keys dan generate yang baru. Jangan pernah taruh key di kode/chat — selalu lewat `.env.local` (sudah masuk `.gitignore`, jadi nggak ke-commit).

## 2. Jalankan

```bash
npm run dev
```

Buka `http://localhost:3000`.

## 3. Build production

```bash
npm run build
npm start
```

## 4. Restore Google Fonts (opsional)

Sandbox tempat project ini dibuat nggak punya akses ke fonts.googleapis.com, jadi font pakai fallback system-font stack yang masih bagus. Di environment kamu sendiri yang punya akses internet, restore webfont asli: instruksinya ada sebagai komentar di `src/app/layout.tsx` (cari blok "DEPLOYMENT NOTE").

## Model yang dipakai (semua gratis, via OpenRouter)

| Model | Kegunaan |
|---|---|
| qwen/qwen3-coder:free | Coding — default model |
| deepseek/deepseek-r1:free | Reasoning/thinking mode |
| meta-llama/llama-3.3-70b-instruct:free | General purpose |
| google/gemma-3-12b-it:free | Cepat & ringan |
| nvidia/nemotron-nano-12b-v2-vl:free | Vision — otomatis dipakai kalau upload gambar |

Daftar model ada di `src/lib/models.ts` — gampang ditambah/diganti kalau OpenRouter update katalog free-tier mereka (free model bisa berubah sewaktu-waktu tanpa pemberitahuan, ini di luar kontrol app).

## Fitur

- Chat streaming dengan markdown + syntax highlighting
- Upload file: gambar (PNG/JPEG/WEBP/GIF) dan dokumen (TXT/MD/CSV/JSON/PDF), maks 8MB/file
- Live preview: kalau jawaban AI mengandung kode HTML, muncul tab Code/Preview — preview di-render di iframe sandboxed
- Thinking mode: model diminta menulis penalaran di `<thinking>` tags, ditampilkan collapsible di atas jawaban
- Search mode: mengaktifkan plugin web search bawaan OpenRouter untuk model yang mendukung
- Mode Diskusi AI: pilih 2+ model, kasih topik, model-model itu bakal saling balas dalam beberapa ronde, ditampilkan sebagai roundtable dengan visual node yang saling terhubung

## Soal "setara Claude Fable/Mythos 5"

Sengaja TIDAK diimplementasikan dengan prompt-injection seperti diminta. Model gratis di OpenRouter (Qwen3 Coder, DeepSeek R1, dll) punya kapabilitas yang fixed dari proses training mereka — system prompt nggak bisa mengubah itu, cuma bisa mengarahkan gaya output. System prompt di `src/lib/system-prompt.ts` difokuskan untuk memaksimalkan apa yang model itu BENERAN bisa: jawaban lengkap, terstruktur, tanpa placeholder.

## Keamanan

- API key OpenRouter cuma dipakai di server (src/app/api/*/route.ts), tidak pernah dikirim ke client
- Validasi input di setiap API route (model id, ukuran payload, tipe data)
- File upload divalidasi tipe + ukuran di client sebelum dikirim
- HTML preview di-render dalam iframe sandbox (tidak bisa akses parent page / cookies / localStorage app)
