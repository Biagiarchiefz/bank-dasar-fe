# SI UTD & BDRS — Frontend

Frontend prototipe Sistem Informasi UTD & BDRS. Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
Backend dan spesifikasi ada di repo `../bank-darah-be` (lihat `docs/PROTOTYPE_PLAN.md` dan `CLAUDE.md` di sana).

## Menjalankan

```bash
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000 (atau `make web` dari repo backend)
```

Backend harus berjalan di `API_BASE_URL` (default `http://localhost:8080`).
Browser memanggil path relatif `/api/v1/...`; `next.config.ts` meneruskannya ke backend (rewrite),
sehingga cookie berada di origin yang sama dan tidak perlu CORS.

## Pengecekan

```bash
npm run lint && npx tsc --noEmit && npm run build
```
