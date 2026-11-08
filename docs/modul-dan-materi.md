# Library topik presentasi

Platform menyediakan satu library topik yang dikelola admin. **Beyond Compliance adalah satu topik lengkap**, mencakup seluruh 45 slide, empat bagian narasi, dan aplikasi SIGNAL. Bagian seperti AI in Risk Management dan SIPT bukan topik terpisah dan tidak dipilih secara mandiri oleh peserta.

## Alur admin

1. Buka `/admin/` dan pilih **Library topik**. Status **Aktif** menandai satu topik yang sedang digunakan peserta.
2. **Tambah topik** membuat draft terpisah. Isi nama, deskripsi, deck, dan aplikasi yang menyertainya. Topik baru tidak mengambil slide atau workspace SIGNAL milik Beyond Compliance.
3. **Kelola** membuka pengaturan sebuah topik. Simpan perubahan sebagai draft; tindakan ini tidak mengganti materi peserta.
4. Hentikan presentasi dan tayangan aplikasi, lalu pilih **Aktifkan topik**. Untuk perubahan pada topik aktif, pilih **Terbitkan perubahan**. Deck dan aplikasi peserta beralih sebagai satu paket, dan presentasi tetap berhenti sampai admin memulainya.
5. Peserta tetap memakai tautan yang sama: `/presentation/deck/` dan `/audience/`. Mereka tidak perlu memilih topik atau mencampur bagian materi. Halaman yang sudah terbuka memeriksa topik aktif secara berkala.

Beyond Compliance mempertahankan desain, interaksi dan urutan deck aslinya. Aplikasi SIGNAL terikat pada topik ini. Topik lain dapat dimulai tanpa aplikasi atau dengan latihan formulir/keputusan, lalu dikembangkan lebih lanjut sesuai kebutuhan materi baru. Satu topik hanya mempunyai satu aplikasi peserta.

Perpindahan topik tidak menghapus progres SIGNAL. Saat Beyond Compliance diaktifkan lagi, workspace peserta tetap tersedia. Latihan formulir memiliki penyimpanan browser terpisah berdasarkan ID topik dan versi konfigurasi aplikasinya. Mengganti topik tanpa mengubah konfigurasinya tidak menghapus latihan tersebut. Tombol reset latihan dan pergantian topik adalah dua tindakan berbeda.

## Penyimpanan dan keamanan

- Library tersimpan sebagai `topicLibrary` dalam JSONB ruang seminar SIGNAL yang sudah ada; tidak ada tabel atau proyek database baru.
- Konfigurasi versi sebelumnya dipertahankan dan dibaca sebagai topik Beyond Compliance saat library pertama kali digunakan.
- API publik `/api/content` hanya mengembalikan deck dan aplikasi dari topik yang telah diaktifkan. Draft dan topik lain hanya tersedia melalui endpoint admin.
- Setiap perubahan library memeriksa revision agar admin lain tidak menimpa perubahan secara diam-diam.
- Aktivasi ditolak saat presentasi atau demo aplikasi masih berlangsung. Identitas deck berubah saat aktivasi, sehingga navigasi lama tidak dapat menimpa deck topik baru.
- Endpoint SIGNAL menolak workspace peserta jika topik aktif bukan SIGNAL; tautan lama tidak membuka latihan topik lain.

## Acuan implementasi

- `app/shared/topics.ts`: model library, topik bawaan, dan pemilihan satu aplikasi per topik.
- `app/server/topics.ts`: daftar, pembuatan, penyimpanan draft, dan aktivasi topik.
- `app/server/content.ts`: snapshot publik dari topik aktif dan kontrak deck.
- `app/src/ContentStudio.tsx`: laman Library topik admin.
- `app/src/ModuleAudience.tsx`: aplikasi atau laman materi dari topik aktif; `/modules/` dipertahankan sebagai tautan kompatibilitas menuju topik aktif, bukan katalog bagian.
- `website/assets/keynote/content-modules.mjs`: penyusunan isi deck di dalam satu topik. Struktur internal ini bukan pilihan topik bagi peserta.

Rilis backend sebelum frontend bila perubahan ini dipublikasikan. Pengujian perpindahan topik menggunakan ruang `TSTSIG`; jangan mengganti topik atau mereset progres produksi hanya untuk menguji deployment.
