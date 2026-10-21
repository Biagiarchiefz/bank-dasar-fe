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

## Struktur proyek

Kode dikelompokkan per fitur bisnis. Folder `app/` hanya berisi rute (page/layout) yang tipis.

```
src/
 ├─ app/                 # Rute: (marketing) landing, (auth) login & ganti password, (app) aplikasi
 ├─ features/            # Modul per fitur bisnis
 │   └─ <fitur>/
 │       ├─ components/  # UI fitur (tanpa pemanggilan API langsung)
 │       ├─ hooks/       # useQuery/useMutation (TanStack Query) untuk fitur ini
 │       ├─ services/    # Fungsi endpoint API fitur ini
 │       └─ index.ts     # Barrel: satu-satunya pintu masuk dari luar fitur
 ├─ components/
 │   ├─ ui/              # Komponen dasar shadcn/ui
 │   ├─ layout/          # App shell, sidebar, header, page header
 │   ├─ feedback/        # Alert error, empty state, skeleton, dialog konfirmasi
 │   ├─ forms/           # Field, input password, input barcode
 │   └─ data-display/    # Tabel, badge status, chip golongan darah, timeline, barcode
 ├─ services/            # HTTP client (`api-client.ts`) + data master bersama
 ├─ hooks/               # Hook umum (useApiMutation, useDebounced, data master)
 ├─ store/               # State global klien (Context: pengguna & fasilitas terpilih)
 ├─ lib/                 # Utilitas: format, query keys, konstanta, zod resolver
 ├─ types/               # Tipe DTO API per domain (`@/types`)
 └─ config/              # env, identitas situs, menu & hak akses per peran
```

Fitur: `auth`, `users`, `landing`, `dashboard`, `donors`, `screening`, `collection`, `lab`,
`processing`, `release`, `inventory`, `transfers`, `bdrs`, `transfusions`, `trace`.

Alur data: **komponen → hook fitur → service fitur → `services/api-client`**. Path service relatif
ke `/api/v1` (mis. `api.get("/donors")`). Query key ada di `lib/query-keys.ts` agar invalidasi
lintas fitur tetap konsisten.

Batas ini dijaga oleh ESLint (`eslint.config.mjs`):

- hanya `services/` dan `features/*/services/` yang boleh memakai `api` dari `@/services/api-client`;
- `components/`, `hooks/`, `lib/`, `store/`, `config/`, `types/` dan `services/` tidak boleh mengimpor fitur;
- fitur lain dan rute mengimpor fitur hanya lewat barrel `@/features/<nama>`.

State server dikelola TanStack Query; state global klien cukup dengan Context (`store/session.tsx`).
