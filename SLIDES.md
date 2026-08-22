# Penjelasan Presenter — Per Slide

> Disusun berdasarkan slide final (18 slide) yang sudah diupload, mengikuti gaya penulisan pada `Slide Presentasi v3.md`.

---

### Slide 1 (Judul Penelitian)

Penerapan Algoritma RSA dan EdDSA dengan Metode Hybrid-Signature untuk Keamanan Dokumen Digital Perusahaan
Raihan Adam — 1197050109
Sidang Kolokium

Penjelasan Presenter:

> Buka presentasi dengan menyebutkan judul lengkap, nama, dan NIM. Sampaikan dalam satu kalimat bahwa penelitian ini mengusulkan sistem tanda tangan digital hybrid (RSA + EdDSA) yang disisipkan pada metadata dokumen — bukan pada struktur fisik file — untuk menjaga integritas dan keaslian dokumen digital perusahaan.

---

### Slide 2 (Latar Belakang)

- **Ancaman Utama**: Integritas dan autentikasi dokumen digital (kontrak, sertifikat) rentan terhadap pemalsuan dan manipulasi.
- **Kelemahan Standar Industri**: PAdES (PDF) dan XAdES (DOCX/XLSX) menyisipkan tanda tangan langsung ke struktur fisik file.
  - Akibatnya nilai hash dokumen asli berubah.
  - Menyulitkan validasi berbasis content-based hashing.
- **Solusi yang Diusulkan**: Pendekatan metadata embedding dengan metode hybrid-signature (RSA + EdDSA).
  - Tanda tangan disimpan di lapisan metadata, bukan konten inti.
  - Struktur fisik dan nilai hash konten dokumen tetap konsisten.
  - Diterapkan pada skenario closed-loop internal perusahaan.

Penjelasan Presenter:

> Jelaskan mengapa dokumen digital perusahaan perlu diamankan, lalu soroti kelemahan mendasar PAdES/XAdES: penyisipan signature ke struktur fisik file membuat hash dokumen asli ikut berubah, sehingga validasi berbasis content-based hashing jadi tidak konsisten. Tutup dengan menegaskan solusi yang diusulkan: signature disimpan di lapisan metadata agar konten inti dokumen tetap utuh, diterapkan pada skenario closed-loop internal perusahaan.

---

### Slide 3 (Rumusan Masalah dan Tujuan Penelitian)

- **Rumusan Masalah**:
  1. Bagaimana menerapkan kombinasi algoritma digital signature (RSA dan EdDSA) pada metadata dokumen digital?
  2. Bagaimana kinerja kombinasi algoritma digital signature (RSA dan EdDSA) dalam proses tanda tangan dan verifikasi pada metadata dokumen digital?
- **Tujuan Penelitian**:
  1. Menerapkan kombinasi algoritma digital signature pada metadata dokumen digital untuk menjamin keaslian pengirim dan integritas data.
  2. Mengetahui kinerja kombinasi algoritma terkait efisiensi waktu komputasi dan ruang penyimpanan dalam proses tanda tangan dan verifikasi.

Penjelasan Presenter:

> Sampaikan dua rumusan masalah secara berurutan dan jelas — penerapan algoritma pada metadata, lalu evaluasi kinerjanya. Pasangkan masing-masing dengan tujuan penelitian yang sesuai, karena keduanya memang dirancang berpasangan: rumusan masalah 1 dijawab oleh tujuan integritas & otentikasi, rumusan masalah 2 dijawab oleh tujuan efisiensi komputasi.

---

### Slide 4 (Fokus dan Batasan Penelitian)

- **Parameter Batasan Penelitian**:
  - Integrasi Metadata: berfokus pada penyisipan algoritma RSA dan EdDSA pada metadata tanpa memodifikasi isi dokumen.
  - Validitas Konten: menggunakan metode content-based hashing, tidak dirancang untuk standar PAdES atau XAdES.
  - Keamanan: berfokus pada pencegahan modifikasi konten dan replay attack.
  - Pengujian: dilakukan pada localhost untuk mengukur durasi signing, verifikasi, serta ukuran file.
- **Format Dokumen**: PDF, DOCX, XLSX.
- **Skenario Distribusi**: lingkungan internal (closed-loop environment), penandatanganan tunggal (single-signature).

Penjelasan Presenter:

> Tekankan bahwa penelitian ini secara sadar tidak mengikuti standar PAdES/XAdES karena tujuannya adalah validasi berbasis konten (content-based hashing), bukan berbasis struktur fisik file. Sebutkan tiga format dokumen yang didukung dan bahwa pengujian dilakukan di lingkungan localhost/closed-loop dengan skema single-signature — bukan multi-signature atau distributed system. Bisa disisipkan secara lisan di sini bahwa penelitian menggunakan metodologi DSRM yang akan dijelaskan pada slide berikutnya.

---

### Slide 5 (Kerangka Pemikiran)

- **Fase 1 — Identifikasi Masalah**: Dokumen digital perusahaan rentan dimanipulasi, algoritma tunggal memiliki keterbatasan kinerja, dan penyisipan tanda tangan langsung ke fisik file berisiko merusak nilai hash.
- **Fase 2 — Perancangan Artefak**: Dirancang sistem Hybrid-Signature (RSA + EdDSA) yang menyimpan tanda tangan di metadata dokumen dengan payload `document_id | document_hash` untuk mencegah replay attack.
- **Fase 3 — Evaluasi & Uji**: Sistem diuji di lingkungan lokal untuk mengukur fungsionalitas (penolakan manipulasi & key revocation) serta efisiensi kinerja berupa durasi komputasi dan overhead ukuran file.
- **Fase 4 — Hasil Akhir**: Dihasilkan artefak sistem yang mampu menjamin autentikasi dan integritas dokumen secara utuh, dengan keseimbangan optimal antara keamanan tinggi dan efisiensi beban operasional.

Penjelasan Presenter:

> Jelaskan kerangka pemikiran sebagai alur logika dari masalah menuju solusi: masalah di dunia nyata (Fase 1) mendorong perancangan artefak (Fase 2), yang kemudian diuji secara fungsional dan kinerja (Fase 3), hingga menghasilkan sistem akhir yang seimbang antara keamanan dan efisiensi (Fase 4). Slide ini menjembatani latar belakang menuju metodologi penelitian pada slide berikutnya.

---

### Slide 6 (State of The Art dan Research Gap)

| Aspek | Penelitian Sebelumnya | Kelemahan | Solusi Penelitian |
|---|---|---|---|
| Algoritma Digital Signature | Mayoritas algoritma tunggal (RSA, ECDSA, atau EdDSA) | Trade-off: RSA lambat di signing, EdDSA belum terbukti luas kompatibilitasnya | Hybrid RSA + EdDSA secara paralel (concatenation combiner) |
| Penyisipan Signature | Disisipkan ke struktur fisik file (ByteRange PDF / node XML) | Struktur fisik berubah → hash dokumen asli berubah → content-based validation gagal | Signature disisipkan ke lapisan metadata — konten utama tidak dimodifikasi |
| Validitas Integritas | Berbasis hash keseluruhan file (file-based hashing) | Rentan shadow attack dan MITM; hash berubah jika metadata/struktur file diperbarui | Content-based hashing — hash hanya dari konten inti dokumen |
| Pencegahan Replay Attack | Tidak ditangani, atau hanya satu lapis | Signature sah bisa disalin ke dokumen/sesi lain tanpa terdeteksi | Dua lapis: hash comparison (Lapis 1) + payload binding `document_id \| document_hash` (Lapis 2) |
| Key Revocation | Tidak ada validasi historis status kunci | Dokumen lama sah bisa ditolak, atau dokumen palsu pasca-pencabutan bisa lolos | Validasi historis: `signed_at` vs `revoked_at` |
| Format Dokumen | Mayoritas hanya PDF | Tidak mencakup dokumen Office (DOCX, XLSX) yang umum di perusahaan | Mendukung PDF, DOCX, dan XLSX dengan pendekatan konsisten |

Penjelasan Presenter:

> Baca tabel ini per baris, bukan per kolom — setiap baris adalah satu gap yang dijawab penelitian ini. Tekankan bahwa penelitian-penelitian sebelumnya biasanya hanya menuntaskan satu atau dua aspek saja, sementara penelitian ini menggabungkan semuanya sekaligus: hybrid algorithm, metadata embedding, content-based hashing, pertahanan replay attack berlapis, dan key revocation historis, untuk multi-format dokumen perusahaan. Batasi waktu di slide ini maksimal 90 detik agar tidak menghabiskan waktu presentasi.

---

### Slide 7 (Design Science Research Methodology)

- **Langkah 1 — Identifikasi Masalah & Motivasi**: Menganalisis kerentanan dokumen digital dan keterbatasan standar konvensional.
- **Langkah 2 — Definisi Tujuan Solusi**: Merancang sistem hybrid-signature pada ruang metadata yang efisien.
- **Langkah 3 — Desain & Pengembangan**: Membangun arsitektur payload, logika kriptografi, dan instansiasi monorepo.
- **Langkah 4 — Demonstrasi**: Simulasi skenario penandatanganan dan verifikasi dokumen bisnis.
- **Langkah 5 — Evaluasi**: Pengujian fungsionalitas dan kinerja (artificial evaluation) di lingkungan lokal.
- **Langkah 6 — Komunikasi**: Pendokumentasian hasil pengujian ke dalam naskah tugas akhir.

Penjelasan Presenter:

> Jelaskan bahwa penelitian ini menggunakan DSRM (Design Science Research Methodology), yang membagi proses menjadi enam langkah berurutan dari identifikasi masalah hingga komunikasi hasil. Sampaikan secara singkat saja per langkah — slide ini berfungsi sebagai peta jalan, bukan tempat menjelaskan detail teknis (detail teknis akan muncul di slide-slide selanjutnya).

---

### Slide 8 (Algoritma Kriptografi dan Hybrid-Signature)

- **Algoritma RSA**: Kompatibilitas luas dan telah teruji keandalannya. Memerlukan ukuran kunci besar yang memengaruhi efisiensi waktu komputasi saat penandatanganan.
- **Algoritma EdDSA**: Memanfaatkan kurva Edwards dengan desain deterministik. Efisiensi komputasi tinggi, ukuran tanda tangan kecil, dan tahan terhadap serangan side-channel.
- **Hybrid-Signature**: Mengombinasikan kedua algoritma secara paralel untuk lapisan keamanan ganda. Mendukung crypto-agility — jika satu algoritma rentan, algoritma lain tetap menjamin validitas. Menghasilkan compact signature tanpa membebani penyimpanan.

Penjelasan Presenter:

> Bandingkan RSA dan EdDSA secara langsung, lalu jelaskan mengapa keduanya digabungkan. **Penting**: framing yang benar untuk konteks digital signature adalah RSA lambat di *signing* karena eksponen privatnya besar, tetapi sangat cepat di *verifikasi* karena eksponen publiknya kecil (umumnya 65537) — bukan "RSA lebih cepat di enkripsi". EdDSA sebaliknya unggul di signing karena desainnya deterministik dan efisien. Hybrid-signature menggabungkan keduanya secara paralel (concatenation combiner, bukan nested) sehingga kedua signature dihasilkan independen dari payload yang sama — kalau ditanya penguji, ini bisa dijelaskan dengan kalimat: "RSA dan EdDSA menandatangani payload yang sama secara paralel dan hasilnya disatukan; berbeda dengan nested di mana output satu algoritma menjadi input algoritma lainnya, yang lebih kompleks dan lebih lambat."

---

### Slide 9 (Metadata Embedding dan Struktur Dokumen)

- **Masalah Standar Konvensional**: PAdES (PDF) dan XAdES (DOCX/XLSX) menyisipkan tanda tangan ke "tubuh" fisik dokumen (ByteRange/XML Node), sehingga struktur fisik dan nilai hash dokumen berubah total.
- **Solusi — Metadata Embedding**: Signature disisipkan ke lapisan atribut/label ("kulit"), bukan konten inti.
  - PDF: XMP Metadata / Info Dictionary.
  - DOCX/XLSX: Core Metadata / Custom Props.
- **Novelty**: Pemisahan konten & data kriptografi — konten utama tetap utuh (0 pixel change), struktur fisik orisinal tetap terjaga, sehingga validasi content-based hashing tetap konsisten meskipun metadata tanda tangan ditambahkan.

Penjelasan Presenter:

> Ini adalah novelty pertama penelitian. Gambarkan perbedaannya secara visual: standar industri menyisipkan signature ke "tubuh" file (mengubah isi), sedangkan pendekatan ini menyisipkan ke "label/kulit" file yaitu metadata. Sebutkan implementasi konkret per format: XMP/Info Dictionary untuk PDF, Core Metadata/Custom Properties untuk DOCX dan XLSX. Tekankan hasilnya: konten utama tidak dimodifikasi sama sekali, sehingga nilai content-based hashing tetap konsisten walau metadata bertambah.

---

### Slide 10 (Replay Attack dan Payload Binding)

- **Pertahanan Lapisan Pertama — Integritas Konten**: Sistem memverifikasi "kesegaran" (liveness) dokumen melalui pengecekan hash real-time — menghitung ulang hash dokumen yang diunggah (`hash_current`) dan membandingkannya dengan `document_hash` dari database. Mendeteksi modifikasi konten atau pemindahan metadata.
- **Pertahanan Lapisan Kedua — Payload Binding**: Mengikat variabel unik ke dalam nilai hash untuk mencegah penggunaan ulang tanda tangan. Payload = `document_id + "|" + document_hash`. Setiap dokumen memiliki payload unik; verifikasi matematis gagal jika payload tidak cocok (anti-replay).
- **Mitigasi Replay Attack Berlapis**: Kombinasi pengecekan integritas fisik dan validasi matematis payload unik menutup celah penggunaan metadata sah pada sesi verifikasi yang berbeda.

Penjelasan Presenter:

> Ini adalah jantung keamanan sistem — sampaikan dua lapis pertahanan ini sebagai dua mekanisme yang **terpisah dan saling melengkapi**, bukan satu kesatuan. Lapisan pertama seperti "penjaga gerbang" yang mengecek apakah konten fisik dokumen masih sama (`hash_current` vs `document_hash`). Lapisan kedua adalah "penjaga dalam" yang memastikan tanda tangan tersebut memang dibuat khusus untuk dokumen ini melalui payload binding `document_id | document_hash`, sehingga signature yang sah tidak bisa disalin ke dokumen atau sesi lain tanpa terdeteksi. Tegaskan bahwa `document_hash` yang dipakai untuk pembanding berasal dari content-based hashing yang tersimpan di database, bukan diekstrak langsung dari metadata dokumen yang diupload — ini yang akan dijelaskan lebih detail di slide alur verifikasi.

---

### Slide 11 (Mekanisme Key Revocation)

- **Konsep Pembuatan Kunci**: Mekanisme untuk membatalkan status aktif kunci kriptografi sebelum masa berlaku habis, akibat kebocoran kunci atau perubahan afiliasi. Field `revoked_at` mencatat waktu eksak pencabutan kunci di database.
- **Logika Validasi Historis**: Membandingkan `signed_at` (metadata) dengan `revoked_at` (database).
  - `signed_at < revoked_at` = SAH (diteken saat kunci aktif).
  - `signed_at > revoked_at` = INVALID (diteken setelah kunci dicabut).
- **Integritas Historis Terjamin**: Sistem mampu membedakan status validitas dokumen berdasarkan siklus hidup kunci, mencegah validasi dokumen yang ditandatangani secara ilegal pasca kebocoran kunci.

Penjelasan Presenter:

> Soroti bahwa sistem tidak hanya memverifikasi keaslian tanda tangan, tapi juga "kapan" dokumen tersebut ditandatangani relatif terhadap status kuncinya. Ini mirip konsep CRL (Certificate Revocation List) pada PKI konvensional, tetapi disederhanakan untuk lingkungan closed-loop perusahaan tanpa bergantung pada Certificate Authority pihak ketiga. Jelaskan dua kondisi logika validasi dengan contoh sederhana: dokumen lama yang sah tetap bisa diverifikasi (dengan warning bahwa kuncinya kini sudah dicabut), sementara dokumen yang ditandatangani setelah pencabutan otomatis ditolak.

---

### Slide 12 (Alur Penandatanganan)

- **Persiapan**: Registrasi oleh User A; pembuatan kunci privat dan kunci publik.
- **Ekstraksi Konten**: PDF → XMP, DOCX → `document.xml`, XLSX → `workbook.xml`.
- **Hitung Hash**: Konten dokumen dibuat hash, disimpan ke database.
- **Buat Payload**: Payload = `document_id + "|" + document_hash`.
- **Penandatanganan dan Penyisipan**: Membuat sign untuk RSA dan EdDSA dari payload, disisipkan ke dalam metadata.

Penjelasan Presenter:

> Jelaskan alur ini sebagai lima tahap berurutan dari sisi User A (pengirim/penandatangan). Tekankan bahwa hash yang dihitung adalah content-based hash — diambil murni dari konten inti dokumen (XMP untuk PDF, `word/document.xml` untuk DOCX, `xl/workbook.xml` untuk XLSX), bukan dari keseluruhan file. Payload yang ditandatangani menggabungkan `document_id` dan `document_hash`, lalu kedua signature (RSA dan EdDSA) disisipkan bersamaan ke metadata dokumen — bukan ke struktur fisiknya.

---

### Slide 13 (Alur Verifikasi)

- **Upload Dokumen**: User B mengupload dokumen yang telah diterima dari User A.
- **Ekstraksi Metadata**: `doc_id`, `rsa_signature`, `eddsa_signature`, `key_id`, `signed_at`.
- **Pengecekan Lapis Pertama**: `hash_current == document_hash`.
- **Pengecekan Lapis Kedua**: Pengecekan RSA dan EdDSA menggunakan payload.
- **Pengecekan Lapis Ketiga**: `signed_at` vs `revoked_at`.

Penjelasan Presenter:

> Ini adalah salah satu titik paling kritis yang sering ditanyakan penguji, jadi sampaikan dengan hati-hati. Setelah `document_id` diekstrak dari metadata, sistem **tidak** langsung memakai nilai hash dari metadata sebagai pembanding — melainkan `document_id` tersebut dipakai sebagai parameter untuk mengambil `document_hash` yang sebenarnya dari database. Jadi yang dibandingkan dengan `hash_current` adalah `document_hash` dari database, bukan dari metadata dokumen yang diupload. Ini yang menutup celah session replay: jika dokumen yang sama diupload ulang, `document_hash` tetap diambil dari sumber yang tepercaya (database), bukan dari metadata yang berpotensi disalin. Setelah lapis pertama dan kedua (payload binding RSA/EdDSA) lolos, sistem baru mengecek status revocation kunci di lapis ketiga.

---

### Slide 14 (Hasil Pengujian Fungsionalitas)

| Skenario | Kondisi | Hasil |
|---|---|---|
| F-01 | Dokumen dan kunci valid | VALID |
| F-02 | Konten dokumen dimanipulasi | INVALID |
| F-03 | Metadata dihapus manual | INVALID |
| F-04 | Metadata dokumen A dipindah ke dokumen B | INVALID |
| F-05 | True Replay Attack (duplikasi sesi) | INVALID |
| F-06 | Kunci dicabut, dokumen lama | VALID dengan WARNING |
| F-07 | Kunci dicabut, dokumen baru | INVALID |
| F-08 | RSA signature dimanipulasi | INVALID |
| F-09 | EdDSA signature dimanipulasi | INVALID |

Seluruh 9 skenario lulus pengujian sesuai ekspektasi.

Penjelasan Presenter:

> Sampaikan bahwa seluruh 9 skenario black-box testing berhasil sesuai ekspektasi. Soroti khususnya F-04 dan F-05 sebagai bukti keberhasilan dua lapis pertahanan replay attack (payload binding dan integritas konten), serta perbandingan F-06 vs F-07 yang menunjukkan sistem memahami konsep waktu dan status kunci secara historis — bukan sekadar mengecek "kunci aktif atau tidak" secara statis. Tutup dengan menyimpulkan bahwa sistem berhasil mendeteksi manipulasi konten, mencegah replay attack, memvalidasi status pencabutan kunci secara historis, dan memverifikasi kedua algoritma secara independen.

---

### Slide 15 (Hasil Pengujian Kinerja)

| Format | Ukuran | RSA Signing (ms) | EdDSA Signing (ms) | RSA Verify (ms) | EdDSA Verify (ms) |
|---|---|---|---|---|---|
| PDF | 100KB | 34.7 | 12.4 | 0.07 | 0.09 |
| PDF | 1MB | 34.5 | 2.9 | 0.07 | 0.09 |
| PDF | 10MB | 32.8 | 3.4 | 0.05 | 0.08 |
| DOCX | 100KB | 35.1 | 3.1 | 0.06 | 0.08 |
| DOCX | 1MB | 25.2 | 3.7 | 0.07 | 0.07 |
| DOCX | 10MB | 24.1 | 4.1 | 0.10 | 0.11 |
| XLSX | 100KB | 39.5 | 12.9 | 0.08 | 0.11 |
| XLSX | 1MB | 36.1 | 4.2 | 0.06 | 0.07 |
| XLSX | 10MB | 34.2 | 3.5 | 0.09 | 0.12 |

Penjelasan Presenter:

> Sampaikan pola utamanya: proses signing RSA membutuhkan waktu lebih lama dibanding EdDSA di semua format dan ukuran file (kisaran 23–57 ms untuk RSA vs di bawah 5 ms untuk EdDSA pada kondisi normal). Angka EdDSA yang terlihat lebih tinggi pada file 100 KB (12.4 ms PDF, 12.9 ms XLSX) adalah anomali cold-start karena sistem baru pertama kali berjalan — jika ditanya penguji, jelaskan ini sebagai warming-up effect, bukan karakteristik algoritma, karena run-run berikutnya kembali normal di bawah 5 ms. Untuk verifikasi, tekankan bahwa kedua algoritma sama-sama sangat cepat (di bawah 0.13 ms) dan **tidak dipengaruhi oleh ukuran file**, karena validasi dilakukan terhadap payload hash, bukan terhadap keseluruhan isi file.

---

### Slide 16 (Hasil Pengujian Storage Overhead)

| Format | Ukuran | Overhead (bytes) | Overhead (%) |
|---|---|---|---|
| PDF | 100KB | -4,299 | -4.01% |
| PDF | 1MB | -57,438 | -5.40% |
| PDF | 10MB | -577,119 | -5.48% |
| DOCX | 100KB | +16,365 | +8.47% |
| DOCX | 1MB | +16,091 | +1.41% |
| DOCX | 10MB | +16,723 | +0.16% |
| XLSX | 100KB | +43,362 | +42.35% |
| XLSX | 1MB | +43,280 | +4.13% |
| XLSX | 10MB | +43,379 | +0.41% |

Penjelasan Presenter:

> Jelaskan bahwa penambahan ukuran file setelah ditandatangani bersifat **konstan dalam byte**, bukan proporsional terhadap ukuran dokumen — DOCX selalu bertambah sekitar 16 KB dan XLSX sekitar 43 KB, berapa pun ukuran file aslinya. Kalau penguji menyoroti angka XLSX 100KB yang terlihat besar (+42.35%), siapkan jawaban: "Overhead-nya konstan sekitar 43 KB untuk semua ukuran XLSX. Angka 42% terlihat besar karena file dasarnya memang kecil, yaitu 100 KB. Pada dokumen 1 MB overhead-nya sudah turun ke sekitar 4%, dan pada 10 MB hanya 0.41% — ini menunjukkan metadata signature berukuran tetap, bukan proporsional terhadap ukuran dokumen." Untuk PDF, jelaskan bahwa ukuran file justru berkurang 4–5.5% setelah ditandatangani karena proses penyimpanan metadata secara otomatis melakukan pemadatan (normalisasi) struktur XMP oleh pustaka yang digunakan — bukan karena ada data yang hilang.

---

### Slide 17 (Kesimpulan dan Saran)

- **Kesimpulan**:
  1. Sistem hybrid-signature (RSA + EdDSA) berhasil diterapkan pada metadata PDF, DOCX, dan XLSX tanpa memodifikasi isi utama dokumen.
  2. Algoritma RSA lebih lambat ketika penandatanganan (23–57 ms) dibanding EdDSA (< 5 ms), namun verifikasi keduanya sangat cepat (< 0.13 ms) dengan storage overhead yang kecil dan konstan.
  3. Sistem berhasil mencegah replay attack melalui pertahanan berlapis serta memvalidasi status pencabutan kunci secara historis.
- **Saran**:
  1. Implementasi algoritma post-quantum cryptography untuk ketahanan jangka panjang.
  2. Pengembangan mekanisme perlindungan metadata dari penghapusan/modifikasi pihak ketiga.
  3. Pengujian pada lingkungan multi-user dan distributed system.

Penjelasan Presenter:

> Jawab kedua rumusan masalah secara eksplisit di sini — penguji biasanya meminta ini secara langsung. Kesimpulan pertama menjawab rumusan masalah 1 (penerapan pada metadata berhasil tanpa merusak konten), kesimpulan kedua dan ketiga menjawab rumusan masalah 2 (kinerja dan keamanan sistem). Sampaikan saran sebagai arah pengembangan lanjutan yang jujur — bukan menutupi kekurangan, tapi mengakui bahwa sistem saat ini belum menguji skenario multi-user/distributed dan belum mengadopsi post-quantum cryptography. Tutup dengan membuka sesi tanya jawab.

---

### Slide 18 (Penutup)

Terima Kasih

Penjelasan Presenter:

> Ucapkan terima kasih kepada dosen pembimbing dan penguji atas waktu dan masukannya selama proses bimbingan, lalu persilakan sesi tanya jawab dimulai.

## Hal-hal yang mungkin akan ditanyakan

1. Kenapa sistem hanya dibuat lokal saja dan tidak di-deploy?
	> Karena penelitian ini fokus menjawab dua rumusan masalah, yaitu penerapan algoritma dan kinerjanya. Pengujian di lokal dipilih supaya pengukuran waktu penandatanganan dan verifikasi bebas dari faktor eksternal yang ditimbulkan pada sistem yang di-deploy, seperti latensi jaringan atau beban server jika menggunakan shared vps. Sehingga hasil yang saya dapatkan ini murni dari kinerja algoritma kriptografinya, bukan dari infrastruktur deployment.
2. Kenapa sistem hanya closed-loop?
	> Karena sistem ini bergantung pada database backend untuk validasi, bukan dari sertifikat digital seperti pada infrastruktur PKI publik. Oleh karena itu, skenario yang relevan dari penelitian ini adalah closed-loop. Dan untuk skenario lintas organisasi atau publik, dibutuhkan infrastruktur yang memiliki lembaga yang terpercaya untuk mengelola ini.
	> Karena penelitian ini adalah untuk membuktikan efektifitas pendekatan *content-based hashing* dan *metadata embedding* sebagai alternatif dari PAdES dan XAdES yang berbasis PKI. Membuat struktur yang benar-benar mengikuti standar PKI akan memperluas jangkauan penelitian yang jauh dari rumusan masalah yang ditetapkan.
3. Kenapa tidak menggunakan algoritma lain?
	> Karena pada EdDSA desainnya dibuat untuk menutupi kelemahan algoritma sebelumnya yaitu ECDSA, yaitu ketergantungan pada pembuatan nilai unik yang jika gagal diimplementasikan dengan benar akan bisa membocorkan kunci privat. EdDSA menggunakan nilai unik deterministik sehingga aman dari sisi implementasi. 
4. Kenapa harus menggunakan kedua algoritma?
	> Karena tidak ada satu algoritma yang unggul di semua aspek. Algoritma RSA yang memiliki kompabilitas luas dan verifikasi yang cepat namun lambat dalam penandatanganan. Lalu algoritma EdDSA yang ringan dan cepat namun belum teruji tahan terhadap komputer kuantum. Dengan penggabungan kedua algoritma ini, kelemahan salah satu algoritma bisa ditutupi oleh keunggulan algoritma lainnya. Serta ini juga menerapkan prinsip crypto-agility, jika di masa depan salah satu algoritma ditemukan rentan, maka sistem tidak bergantung sepenuhnya pada satu algoritma saja.
