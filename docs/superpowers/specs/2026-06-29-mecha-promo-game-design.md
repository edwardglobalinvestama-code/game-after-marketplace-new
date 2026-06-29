# Mecha Promo Game Design

## Ringkasan

Produk ini adalah web game promo berbasis QR/barcode pada paket pelanggan marketplace. Setelah pelanggan menerima barang dan memindai kode, mereka masuk ke landing page campaign, mengisi data pelanggan, lalu memainkan mini-game duel mecha singkat. Sistem mencatat data pemain, mencocokkan nomor order terhadap data export admin dari Shopee atau TikTok Shop, lalu memberi akses bermain sesuai jumlah item yang dibeli.

Target versi pertama adalah demo runnable yang:

- terlihat modern dan premium di browser mobile
- menunjukkan alur end-to-end dari scan sampai hasil game
- menyiapkan fondasi backend untuk validasi order dan pembatasan kuota main
- siap dikembangkan ke integrasi operasional yang lebih lengkap

## Tujuan Bisnis

- Mengubah QR pada paket menjadi funnel interaktif untuk mengumpulkan data pelanggan.
- Menghubungkan pengalaman bermain dengan campaign hadiah dari dana marketing.
- Memvalidasi bahwa hanya pembeli sah yang bisa bermain.
- Membatasi jumlah permainan berdasarkan quantity pembelian per order.
- Menyediakan data hasil permainan dan data pelanggan untuk kebutuhan seleksi hadiah oleh admin.

## Sasaran Pengguna

- Pelanggan TikTok Shop dan Shopee yang menerima paket fisik.
- Mayoritas pengguna mobile browser tanpa instalasi aplikasi tambahan.
- Admin internal yang mengelola export order, validasi data, dan seleksi pemenang.

## Alur Pengguna

1. Pelanggan memindai QR/barcode pada paket.
2. Sistem membuka landing page promo campaign.
3. Pelanggan menekan tombol mulai dan masuk ke form data.
4. Pelanggan mengisi nomor WhatsApp, alamat, nomor order, dan platform marketplace.
5. Backend mencocokkan order berdasarkan data export admin.
6. Jika order valid dan masih memiliki kuota main, sistem membuat sesi game.
7. Pemain masuk ke briefing singkat lalu bermain duel mecha.
8. Setelah ronde selesai, hasil disimpan dan kuota main berkurang satu.
9. Halaman hasil memberi tahu bahwa data sudah tercatat dan hasil akan ditinjau admin untuk program hadiah.

## Aturan Validasi Order

- Sumber data order versi awal berasal dari file export admin marketplace, bukan integrasi API resmi.
- Sistem menyimpan order per platform dengan nomor order unik.
- Setiap order memiliki quantity pembelian.
- Jumlah kesempatan main ditentukan oleh quantity pembelian.
- Rumus default: `play_quota = quantity`.
- Setiap sesi game yang resmi dimulai mengurangi `play_quota` sebanyak satu dari jatah tersisa.
- Order yang tidak ditemukan di data import ditolak.
- Order dengan kuota habis ditolak.
- Order yang valid tetapi sedang memiliki sesi aktif tidak boleh membuat sesi baru sampai sesi sebelumnya selesai atau kadaluarsa.

## Gameplay

### Genre

Mini-game duel arena mecha 1 lawan 1 untuk browser mobile.

### Tujuan Desain

- Cepat dipahami tanpa tutorial panjang.
- Menarik secara visual dan terasa seperti event game modern.
- Cukup singkat agar tidak mengganggu funnel marketing.
- Cukup seru untuk membuat pengguna merasa ikut campaign, bukan hanya mengisi form.

### Loop Permainan

1. Briefing singkat
2. Countdown
3. Battle 30 sampai 45 detik
4. Result
5. Simpan hasil

### Aksi Pemain

- `Move Left`
- `Move Right`
- `Attack`
- `Defend`
- `Skill`

### Mekanik Dasar

- Arena berbentuk jalur horizontal sempit agar kontrol mudah di layar sentuh.
- Serangan dasar memberi damage kecil sampai sedang dengan cooldown singkat.
- Defend mengurangi damage untuk durasi pendek dan memiliki cooldown.
- Skill menghasilkan damage lebih besar dan aktif setelah energi terisi.
- Musuh AI bergerak sederhana, menyerang berkala, sesekali bertahan, dan dapat memakai skill sekali per ronde.

### Rasa Visual

- Gaya utama modern sci-fi dengan nuansa mecha stylized.
- Tampilan dibuat terasa 3D melalui layering, lighting, perspective, glow, impact flash, camera shake, dan HUD futuristik.
- Implementasi demo tidak memakai full 3D berat agar aman untuk mobile web.

## Aturan Menang dan Kalah

- Pemain menang jika HP musuh habis sebelum waktu habis.
- Pemain kalah jika HP sendiri habis sebelum waktu habis.
- Jika waktu habis, pemenang ditentukan dari sisa HP tertinggi.
- Jika sisa HP sama, hasil dianggap draw.
- Skor akhir dapat mempertimbangkan hasil duel, sisa HP, dan durasi.
- Menang tidak otomatis berarti mendapat hadiah. Hasil hanya masuk daftar kandidat yang dapat ditinjau admin.

## Arsitektur Produk

### Frontend

Web app mobile-first yang dibuka dari QR.

Modul utama:

- landing promo
- form pelanggan
- validasi order
- briefing game
- battle arena
- result screen

### Backend

Service backend menangani:

- import data order dari export admin
- normalisasi data Shopee dan TikTok Shop
- pencocokan nomor order
- perhitungan kuota main
- pembuatan sesi bermain
- pencatatan hasil permainan
- penyediaan data admin

### Admin

Halaman internal sederhana untuk:

- upload file export order
- melihat order yang sudah masuk
- melihat kuota main terpakai
- melihat riwayat sesi game
- membantu proses seleksi hadiah

## Struktur Kode yang Disarankan

### Frontend

- `src/app`
- `src/pages/landing`
- `src/pages/form`
- `src/pages/validation`
- `src/pages/briefing`
- `src/pages/battle`
- `src/pages/result`
- `src/components/ui`
- `src/components/game`
- `src/services/api`
- `src/state`
- `src/assets`

### Backend

- `server/src/modules/imports`
- `server/src/modules/orders`
- `server/src/modules/players`
- `server/src/modules/sessions`
- `server/src/modules/results`
- `server/src/modules/admin`
- `server/src/lib`

## Model Data Awal

### orders

- `id`
- `platform`
- `order_number`
- `quantity`
- `play_quota`
- `used_plays`
- `import_batch_id`
- `status`

### players

- `id`
- `whatsapp`
- `address`
- `platform`
- `order_number`
- `created_at`

### game_sessions

- `id`
- `player_id`
- `order_id`
- `status`
- `session_token`
- `started_at`
- `finished_at`

### battle_results

- `id`
- `session_id`
- `result`
- `hp_remaining`
- `enemy_hp_remaining`
- `duration_seconds`
- `score`

### import_batches

- `id`
- `platform`
- `source_filename`
- `imported_at`
- `row_count`

## Layar Utama

- `Promo Landing`
- `Form Validasi`
- `Loading / Validasi Order`
- `Mecha Briefing`
- `Battle Arena`
- `Result`
- `Admin Import Dashboard`

## Asset Plan

### Karakter

- 1 mecha pemain
- 1 mecha musuh
- state animasi: idle, move, attack, defend, hit, skill, destroyed

### Arena

- 1 arena utama bertema neon industrial atau cyber hangar
- background berlapis untuk memberi rasa depth

### UI

- logo campaign
- hero section landing
- skin form
- HUD battle
- tombol mobile
- kartu hasil
- komponen admin sederhana

### Efek

- hit spark
- shield pulse
- energy slash atau projectile
- explosion
- charge glow
- countdown effect

### Audio

- 1 musik landing
- 1 musik battle
- SFX klik
- SFX hit
- SFX defend
- SFX skill
- SFX victory
- SFX defeat

### Strategi Aset Versi Awal

- Demo boleh memakai aset placeholder berkualitas baik atau aset generated.
- Struktur penyimpanan aset harus sejak awal siap untuk penggantian aset final.

## Scope Demo Runnable Pertama

### Termasuk

- landing promo campaign
- form data pelanggan
- validasi nomor order dari data import admin
- pembatasan kuota main berdasarkan quantity order
- pembuatan sesi game
- 1 arena duel mecha
- 2 karakter
- HP bar
- aksi move, attack, defend, skill
- AI musuh sederhana
- result screen
- admin upload export order
- admin lihat order dan riwayat sesi

### Tidak Termasuk

- integrasi API resmi Shopee atau TikTok Shop
- login kompleks
- hadiah otomatis
- leaderboard publik
- multi-arena
- full real-time 3D engine
- anti-fraud tingkat lanjut di luar session token dasar

## Rekomendasi Teknologi

- Frontend: React + TypeScript
- Game layer: Phaser atau Canvas-based scene system
- Backend: Node.js dengan arsitektur modular
- Database: SQLite untuk demo, mudah dinaikkan ke PostgreSQL
- Import admin: CSV atau XLSX parser

## Error Handling

- Nomor order tidak ditemukan: tampilkan pesan validasi yang jelas.
- Kuota habis: tampilkan pesan bahwa jatah bermain untuk order sudah digunakan.
- Import file gagal: tampilkan ringkasan error per batch pada admin.
- Sesi game kedaluwarsa: arahkan pemain untuk validasi ulang tanpa mengurangi kuota dua kali.
- Koneksi backend gagal: tampilkan fallback status dan minta coba kembali.

## Testing Awal

- Uji validasi order ditemukan dan tidak ditemukan.
- Uji quantity menjadi play quota.
- Uji pengurangan kuota saat sesi resmi dimulai.
- Uji order dengan kuota habis.
- Uji hasil battle tersimpan sekali untuk satu session token.
- Uji alur mobile dari landing sampai result.

## Catatan Implementasi

- Prioritas demo adalah pengalaman presentasi yang meyakinkan dan fondasi data yang benar.
- Desain visual harus terasa modern dan premium, walau implementasi engine tetap ringan.
- Integrasi operasional lanjutan sebaiknya ditambahkan setelah demo tervalidasi oleh user dan klien.
