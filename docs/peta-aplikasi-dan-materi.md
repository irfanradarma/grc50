# Peta aplikasi dan materi SIGNAL

Catatan pembacaan sumber lokal, 5 November 2026, untuk persiapan revisi besar. Ini bukan hasil pengujian aplikasi berjalan atau verifikasi ulang sumber eksternal. Aplikasi, materi, dan konfigurasi deployment belum diubah.

## Acuan utama

Proyek menggabungkan seminar Beyond Compliance, aplikasi latihan manajemen risiko SIGNAL, dan pengantar arah SPIT/SIPT Kemenkeu. Benang merahnya adalah menghubungkan tujuan, bukti, penilaian risiko, dan respons yang memiliki penanggung jawab.

Deck aktif: `website/deck/index.html`, dengan konten yang dibentuk oleh `website/assets/keynote/keynote.js`. `reference.json` pada direktori yang sama menyimpan urutan, catatan pembicara, konteks sumber, dan tautan. `translations-id.json` menyediakan terjemahan. Kontrak urutan untuk backend ada di `website/assets/data/deck-outline.json`. Ketiga sumber perlu dijaga konsistensinya.

Sumber aktif saat dibaca memuat **45 slide, empat bagian**. Dokumentasi lama menyebut 42, 44, atau 46 slide dan lima bagian; angka tersebut tidak boleh langsung dipakai untuk revisi.

## Susunan materi aktif

| Slide | Fokus |
|---|---|
| 1–4 | Judul, panduan penggunaan, dua narasumber dan moderator, agenda |
| 5–10 | Rethinking Risk & Assurance: fondasi kinerja–risiko–asurans, putusnya hubungan keputusan, penelitian pendukung |
| 11–28 | AI in Risk Management: siklus risiko, otomasi versus integrasi, SIGNAL, praktik kasus sampai dashboard dan pelepasan bukti tambahan |
| 29–36 | AI in Assurance: assurance of AI, assurance with AI, risiko dan pengawasan AI, SupTech dan contoh otoritas |
| 37–45 | SIPT: hubungan SPIT/SIPT, kerangka institusional, Risk Platform, CMCA, konfirmasi anomali, early warning, peran tiga lini, penutup |

SIGNAL adalah kerangka kerja presenter: Sense, Interpret, Gauge, Notify, Act, Learn. AI menyiapkan bukti dan saran; manusia memvalidasi, memutuskan, bertindak, dan memverifikasi. Kerangka ini tidak diposisikan sebagai standar eksternal.

Argumen penelitian dalam materi: manfaat strategis proses risiko, keselarasan audit dengan lini lain, dan mekanisme pelaporan yang terpisah dari keputusan. Ledger mencatat NC State/AICPA 2026, PwC 2023, serta Agarwal–Kallapur 2021 dan wawancara 2025. Angka 89% adalah komplemen 11%; angka 49% berlaku pada subkelompok eksekutif bisnis. Materi membatasi generalisasi dan tidak memperlakukan angka itu sebagai ukuran kegagalan Kemenkeu. Sumber tersebut dibaca sebagai isi repository, belum diverifikasi ulang secara daring dalam pekerjaan ini.

Bagian asurans membedakan AI sebagai objek pemeriksaan dan alat bantu pemeriksaan. Risiko frontier AI dibagi menjadi perilaku model, penyalahgunaan, serta risiko operasional/sistemik. Pengawasan mencakup tujuan sistem, akuntabilitas, data, batas kewenangan, dan pemantauan. Contoh SupTech mencakup ECB, PRA, FCA, ASIC, dan FINMA dengan status sesuai publikasi yang dicatat.

Bagian SIPT bersifat konseptual: SPIT merupakan kerangka institusional; SIPT mendukung informasi pengendalian. RP menjadi rujukan register risiko, sedangkan CMCA menghubungkan pengujian berulang dan anomali dengan risiko. Konfirmasi anomali tidak otomatis menghasilkan skor risiko atau simpulan audit. Integrasi AI tersebut adalah arah yang dijelaskan, bukan bukti sistem produksi yang telah selesai.

## Kasus dan model pembelajaran

Tiga organisasi fiktif, masing-masing dua tujuan dan empat risiko, berada dalam `app/shared/strategicScenario.ts`.

| Organisasi | Konteks dan fokus |
|---|---|
| PT Nusa Logistik Indonesia | 45% pendapatan bergantung pada eksportir tujuan AS; pertumbuhan logistik, diversifikasi koridor, margin dan investasi hub |
| PT Pangan Ritel Nusantara | Eksportir olahan hasil laut; 60% penjualan ekspor kepada pembeli AS; daya saing, margin, kurs dan diversifikasi |
| PT Cakrawala Digital Indonesia | Perangkat lunak domestik; tanpa hubungan langsung ekspor barang ke AS yang dibuktikan dalam kasus; diferensiasi AI, anggaran pelanggan dan pasar teregulasi |

Kasus terpandu memakai berita ANTARA 3 April 2025 mengenai pengumuman tarif AS 32%, diputar ulang dengan tanggal latihan 8 April 2025. Tarif tersebut tidak disajikan sebagai tarif saat ini atau persentase kerugian perusahaan. Eksposur logistik bersifat melalui pelanggan, bukan tarif langsung atas jasa angkutan.

`seminar-case.json` menyimpan kasus terpandu. `strategic-news.json` menyimpan delapan artikel tambahan tentang tarif, respons perdagangan, kurs, diversifikasi, pengalihan perdagangan, efisiensi anggaran, DeepSeek, dan aturan PDP. Arah bukti dibedakan menjadi adverse, uncertain, dan opportunity.

Bukti internal berupa laporan, temuan audit, serta indikator CA dibentuk dari skenario organisasi. Setiap risiko mempunyai observasi dan indikator dengan numerator, denominator, ambang, serta referensi pengecualian. Data dan dokumen internal merupakan bahan ajar fiktif.

## Alur aplikasi

1. Peserta masuk ke `/audience`, memperoleh workspace pribadi, memilih organisasi, satu atau dua tujuan, nama perusahaan, serta sumber berita.
2. Dashboard menampilkan konteks, peta risiko dan komitmen tindakan. Risk Monitoring memuat risiko dan rencana mitigasi. Risk Trigger mengatur sumber bukti.
3. Admin melepas tahap `guided`, lalu `external`, lalu `internal`. Tahap berikutnya tidak menunggu seluruh peserta selesai.
4. Dalam alur utama saat ini, peserta membuka risiko yang mendapat sinyal, menerima atau menolak setiap bukti, menetapkan skor, dan menyusun mitigasi bila diperlukan.
5. Tombol penyelesaian menyimpan keputusan sinyal, assessment, serta rencana baru sebagai satu rangkaian. Draft belum disimpan sampai selesai. Backend memeriksa baseline dan id respons agar konflik atau pengiriman ulang tidak menghasilkan penyimpanan parsial/duplikat.
6. Skor menggunakan likelihood × impact pada skala 1–5; toleransi latihan ≤12. Contoh materi: 12 → 16; rencana menurunkan likelihood satu tingkat sehingga residual proyeksi menjadi 12.
7. Dashboard dan daftar risiko dapat menampilkan residual proyeksi; assessment sebelum mitigasi tetap tersimpan. Rencana selesai memerlukan bukti pelaksanaan dan menghasilkan bukti baru untuk ditelaah; status selesai tidak otomatis menurunkan assessment.

Satu sinyal dapat mempunyai keputusan berbeda untuk risiko berbeda. Bukti penguat tentang kejadian yang sama tidak boleh dihitung sebagai tambahan poin berulang. Proyeksi mengutamakan pengurangan terkuat per dimensi, tidak menjumlahkan klaim mitigasi yang bertumpang tindih.

## Arsitektur dan peta perubahan

| Area | Berkas utama |
|---|---|
| React, routing, bahasa, setup, dashboard, admin | `app/src/WorkshopApp.tsx`, `app/src/main.tsx`, `app/shared/seminarRoutes.ts` |
| Respons risiko utama | `app/src/RiskResponseFlow.tsx`, `app/server/riskResponse.ts` |
| Aturan relevansi, materialisasi bukti, usulan skor, proyeksi | `app/shared/workshop.ts` |
| Organisasi, tujuan, risiko, asumsi, observasi internal | `app/shared/strategicScenario.ts` |
| API workshop, pelepasan bukti, keputusan, mitigasi, reset | `app/server/workshop.ts` |
| Auth dan workspace | `app/server/index.ts`, `adminAuth.ts`, `cloud.ts`, `db.ts`, `sharedRoom.ts` |
| Penyimpanan PostgreSQL | `app/server/schema.sql`, `deploy/supabase-signal-bootstrap.sql` |
| Posisi slide bersama dan konflik admin | `app/server/presentation.ts`, `website/assets/js/deck-live.js` |
| Siaran demonstrasi aplikasi | `app/src/LiveDemo.tsx`, `demoRecorder.ts`, `app/server/demoBroadcast.ts`, `website/assets/js/live-demo-*` |
| Tampilan deck aktif | `website/assets/keynote/keynote.js`, `keynote.css`, `deck-language.js` |
| Catatan dan bahasa deck | `website/assets/keynote/reference.json`, `translations-id.json` |
| Kontrak slide server | `website/assets/data/deck-outline.json` |
| Walkthrough read-only | `app/shared/walkthrough.ts`, `SeminarWalkthrough` dalam `WorkshopApp.tsx` |
| Packaging/publikasi | `app/scripts/build-pages.mjs`, `.github/workflows/`, `render.yaml`, `deploy/public-config.json` |

Stack: React/TypeScript/Vite, Express, PostgreSQL. Empat tabel utama adalah workspaces, guest_sessions, seminar_sessions, seminar_participants; data latihan terutama tersimpan sebagai JSONB. Workspace peserta diisolasi dengan konteks transaksi dan RLS. Satu ruang SIGNAL digunakan bersama; ruang lama tetap disimpan.

Pencocokan berita menggunakan kelompok kata tentang pendorong strategis dan eksposur. Ada jendela usia bukti 90 hari dan pemeriksaan tanggal. Paket historis memakai tanggal latihan; berita live memakai waktu penelaahan berjalan. **Tidak ada language model atau konektor sosial yang terhubung.** Label AI pada pengalaman pembelajaran perlu dibaca dengan batas implementasi ini.

Admin memiliki login, kontrol presentasi, pelepasan sinyal, progres peserta, workspace demo terpisah, dan reset seminar. Posisi slide menggunakan key semantik, revision, dan locking. Peserta dapat mengikuti presenter atau menjelajah mandiri. Siaran app memakai rrweb dan SSE, tersimpan sementara di memori backend, berakhir setelah sekitar 20 detik tanpa heartbeat, dan dirancang untuk satu instance.

Reset adalah operasi transaksional yang mengosongkan latihan peserta serta demo, bukti dan pelepasan; menghentikan presentasi serta siaran; mempertahankan posisi slide dan login admin. Epoch menolak form dari putaran sebelumnya. Tidak dijalankan dalam pembacaan ini.

## Versi, arsip, dan dokumen pendukung

- `website/deck-archive/` dan JS/CSS editorial menyimpan deck lama, dengan outline legacy 44 slide dan manifest backup. Jangan mengubahnya dengan asumsi itu sumber deck aktif.
- `experiments/keynote/` adalah studi desain awal; entry mengarah ke deck aktif. Skrip lokal menyediakan review pada port 8090 dan proxy walkthrough port 8091.
- Panduan browser editing terutama menjelaskan deck editorial; deck aktif mempunyai renderer berbeda. Dukungan editor perlu diperiksa pada entry yang akan direvisi.
- Walkthrough read-only tetap tersedia, tetapi enam panduan pada deck aktif sekarang memakai screenshot statis beranotasi. Dokumentasi tentang semua panduan yang otomatis berputar tidak menggambarkan seluruh pengalaman deck aktif saat ini.
- `KAK/Draf_KAK_Seminar_AI_HORI_80_Itjen.docx` menjelaskan seminar, tujuan, empat pokok bahasan, peserta, narasumber dan moderator. Rencana sesi 26 Oktober 2026 pukul 10.55–12.05 WIB, dengan paparan/demo 45 menit serta diskusi 15 menit. Masih ada placeholder peserta/tempat dan penyebutan kode sesi yang berbeda dari aplikasi tanpa kode.
- `KAK/Update Rundown Kegiatan Seminar AI HORI ke 80.pptx` memuat persiapan, seminar utama, transisi, dan empat breakout paralel. Waktu breakout selaras dengan draft KAK.
- `KAK/KAK_TOR_Workshop_MC.pdf` berisi KAK pelatihan MC, bukan materi AI: public speaking, vokal, panggung, script/rundown, praktik dan evaluasi. Rencana 17 September 2026, sekitar 35 peserta. Perlakukan sebagai dokumen kegiatan terpisah; penggunaannya sebagai contoh format adalah kemungkinan, bukan kepastian.
- JPEG WhatsApp dalam KAK adalah foto potret pendukung, bukan dokumen materi.
- `output/` dan `tmp/` berisi hasil render, screenshot, skrip serta artefak pemeriksaan terdahulu. Keduanya diabaikan Git; bukan sumber utama. Sebagian nama berkas mengindikasikan konteks kredensial, sehingga jangan mempublikasikan direktori ini sebagai aset umum.

## Deployment dan pemeriksaan saat revisi

Menurut konfigurasi/dokumentasi lokal, frontend dan deck dipaketkan untuk GitHub Pages, API untuk Render, serta database untuk schema SIGNAL terisolasi dalam proyek Supabase yang juga dipakai Atlas. Status layanan produksi belum dicek dalam pembacaan ini. Hindari menerapkan migrasi public lokal pada database produksi.

Tes repository mencakup aturan dan respons risiko, auth/isolation, pelepasan bukti, reset, berita, live deck, siaran demo, bahasa, narasi dan arsip. Tes deck juga mengunci sejumlah detail 45-slide/empat-bagian; perubahan besar narasi perlu memperbarui ekspektasi tes yang sesuai. Build memeriksa TypeScript dan bundle Vite.

Untuk revisi nanti, tentukan dahulu narasi dan pengalaman peserta, kemudian sesuaikan skenario serta aturan, deck/catatan/terjemahan, kontrak urutan server, screenshot, tes, dan dokumentasi. Pergantian key slide, struktur data latihan atau semantik skor perlu memikirkan kompatibilitas sesi yang sudah tersimpan. Perubahan kontrak slide harus dirilis bersama backend dan frontend.

## Batas pembacaan

Pemetaan ini mencakup sumber materi aktif, struktur dan alur utama kode, data skenario, dokumen KAK/rundown/PDF, serta fungsi arsip dan deployment. Belum merupakan audit baris per baris seluruh berkas, inspeksi visual setiap slide/aset, pengujian aplikasi berjalan, atau validasi klaim sumber eksternal. File rahasia lokal tidak diperlukan untuk memahami materi dan tidak dibuka.
