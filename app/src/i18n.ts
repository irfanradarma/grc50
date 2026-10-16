import {useSyncExternalStore} from 'react';
import {extraCopy,templateCopy} from './i18n-extra';
export type Language='en'|'id';
let language:Language=localStorage.getItem('hori-language')==='id'?'id':'en';
document.documentElement.lang=language;
const listeners=new Set<()=>void>();
export function setLanguage(next:Language){language=next;localStorage.setItem('hori-language',next);document.documentElement.lang=next;listeners.forEach(fn=>fn());}
export function useLanguage(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>language);}
const pairs=`
Dashboard|Dasbor
Objectives|Sasaran
Objective|Sasaran
Risk Register|Daftar Risiko
Risk Monitoring|Pemantauan Risiko
Risk Trigger|Sinyal Risiko
Settings|Pengaturan
Apps|Aplikasi
Workspace|Ruang kerja
WORKSPACE|RUANG KERJA
Admin|Admin
Company profile|Profil organisasi
Organization structure|Struktur organisasi
Incident Reporting|Pelaporan Insiden
Audit Management|Manajemen Audit
Continuous Assurance|Continuous Assurance
Continuous assurance|Continuous assurance
Private workspace|Ruang kerja pribadi
Private guest workspace|Ruang kerja tamu
Guest explorer|Pengguna tamu
Sign out|Keluar
Sign out of workspace|Keluar dari ruang kerja
Open app switcher|Buka pilihan aplikasi
Your risk items|Daftar risiko
Risks & actions|Risiko dan tindak lanjut
Risk name|Nama risiko
Risk|Risiko
Score|Skor
Rating|Tingkat risiko
Owner|Penanggung jawab
Mitigation|Mitigasi
Mitigation plans|Rencana mitigasi
Mitigation action *|Tindakan mitigasi *
Action owner *|Penanggung jawab tindakan *
Plan details|Rincian rencana
Deadline *|Batas waktu *
Completion status|Status penyelesaian
Completion notes / evidence|Catatan penyelesaian / bukti
Projected likelihood reduction|Proyeksi penurunan kemungkinan
Projected impact reduction|Proyeksi penurunan dampak
Save mitigation plan|Simpan rencana mitigasi
Add mitigation plan|Tambah rencana mitigasi
Remove mitigation|Hapus rencana mitigasi
Mitigation plan saved. You can add another plan.|Rencana mitigasi tersimpan. Anda dapat menambahkan rencana berikutnya.
Track each action separately with its owner and deadline.|Tetapkan penanggung jawab dan batas waktu untuk setiap tindakan.
Done|Selesai
Not done|Belum selesai
done|selesai
Alerts|Peringatan
alerts|peringatan
Alerts & evidence|Peringatan dan bukti
news|berita
report|laporan
audit|audit
CA|CA
Detail|Detail
Details|Detail
Risk-score|Penilaian Risiko
Key Risk Indicator|Indikator Risiko Utama (KRI)
Key risk indicators|Indikator risiko utama (KRI)
Risk assessment|Penilaian risiko
Risk assessment details|Detail penilaian risiko
Risk assessment tabs|Tab penilaian risiko
Risk title|Nama risiko
Risk event|Peristiwa risiko
Cause|Penyebab
Impact on the objective|Dampak terhadap sasaran
Linked annual objective *|Sasaran tahunan terkait *
Linked annual objective|Sasaran tahunan terkait
Risk owner|Pemilik risiko
Category|Kategori
Existing controls|Pengendalian yang ada
Planned response|Rencana penanganan
Likelihood|Kemungkinan
Impact|Dampak
Initial risk|Risiko awal
Projected residual risk|Proyeksi risiko residual
Click the map to set likelihood and impact.|Klik peta untuk menetapkan kemungkinan dan dampak.
After the projected effects of mitigation plans.|Setelah memperhitungkan proyeksi dampak rencana mitigasi.
Projected reductions are added and bounded at 1. Review overlapping effects; completion alone does not verify control effectiveness.|Proyeksi penurunan dijumlahkan dengan nilai minimum 1. Tinjau dampak yang tumpang tindih; penyelesaian tindakan belum membuktikan efektivitas pengendalian.
High|Tinggi
Moderate|Sedang
Low|Rendah
Rare|Sangat jarang
Unlikely|Jarang
Possible|Mungkin
Likely|Sering
Almost certain|Hampir pasti
Minor|Sangat kecil
Limited|Kecil
Major|Besar
Severe|Sangat besar
Operational|Operasional
Strategic|Strategis
Technology|Teknologi
Compliance|Kepatuhan
Financial|Keuangan
Filter by objective|Filter berdasarkan sasaran
All objectives|Semua sasaran
All risks|Semua risiko
All years|Semua tahun
Search risks|Cari risiko
Risk, objective or owner|Risiko, sasaran, atau penanggung jawab
Generate sample risk|Susun risiko
Generate sample objective|Susun sasaran
Generate sample profile|Susun profil
New risk|Risiko baru
New risk assessment|Penilaian risiko baru
Save risk|Simpan risiko
Close details|Tutup detail
Close detail|Tutup detail
Close|Tutup
Cancel|Batal
Save|Simpan
Add|Tambah
Edit|Ubah
Action|Tindakan
Actions|Tindakan
Status|Status
Status / action|Status / tindakan
Save the risk before adding Key Risk Indicators.|Simpan risiko sebelum menambahkan indikator risiko utama.
Save the risk before saving individual mitigation plans.|Simpan risiko terlebih dahulu sebelum menyimpan rencana mitigasi satu per satu.
Complete the required risk attributes and each mitigation owner, action and deadline before saving.|Lengkapi atribut risiko serta tindakan, penanggung jawab, dan batas waktu mitigasi sebelum menyimpan.
Risk saved to your private register.|Risiko tersimpan di daftar risiko Anda.
Create your first risk using New risk.|Gunakan Risiko baru untuk membuat risiko pertama.
No risks match your filter.|Tidak ada risiko yang sesuai dengan filter.
Load CA examples|Muat data CA
Potential new risks|Potensi risiko baru
Potential new risk|Potensi risiko baru
Identify linked risk|Identifikasi risiko terkait
Review decision|Keputusan reviu
Reason and next steps|Alasan dan tindak lanjut
Save alert review|Simpan reviu peringatan
Acknowledged|Dicatat
Reassessment requested|Perlu penilaian ulang
Dismissed|Dikesampingkan
Open|Belum ditindaklanjuti
Reviewed|Sudah direviu
Information|Informasi
Evidence:|Bukti:
Open source|Buka sumber
Risk review history|Riwayat reviu risiko
No alerts recorded for this risk.|Belum ada peringatan untuk risiko ini.
Annual objectives & departmental KPIs|Sasaran tahunan dan KPI unit
One objective can have multiple measures, targets and responsible departments.|Satu sasaran dapat memiliki beberapa KPI, target, dan unit penanggung jawab.
Planning year|Tahun perencanaan
Add objective|Tambah sasaran
Select an objective for risk creation, then manage its performance measures.|Pilih sasaran, kemudian kelola indikator kinerjanya.
Annual commitment:|Komitmen tahunan:
Annual outcome / commitment|Hasil / komitmen tahunan
Accountable owner|Penanggung jawab sasaran
Accountable department|Unit penanggung jawab sasaran
Department not assigned|Unit belum ditetapkan
Not assigned|Belum ditetapkan
Objective-linked performance measure|Indikator kinerja terkait sasaran
Edit objective|Ubah sasaran
Edit KPI|Ubah KPI
Add KPI|Tambah KPI
Save KPI|Simpan KPI
Save objective|Simpan sasaran
New objective|Sasaran baru
New KPI|KPI baru
Cancel KPI|Batalkan KPI
Cancel objective|Batalkan sasaran
KPI name|Nama KPI
KPI / definition|KPI / definisi
KPI definition / calculation|Definisi / perhitungan KPI
KPI target|Target KPI
KPI owner|Penanggung jawab KPI
Responsible department *|Unit penanggung jawab *
Responsible department|Unit penanggung jawab
Measurement frequency|Frekuensi pengukuran
Unit|Satuan
Target|Target
Owner / frequency|Penanggung jawab / frekuensi
Choose a department|Pilih unit
Open Risk Register|Buka Daftar Risiko
Open Risk Monitoring|Buka Pemantauan Risiko
Open Objectives|Buka Sasaran
No KPIs yet.|Belum ada KPI.
Risk creation uses the selected objective and its planning year.|Risiko dihubungkan dengan sasaran dan tahun perencanaan yang dipilih.
Create your organization departments in Settings before assigning KPIs.|Buat unit organisasi di Pengaturan sebelum menetapkan penanggung jawab KPI.
Set up departments|Atur unit organisasi
No objectives for this year. Add an objective or generate a sample draft.|Belum ada sasaran untuk tahun ini. Tambahkan sasaran atau gunakan usulan awal.
KPI saved with its objective and responsible department.|KPI tersimpan dengan sasaran dan unit penanggung jawabnya.
Objective saved. Add one or more KPIs with departmental responsibility.|Sasaran tersimpan. Tambahkan KPI beserta unit penanggung jawabnya.
Sample objective loaded. Review the outcome, then define its KPIs after saving.|Usulan sasaran tersedia. Tinjau hasil yang dituju, simpan, lalu tetapkan KPI.
Departments & reporting structure|Unit organisasi dan jalur pelaporan
Department|Unit organisasi
Department name *|Nama unit *
Department code|Kode unit
Department head|Pimpinan unit
Head|Pimpinan
Reports to|Melapor kepada
Reports to department|Unit atasan
Top-level department|Unit tingkat atas
Add department|Tambah unit
New department|Unit baru
Edit department|Ubah unit
Save department|Simpan unit
Cancel department|Batalkan unit
No code assigned|Kode belum ditetapkan
Department unavailable|Unit tidak tersedia
Create departments before assigning objective KPIs. Names can change without losing existing assignments.|Buat unit sebelum menetapkan penanggung jawab KPI. Perubahan nama tidak menghapus penugasan yang ada.
No departments yet. Add the departments that exist in your organization.|Belum ada unit. Tambahkan unit yang terdapat dalam organisasi Anda.
Department saved. It is available for objective and KPI assignment.|Unit tersimpan dan dapat ditetapkan sebagai penanggung jawab sasaran atau KPI.
Workspace administration|Administrasi ruang kerja
The private guest workspace owner manages company profile and organization structure.|Pemilik ruang kerja mengelola profil dan struktur organisasi.
Maintain the enduring mandate, stakeholders, dependencies and risk boundaries.|Kelola mandat, pemangku kepentingan, ketergantungan, dan batas risiko organisasi.
Company / organization name|Nama organisasi
Sector|Sektor
Purpose & operating environment|Mandat dan lingkungan operasional
Key stakeholders|Pemangku kepentingan utama
Critical dependencies|Ketergantungan utama
Risk appetite & boundaries|Selera dan batas risiko
Save company profile|Simpan profil organisasi
Company profile saved. Objectives and KPIs remain separate.|Profil organisasi tersimpan. Sasaran dan KPI dikelola secara terpisah.
Sample profile loaded for review; save explicitly to apply.|Usulan profil tersedia. Tinjau dan simpan untuk menerapkannya.
Refresh|Muat ulang
Workspace overview|Ikhtisar ruang kerja
Objectives & exposure|Sasaran dan eksposur
Open signals|Sinyal belum ditindaklanjuti
KRI breaches|KRI melewati ambang batas
KRIs in breach|KRI melewati ambang batas
Registered risks|Risiko terdaftar
Register exposure|Eksposur risiko
Risk heat map|Peta risiko
Risk rating distribution|Sebaran tingkat risiko
Current likelihood x impact ratings|Penilaian kemungkinan × dampak saat ini
Current register ratings; a signal prompts review rather than changing the rating automatically.|Penilaian risiko saat ini. Sinyal memicu reviu, bukan perubahan skor secara otomatis.
Likelihood x impact for the selected objectives. Select a cell to inspect its risks.|Kemungkinan × dampak untuk sasaran terpilih. Pilih sel untuk melihat risikonya.
Select a heat-map cell|Pilih sel pada peta risiko
No risks in this cell.|Tidak ada risiko pada sel ini.
High 15+|Tinggi ≥15
Moderate 6-14|Sedang 6–14
Low <6|Rendah <6
News awaiting review|Berita menunggu reviu
Collected articles stay outside monitoring until captured.|Berita yang terkumpul masuk pemantauan setelah dinilai relevan.
Open review inbox|Buka antrean reviu
Risks to look at next|Risiko yang perlu ditinjau
Ordered by open signals, KRI breaches, then register rating.|Diurutkan berdasarkan sinyal belum ditindaklanjuti, pelampauan KRI, dan tingkat risiko.
Latest KRI breaches|Pelampauan KRI terbaru
Monitoring coverage|Cakupan pemantauan
Risks with at least one KRI configured|Risiko dengan sedikitnya satu KRI
Review indicators|Reviu indikator
Review identification needs|Reviu kebutuhan identifikasi
Open signals linked to an objective without an existing risk|Sinyal terkait sasaran yang belum memiliki risiko
Recent risk reviews|Reviu risiko terbaru
No risk reviews recorded for this selection.|Belum ada reviu risiko untuk pilihan ini.
No breach in recorded readings|Tidak ada pelampauan pada pengamatan tercatat
No KRIs configured|Belum ada KRI
No open signals|Tidak ada sinyal yang perlu ditindaklanjuti
Create an annual objective first.|Buat sasaran tahunan terlebih dahulu.
Define a target to connect your risks, indicators, and evidence.|Tetapkan target untuk menghubungkan risiko, indikator, dan bukti.
No risks yet. Create a linked risk in the Risk Register.|Belum ada risiko. Buat risiko terkait sasaran di Daftar Risiko.
Define multiple indicators and record observations.|Tetapkan indikator dan catat hasil pengamatan.
Add KRI|Tambah KRI
Indicator name|Nama indikator
Indicator owner|Penanggung jawab indikator
Observation frequency|Frekuensi pengamatan
Deterioration direction|Arah perburukan
Above|Di atas
Below|Di bawah
Higher values are worse|Nilai lebih tinggi menunjukkan perburukan
Lower values are worse|Nilai lebih rendah menunjukkan perburukan
Warning threshold|Ambang peringatan
Critical threshold|Ambang kritis
Record reading|Catat pengamatan
Record observation|Catat pengamatan
Save reading|Simpan pengamatan
Save indicator|Simpan indikator
Cancel indicator|Batalkan indikator
Cancel reading|Batalkan pengamatan
Observation date|Tanggal pengamatan
Observed value|Nilai pengamatan
Observation notes|Catatan pengamatan
Observation history|Riwayat pengamatan
No reading|Belum ada pengamatan
No indicators yet. Add a KRI with warning and critical thresholds.|Belum ada indikator. Tambahkan KRI dengan ambang peringatan dan kritis.
Warning|Peringatan
Critical|Kritis
Normal|Normal
Latest:|Terbaru:
Daily|Harian
Weekly|Mingguan
Monthly|Bulanan
Quarterly|Triwulanan
Annually|Tahunan
External sources|Sumber eksternal
Internal sources|Sumber internal
News review inbox|Antrean reviu berita
Manage sources|Kelola sumber
Periodic/incident reports|Laporan berkala / insiden
Audit reports|Laporan audit
News capture sources|Sumber berita
Internal trigger sources|Sumber sinyal internal
Add source|Tambah sumber
Edit source|Ubah sumber
Save source|Simpan sumber
Cancel source|Batalkan sumber
Source name|Nama sumber
Source type|Jenis sumber
Source system|Sistem sumber
Connection method|Metode koneksi
Source API endpoint|Endpoint API sumber
API endpoint or reference URL|Endpoint API atau URL referensi
MCP server / tool reference|Referensi server / tool MCP
API adapter|Adapter API
MCP adapter|Adapter MCP
Manual submission|Pengiriman manual
Manual reporting|Pelaporan manual
Reporting rule|Aturan pelaporan
Reporting / test cadence|Jadwal pelaporan / pengujian
Reporting expectation|Ketentuan pelaporan
Subscribed event types (comma separated)|Jenis event yang dipantau (pisahkan dengan koma)
Connector & events|Konektor dan event
Connector status|Status konektor
Configuration|Konfigurasi
Health / last attempt|Koneksi / percobaan terakhir
Source / type|Sumber / jenis
Objective / risk|Sasaran / risiko
All sources|Semua sumber
All articles|Semua artikel
All relevance levels|Semua tingkat relevansi
News search topic|Topik pencarian berita
Keywords:|Kata kunci:
Relevance|Relevansi
Relevance preview|Pratinjau relevansi
Relevance keywords (comma separated)|Kata kunci relevansi (pisahkan dengan koma)
News rows per page|Baris berita per halaman
Rows per page|Baris per halaman
News review status|Status reviu berita
News / evidence|Berita / bukti
Source / published|Sumber / waktu publikasi
Publisher / source|Penerbit / sumber
Search collected news|Cari berita terkumpul
Search headlines or summaries|Cari judul atau ringkasan
Set up Indonesian publishers|Atur penerbit Indonesia
One search, multiple publishers|Satu pencarian, banyak penerbit
Collect from all sources|Ambil dari semua sumber
Capture news now|Ambil berita sekarang
Capture|Tindak lanjuti
Neglect|Abaikan
Captured|Ditindaklanjuti
Neglected|Diabaikan
Pending|Menunggu
Awaiting review|Menunggu reviu
Previously reviewed|Sudah direviu
Captured into monitoring|Masuk pemantauan
Awaiting your decision|Menunggu keputusan Anda
Low relevance|Relevansi rendah
Review needed|Perlu reviu
Context only|Konteks saja
Review before escalation|Reviu sebelum eskalasi
Potential impact|Potensi dampak
Potential impact · preview|Potensi dampak · pratinjau
Why this may matter|Mengapa ini relevan
Read source|Baca sumber
Connect this evidence to a decision|Hubungkan bukti dengan keputusan
Capture to risk|Hubungkan dengan risiko
Capture to annual objective|Hubungkan dengan sasaran tahunan
Confirm capture|Simpan keputusan tindak lanjut
Confirm neglect|Simpan keputusan abaikan
Reason for neglecting|Alasan mengabaikan
Neglect this news item|Abaikan berita ini
Suggested objective:|Usulan sasaran:
Possible risk:|Risiko terkait:
Objective impact and next steps|Dampak terhadap sasaran dan tindak lanjut
Human decision required|Perlu keputusan manusia
Open the source for the published article.|Buka referensi sumber dan verifikasi publikasinya.
Capturing creates a review signal. It does not change the risk rating or confirm that an incident occurred.|Keputusan tindak lanjut membuat sinyal untuk direviu, bukan mengubah skor risiko atau memastikan insiden telah terjadi.
Neglecting keeps the source and decision history. It does not delete the evidence.|Keputusan abaikan tetap menyimpan sumber, alasan, dan riwayat bukti.
Capture and neglect decisions remain here with your rationale.|Keputusan tindak lanjut dan abaikan tersimpan beserta alasannya.
No news in this view.|Tidak ada berita pada tampilan ini.
No news matches this view.|Tidak ada berita yang sesuai dengan pilihan ini.
No sources configured yet.|Belum ada sumber yang dikonfigurasi.
Collect news to populate your review inbox.|Ambil berita untuk mengisi antrean reviu.
Collection failed|Pengambilan gagal
Not fetched yet|Belum diambil
No recorded attempt|Belum ada percobaan
No events received|Belum ada event diterima
Awaiting activity evidence|Menunggu bukti aktivitas
Publication date unavailable|Tanggal publikasi tidak tersedia
Date unavailable|Tanggal tidak tersedia
Capture format|Format pengambilan
Reference URL / manual article|URL referensi / artikel manual
News reference|Referensi berita
Submit article reference|Kirim referensi artikel
Submit report|Kirim laporan
Report / article title|Judul laporan / artikel
Observation / report date|Tanggal pengamatan / laporan
Findings and potential objective impact|Temuan dan potensi dampak terhadap sasaran
Evidence reference or article URL|Referensi bukti atau URL artikel
Result|Hasil
Exception / needs review|Pengecualian / perlu reviu
Normal / information only|Normal / informasi saja
On demand|Saat diminta
Test event|Uji event
Open assurance module|Buka modul assurance
Report saved; review it in Risk Monitoring.|Laporan tersimpan. Reviu di Pemantauan Risiko.
Normal result saved to monitoring history.|Hasil normal tersimpan di riwayat pemantauan.
Article saved to the news review inbox.|Artikel tersimpan di antrean reviu berita.
Trigger source saved.|Sumber sinyal tersimpan.
News neglected. Your rationale is retained; no monitoring alert was created.|Berita diabaikan. Alasan tersimpan tanpa membuat peringatan pemantauan.
Programs, workpapers and reports|Program, kertas kerja, dan laporan
Objectives, risks and monitoring|Sasaran, risiko, dan pemantauan
Automated checks and confirmation|Pengujian otomatis dan konfirmasi
Seminar presentation|Presentasi seminar
HORI workspace apps|Aplikasi ruang kerja HORI
One private workspace / shared Risk Register|Satu ruang kerja / daftar risiko bersama
More workspace apps / coming later|Aplikasi ruang kerja lainnya
Submitted reports|Laporan terkirim
Submit incident|Kirim insiden
New incident report|Laporan insiden baru
Report an operational incident|Laporkan insiden operasional
Incident evidence|Bukti insiden
Incident title|Judul insiden
Registered risk|Risiko terdaftar
Registered risk *|Risiko terdaftar *
Registered risks *|Risiko terdaftar *
Observed date|Tanggal kejadian
Reporter|Pelapor
Incident evidence and potential impact|Bukti insiden dan potensi dampak
Evidence reference|Referensi bukti
Submit incident report|Kirim laporan insiden
Describe evidence and exposure. The risk owner validates the impact.|Jelaskan bukti dan eksposur. Pemilik risiko memvalidasi dampaknya.
Incident submitted and connected to the registered risk in Risk Monitoring.|Insiden terkirim dan terhubung dengan risiko di Pemantauan Risiko.
Submitted reports route to Periodic/incident reports and their linked monitoring risk.|Laporan terkirim masuk ke sumber laporan berkala / insiden dan risiko terkait.
No incident reports yet. Select a registered risk to submit the first report.|Belum ada laporan insiden. Pilih risiko untuk mengirim laporan pertama.
Audit projects|Penugasan audit
New audit project|Penugasan audit baru
Create audit project|Buat penugasan audit
Risk-based audit portfolio|Portofolio audit berbasis risiko
Project / scope|Penugasan / lingkup
Audit project title|Nama penugasan audit
Audit scope|Lingkup audit
Audit owner|Penanggung jawab audit
Audit program & workpapers|Program audit dan kertas kerja
Audit procedure|Prosedur audit
Add audit procedure|Tambah prosedur audit
Workpaper|Kertas kerja
Workpaper conclusion|Simpulan kertas kerja
Reporting|Pelaporan
Report summary|Ringkasan laporan
Audit finding / objective impact|Temuan audit / dampak terhadap sasaran
Recommendation|Rekomendasi
Management response|Tanggapan manajemen
Save audit workspace|Simpan ruang kerja audit
Issue report to Risk Monitoring|Terbitkan laporan ke Pemantauan Risiko
Open workspace|Buka ruang kerja
Plan procedures, document workpapers and issue reports against registered risks.|Susun prosedur, dokumentasikan kertas kerja, dan terbitkan laporan terkait risiko terdaftar.
Complete evidence, results, conclusions and report fields first. Issued reports are retained and locked.|Lengkapi bukti, hasil, simpulan, dan laporan. Laporan yang telah terbit disimpan dan dikunci.
Save the program and workpapers before issuing the report.|Simpan program dan kertas kerja sebelum menerbitkan laporan.
Audit workspace saved.|Ruang kerja audit tersimpan.
Report issued. Findings are connected to each linked risk in Risk Monitoring.|Laporan diterbitkan. Temuan terhubung dengan setiap risiko terkait di Pemantauan Risiko.
Issued report / retained evidence|Laporan terbit / bukti tersimpan
Planned|Direncanakan
Fieldwork|Pelaksanaan
Reported|Dilaporkan
Automated assurance|Assurance otomatis
Monitored risks|Risiko dipantau
Monitored risk|Risiko dipantau
Enabled checks|Pengujian aktif
Awaiting confirmation|Menunggu konfirmasi
Confirmed exceptions|Pengecualian terkonfirmasi
Exceptions to investigate|Pengecualian untuk ditelusuri
Anomaly review|Reviu anomali
Anomaly status|Status anomali
Anomaly / record|Anomali / catatan
Risk-linked automated checks|Pengujian otomatis terkait risiko
Risk / check|Risiko / pengujian
Detection rule|Aturan deteksi
Last run / dataset|Pengujian terakhir / dataset
Enable check|Aktifkan pengujian
Pause check|Jeda pengujian
Enabled|Aktif
Paused|Dijeda
Run checks now|Jalankan pengujian
Configure automated check|Atur pengujian otomatis
Check name|Nama pengujian
Metric|Ukuran
Exception direction|Arah pengecualian
Exception threshold *|Ambang pengecualian *
Create automated check|Buat pengujian otomatis
Detected|Terdeteksi
Value / threshold|Nilai / ambang
Confirmation decision|Keputusan konfirmasi
Confirmation rationale / evidence|Alasan konfirmasi / bukti
Confirmation history|Riwayat konfirmasi
Reviewer|Pereviu
Save confirmation|Simpan konfirmasi
Confirmed|Terkonfirmasi
False positive|Positif palsu
Resolved|Terselesaikan
View anomalies|Lihat anomali
View anomaly|Lihat anomali
View details|Lihat detail
View linked risk signals|Lihat sinyal risiko terkait
Detection is automated. Confirmed exceptions flow into the linked risk; false positives retain their rationale.|Deteksi berlangsung otomatis. Pengecualian terkonfirmasi masuk ke risiko terkait; positif palsu menyimpan alasan keputusan.
Confirmation saved. The linked risk signal and decision history are updated.|Konfirmasi tersimpan. Sinyal risiko dan riwayat keputusan diperbarui.
Automated check configured and linked to its registered risk.|Pengujian otomatis tersimpan dan terhubung dengan risiko terdaftar.
Load connected examples|Muat data terhubung
Create a project or load connected examples.|Buat penugasan atau muat data terhubung.
Load connected examples, or configure a risk-linked check below.|Muat data terhubung atau atur pengujian terkait risiko di bawah ini.
Choose a registered risk|Pilih risiko terdaftar
Choose a risk|Pilih risiko
Choose an objective|Pilih sasaran
Select an annual objective|Pilih sasaran tahunan
YOUR ORGANIZATION|ORGANISASI ANDA
YOUR OPERATING CONTEXT|KONTEKS OPERASIONAL ANDA
THE BASICS|INFORMASI DASAR
REVIEW & FINISH|TINJAU DAN SELESAIKAN
MAKE THE WORKSPACE YOURS|ATUR RUANG KERJA ANDA
WELCOME TO HORI|SELAMAT DATANG DI HORI
WHAT YOU CAN DO|YANG DAPAT ANDA LAKUKAN
YOUR NEXT GOOD DECISION|KEPUTUSAN ANDA BERIKUTNYA
A LITTLE CONTEXT GOES A LONG WAY|MULAI DARI KONTEKS ORGANISASI
What is your organization called?|Apa nama organisasi Anda?
Which sector do you operate in?|Di sektor apa organisasi Anda bergerak?
What does your organization do?|Apa kegiatan utama organisasi Anda?
Who relies on your organization?|Siapa yang bergantung pada organisasi Anda?
What does your organization rely on?|Apa ketergantungan utama organisasi Anda?
Where do you draw the line on risk?|Apa batas risiko yang dapat diterima?
Does this look like your organization?|Apakah profil ini sesuai dengan organisasi Anda?
How would you like to start?|Bagaimana Anda ingin memulai?
Use a template|Gunakan template
Use template|Gunakan template
Start from scratch|Mulai dari awal
Change starting option|Ubah cara memulai
Fill randomly|Isi otomatis
Back|Kembali
Next|Lanjut
Previous|Sebelumnya
Do this later|Isi nanti
Save profile & continue|Simpan profil dan lanjutkan
Review your company profile|Tinjau profil organisasi
Please specify your sector *|Sebutkan sektor organisasi Anda *
Other|Lainnya
Public sector|Sektor publik
Education|Pendidikan
Logistics|Logistik
Healthcare|Kesehatan
Financial services|Jasa keuangan
Technology services|Layanan teknologi
Company profile setup|Pengaturan profil organisasi
Company profile setup progress|Kemajuan pengaturan profil organisasi
Company profile first. Annual targets next.|Profil organisasi terlebih dahulu, lalu target tahunan.
Set your goals after this setup|Tetapkan sasaran setelah profil selesai
Set annual objectives|Tetapkan sasaran tahunan
Set organization objectives|Tetapkan sasaran organisasi
Your private workspace|Ruang kerja pribadi Anda
Your own editable copy. Changes stay in your workspace.|Salinan Anda dapat diubah. Perubahan tersimpan di ruang kerja Anda.
Both options create a private workspace for this guest session.|Kedua pilihan membuat ruang kerja pribadi untuk sesi tamu ini.
Explore a complete example, or build a workspace around your organization.|Gunakan template lengkap atau susun ruang kerja sesuai organisasi Anda.
An Indonesian logistics scenario with connected objectives, risks, indicators, and monitoring evidence.|Organisasi logistik Indonesia dengan sasaran, risiko, indikator, dan bukti pemantauan yang terhubung.
Continue as guest|Masuk sebagai tamu
We create a private workspace for this browser.|Ruang kerja pribadi dibuat untuk peramban ini.
Your session lasts up to 30 days.|Sesi berlaku hingga 30 hari.
Your guest session is saved in this browser.|Sesi tamu tersimpan di peramban ini.
Signing out ends access to this guest workspace.|Keluar mengakhiri akses ke ruang kerja tamu ini.
Explore the workspace without creating an account.|Gunakan ruang kerja tanpa membuat akun.
Connect annual objectives, risk exposure, and assurance evidence in one private workspace.|Hubungkan sasaran tahunan, eksposur risiko, dan bukti assurance dalam satu ruang kerja.
Build a focused Risk Register|Susun daftar risiko yang terarah
Set the organizational context|Tetapkan konteks organisasi
Objectives, stakeholders, and dependencies|Sasaran, pemangku kepentingan, dan ketergantungan
Your context. Your risks. Your workspace.|Konteks Anda. Risiko Anda. Ruang kerja Anda.
Clarity for the|Kejelasan untuk
decisions|keputusan
that matter.|yang berarti.
Your next good|Keputusan Anda
decision starts here.|berikutnya dimulai di sini.
Start with a sample|Mulai dengan template
Explore the workflow with randomized, editable drafts.|Susun konteks dan risiko yang dapat ditinjau dan diubah.
AI integration coming next|Koneksi AI
Sample generation available. AI connection comes next.|Usulan awal tersedia untuk ditinjau.
Manual entries or randomized sample drafts|Entri manual atau usulan awal
Built for thoughtful risk management|Untuk pengelolaan risiko yang terarah
Your risk items|Daftar risiko Anda
Try again|Coba lagi
Refresh|Muat ulang
View risk|Lihat risiko
View objectives|Lihat sasaran
Opening your workspace…|Membuka ruang kerja…
Loading your workspace overview...|Memuat ikhtisar ruang kerja…
Preparing your workspace...|Menyiapkan ruang kerja…
Something went wrong.|Terjadi kendala.
Request failed.|Permintaan tidak berhasil.
Unable to save.|Tidak dapat menyimpan.
Unable to save risk.|Tidak dapat menyimpan risiko.
Unable to save plan.|Tidak dapat menyimpan rencana.
Unable to load alerts.|Tidak dapat memuat peringatan.
Unable to load CA examples.|Tidak dapat memuat data CA.
Unable to load dashboard.|Tidak dapat memuat dasbor.
Unable to load activities.|Tidak dapat memuat aktivitas.
Unable to load organization structure.|Tidak dapat memuat struktur organisasi.
Unable to load KPI assignments.|Tidak dapat memuat penugasan KPI.
Unable to review alert.|Tidak dapat menyimpan reviu peringatan.
Unable to save your profile. Please try again.|Tidak dapat menyimpan profil. Silakan coba lagi.
No additional details.|Tidak ada rincian tambahan.
No indicators configured|Belum ada indikator
Not specified yet|Belum ditentukan
No events received|Belum ada event diterima
registered risks|risiko terdaftar
risks|risiko
objectives|sasaran
indicators;|indikator;
captured|ditindaklanjuti
neglected|diabaikan
warning /|peringatan /
critical|kritis
on|pada
of|dari
Open source|Buka sumber
Ketersediaan platform pelacakan|Tracking platform availability
Mencapai pengiriman tepat waktu|Achieve on-time delivery
Menjaga ketersediaan platform pelacakan|Maintain tracking platform availability
Melindungi data pelanggan|Protect customer data
Keterlambatan pengiriman akibat gangguan rute dan kapasitas|Delivery delays from route and capacity disruption
Gangguan penyedia cloud platform pelacakan|Tracking platform cloud provider outage
Hak akses berlebih pada data pelanggan|Excessive access to customer data
Data alamat tidak lengkap menghambat pengiriman|Incomplete addresses delay delivery
Operasional|Operations
Teknologi Informasi|Information Technology
Keamanan Informasi|Information Security
Layanan Pelanggan|Customer Service
Keuangan & Pengadaan|Finance & Procurement
SDM & Umum|HR & General Affairs
Kepatuhan & Manajemen Risiko|Compliance & Risk Management
Direktur Operasional|Operations Director
Kepala Teknologi|Head of Technology
Kepala Keamanan Informasi|Head of Information Security
Manajer Operasional|Operations Manager
Manajer TI|IT Manager
Manajer Kualitas Data|Data Quality Manager
Pengiriman tepat waktu|On-time delivery
Keberhasilan pengiriman pertama|First-attempt delivery success
Ketersediaan pelacakan|Tracking availability
Penyelesaian temuan akses kritis|Critical access findings resolved
Kiriman melewati SLA|Shipments past SLA
Utilisasi kapasitas armada|Fleet capacity utilization
Reviu akun istimewa|Privileged account review
Kelengkapan alamat pelanggan|Customer address completeness
Kapasitas gudang & antrean dispatch|Warehouse capacity & dispatch queue
Keberhasilan backup & recovery|Backup & recovery success
Pencabutan akses pegawai keluar|Leaver access removal
`;
const idMap=new Map<string,string>(),enMap=new Map<string,string>();
for(const line of pairs.trim().split('\n')){const [en,id]=line.split('|');if(!en||!id)continue;if(/[A-Z][a-z]/.test(en)&&/[a-z]/.test(id)){idMap.set(en,id);enMap.set(id,en);}else{idMap.set(en,id);enMap.set(id,en);}}
// Indonesian template labels above are explicit reverse entries, not machine translations.
const reverseStart=pairs.indexOf('Ketersediaan platform pelacakan|');
for(const line of extraCopy.trim().split('\n')){const [en,id]=line.split('|');if(en&&id){idMap.set(en,id);enMap.set(id,en);}}
for(const line of templateCopy.trim().split('\n')){const [id,en]=line.split('|');if(id&&en){idMap.set(en,id);enMap.set(id,en);}}
for(const line of pairs.slice(reverseStart).trim().split('\n')){const [id,en]=line.split('|');if(id&&en){idMap.delete(id);enMap.delete(en);enMap.set(id,en);idMap.set(en,id);}}
const neutralCopy:Record<string,string>={'Start with a sample':'Start with a template','Explore the workflow with randomized, editable drafts.':'Connect your objectives, risks and evidence.','AI integration coming next':'Context intelligence','Generate sample risk':'Suggest risk','Generate sample objective':'Suggest objective','Generate sample profile':'Suggest profile','Sample generation available. AI connection comes next.':'Review suggestions before saving.','Try with a random sample':'Use suggestions','LOCAL PROTOTYPE / 01':'HORI','Fictional organization ? Synthetic sample data':'Organization workspace'};
export function displayCopy(value:string){if(neutralCopy[value.trim()])return neutralCopy[value.trim()];return value.replace(/Synthetic mitigation example:\s*/gi,'').replace(/Synthetic finding:\s*/gi,'').replace(/Synthetic audit report:\s*/gi,'').replace(/\b(?:synthetic|prototype|simulasi)\b\s*/gi,'').replace(/Skenario fiktif:\s*/gi,'').replace(/Synthetic demo news/gi,'News').replace(/Fictional organization\s*[·/]?\s*/gi,'').replace(/Local\s*-?\s*Random samples, no live AI/gi,'HORI').replace(/Supabase workspace - Random samples, no live AI/gi,'HORI').replace(/Random sample/gi,'Suggested').trim();}
export function tr<T>(value:T):T{
 if(typeof value!=='string')return value;
 if(/^https?:\/\//i.test(value))return value;
 const cleaned=displayCopy(value),map=language==='id'?idMap:enMap;
 let translated=map.get(cleaned)||map.get(value.trim())||cleaned;
 if(language==='id'&&cleaned.includes('impact')&&cleaned.length<15)translated=cleaned.replace('impact','dampak');
 if(translated===cleaned&&!/^https?:/.test(cleaned)){translated=cleaned.split(/( \/ | - )/).map(part=>map.get(part)||part).join('');}
 if(language==='id'&&/^Open .+/.test(translated))translated=translated.replace(/^Open /,'Buka ');if(language==='id'&&/^Close .+/.test(translated))translated=translated.replace(/^Close /,'Tutup ');
 if(language==='id'){
  translated=translated.replace(/^(\d{4}) objectives$/,'Sasaran $1').replace(/^Mitigation (\d+)$/,'Mitigasi $1').replace(/^Likelihood (\d), impact (\d)$/,'Kemungkinan $1, dampak $2').replace(/^KPIs for /,'KPI untuk ').replace(/^Likelihood /,'Kemungkinan ').replace(/ × impact/g,' × dampak').replace(/^Risk owner to be assigned$/,'Pemilik risiko belum ditetapkan');
 }
 return ((/^\s/.test(value)?' ':'')+translated+(/\s$/.test(value)?' ':'')) as T;
}
