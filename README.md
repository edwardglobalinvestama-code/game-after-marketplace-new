# game-after-marketplace-new

Web game promo untuk after-sales marketplace dengan flow QR scan, validasi order Shopee/TikTok, kuota main berdasarkan quantity pembelian, dan mini-game mecha battle.

## Stack

- frontend: React + TypeScript + Vite + Phaser
- backend: Express + SQLite
- testing: Vitest + Testing Library + Supertest

## Run locally

```bash
npm install
npm run dev:server
npm run dev:web
```

## Demo flow

1. Jalankan backend dan frontend.
2. Buka halaman admin di `/admin`.
3. Upload `demo/orders-shopee.csv` atau `demo/orders-tiktok.csv`.
4. Pastikan order tampil di daftar admin.
5. Buka landing page `/`.
6. Isi form dengan nomor order `SPX-002`.
7. Mainkan battle sampai selesai dan masuk ke halaman hasil.
8. Kembali ke `/admin` untuk melihat sesi selesai tercatat.
9. Ulangi dengan order `SPX-002` sampai kuota habis, lalu verifikasi backend menolak sesi berikutnya.

## Endpoints penting

- `GET /api/health`
- `POST /api/admin/imports/orders`
- `GET /api/admin/orders`
- `GET /api/admin/sessions`
- `POST /api/game/start`
- `POST /api/game/result`
