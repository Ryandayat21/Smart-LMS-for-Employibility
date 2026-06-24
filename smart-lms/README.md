# Smart LMS for Employability (Skillvora) 🚀

Smart LMS for Employability adalah platform *Learning Management System* (LMS) modern berbasis *Artificial Intelligence* (AI) yang dirancang khusus untuk menjembatani kesenjangan antara kemampuan mahasiswa dan kebutuhan industri (*Gap Analysis*). 

Dengan fitur asesmen ganda (Pilihan Ganda & *Speech-to-Text Conversation*) serta dukungan kecerdasan buatan, sistem ini membantu mahasiswa menemukan potensi terbaik mereka dan memberikan rekomendasi karier yang dipersonalisasi.

## ✨ Fitur Utama

### 🎓 1. Mahasiswa (User)
- **Onboarding Cerdas**: Pemilihan profil (*Target Job*) di awal pendaftaran untuk menentukan jalur karier.
- **Asesmen Hibrida**:
  - **Pilihan Ganda (PG)**: Mengukur skor dasar untuk 10 aspek *Employability Skills* (Teknis, Komunikasi, *Problem Solving*, dll).
  - **AI Conversation Test**: Simulasi wawancara verbal. Sistem menangkap suara (*Speech-to-Text*) dan dinilai langsung oleh AI secara *real-time*.
- **Dashboard Analitik**: Visualisasi kompetensi menggunakan *Radar Chart* dan pelacakan progress secara dinamis.
- **AI Career Analyst**: Analisis kesenjangan (*Gap Analysis*) otomatis antara skor aktual mahasiswa vs standar industri profesi yang dituju.
- **Career Roadmap**: Ekspor jalur karier, rekomendasi belajar, dan hasil analisis AI ke dalam format dokumen PDF.

### 👨‍🏫 2. Instruktur (Dosen)
- **Manajemen Kelas**: Membuat kelas unik dengan kode *join* khusus (seperti Google Classroom).
- **Manajemen Bank Soal**: Membuat paket asesmen khusus dan mendistribusikannya ke dalam kelas.
- **Monitoring Mahasiswa**: Pantauan *real-time* perkembangan nilai seluruh mahasiswa di kelasnya.
- **Eksport Data Lengkap**: Ekspor hasil asesmen seluruh mahasiswa (termasuk narasi dari AI) ke dalam format Excel (`.xlsx`).

### 👑 3. Administrator
- **Super Dashboard**: Memantau statistik keseluruhan sistem (total mahasiswa, kelas, dan instruktur).
- **Manajemen Pengguna**: Mengubah profil, status, dan *role* (peran) pengguna.
- **Approval Instruktur**: Memverifikasi pengajuan pendaftaran dari dosen/instruktur.
- **Site Settings**: Mengonfigurasi tampilan dan teks pendaftaran.

## 🛠️ Tech Stack & Arsitektur

Proyek ini dibangun dengan tumpukan teknologi modern:
- **Frontend**: React.js (via Vite)
- **Styling**: Tailwind CSS & Lucide React (Icons)
- **Charting**: Recharts (Radar / Spiderweb Chart)
- **Backend & Database**: Firebase (Authentication & Cloud Firestore)
- **Artificial Intelligence**: OpenRouter API (Mendukung integrasi Llama, Gemma, DeepSeek, dll)
- **Speech-to-Text**: Web Speech API (Native Browser Engine)

## 📂 Struktur Direktori Utama

```text
smart-lms/
├── public/                 # Aset statis
├── src/
│   ├── components/         # Komponen UI modular (Sidebar, PrintRoadmap, AI Conversation)
│   ├── pages/              # Halaman utama (Dashboard, Assessment, Admin, dll)
│   ├── utils/              # Fungsi utilitas (Eksport Excel, Format Data)
│   ├── App.jsx             # Root Component & State Manager Utama
│   ├── firebase.js         # Konfigurasi & Inisialisasi Firebase
│   └── main.jsx            # React DOM Entry Point
├── index.html              # Template HTML Utama
├── package.json            # Dependensi Proyek
├── tailwind.config.js      # Konfigurasi Tailwind
└── vite.config.js          # Konfigurasi Vite
```

## 🗄️ Struktur Database (Cloud Firestore)

Aplikasi ini menggunakan **Cloud Firestore** sebagai database NoSQL. Berikut adalah penjelasan struktur koleksi (*collections*) dan dokumen yang digunakan berdasarkan skema database:

### 1. Koleksi `users`
Menyimpan data profil pengguna (Mahasiswa, Instruktur, dan Admin), termasuk skor kompetensi aktual dan target skor industri.
* **Fields**:
  * `name` / `fullName` (String): Nama lengkap pengguna.
  * `email` (String): Alamat email untuk login.
  * `phone` (String): Nomor telepon pengguna.
  * `age` (String): Usia pengguna.
  * `bio` (String): Deskripsi diri singkat/biodata.
  * `education` (String): Riwayat pendidikan terakhir (misal: "S1 Informatika").
  * `role` (String): Peran pengguna (`user` untuk mahasiswa, `instructor` untuk dosen, atau `admin`).
  * `isNew` (Boolean): Status apakah pengguna baru pertama kali mendaftar dan belum menyelesaikan asesmen awal.
  * `classId` / `classCode` / `className` (String): Referensi ID, kode unik, dan nama kelas tempat mahasiswa tergabung.
  * `packageId` / `packageName` (String): ID dan nama paket asesmen yang sedang ditugaskan kepada mahasiswa tersebut.
  * `targetJob` (String): Jalur karier/pekerjaan yang ditargetkan (misalnya `software-eng`).
  * `skills` (Map): Nilai kompetensi aktual saat ini untuk 10 aspek *employability* (tipe data `int64` / `double`):
    * `attentionDetail`, `communication`, `criticalThinking`, `digitalLiteracy`, `emotionalIntel`, `leadership`, `problemSolving`, `teamwork`, `technical`, `workEthic`.
  * `targetScores` (Map): Target skor standar industri untuk 10 aspek kompetensi di atas yang disesuaikan dengan pekerjaan target (`targetJob`).

### 2. Koleksi `instructor_applications`
Menyimpan data pengajuan pendaftaran pengguna sebagai Instruktur (Dosen) sebelum disetujui oleh Administrator.
* **Fields**:
  * `username` (String): Username pendaftar.
  * `displayName` (String): Nama tampilan instruktur.
  * `email` (String): Alamat email.
  * `password` (String): Kata sandi akun.
  * `status` (String): Status pendaftaran (`pending`, `approved`, `rejected`).
  * `createdAt` (Timestamp): Waktu pengajuan pendaftaran dilakukan.
  * `approvedAt` (Timestamp): Waktu pengajuan disetujui oleh administrator.

### 3. Koleksi `classes`
Menyimpan data kelas belajar yang dibuat oleh Instruktur.
* **Fields**:
  * `classCode` (String): Kode kelas unik (misal: `C6X8H8`) yang digunakan mahasiswa untuk masuk ke kelas.
  * `className` (String): Nama kelas.
  * `createdBy` (String): ID Instruktur pembuat kelas (merujuk ke UID di koleksi `users`).
  * `packageId` (String): ID paket asesmen yang ditugaskan ke kelas ini.
  * `packageName` (String): Nama paket asesmen yang ditugaskan.
  * `createdAt` (Timestamp): Waktu pembuatan kelas.

### 4. Koleksi `question_packages`
Menyimpan data paket soal/asesmen kompetensi yang dikelola oleh Instruktur.
* **Fields**:
  * `packageName` (String): Nama paket soal/asesmen.
  * `targetJob` (String): Pekerjaan target atau kelas terkait dari paket asesmen ini.
  * `createdBy` (String): ID pembuat paket (UID Instruktur).
  * `creatorRole` (String): Peran pembuat (`instructor`).
  * `createdAt` (Timestamp): Waktu pembuatan paket soal.
  * `targetScores` (Map): Target skor standar industri (10 aspek employability) yang ditetapkan untuk paket asesmen ini.

### 5. Koleksi/Sub-koleksi `questions`
Menyimpan butir-butir pertanyaan asesmen (soal pilihan ganda) yang terkait dengan paket soal.
* **Fields**:
  * `questionText` (String): Konten pertanyaan asesmen.
  * `scenario` (String): Latar belakang skenario studi kasus (jika ada).
  * `type` (String): Tipe soal (misalnya `pg` untuk pilihan ganda).
  * `aspect` (String): Aspek kompetensi utama yang dinilai (misal: `leadership`).
  * `targetedAspects` (Array): Daftar aspek tambahan yang ikut dinilai.
  * `weight` (Number): Bobot penilaian untuk pertanyaan ini.
  * `order` (Number): Urutan nomor pertanyaan.
  * `options` (Array of Maps): Daftar pilihan jawaban asesmen. Setiap objek pilihan memiliki:
    * `label` (String): Label opsi (misal: `A`, `B`, `C`, `D`, `E`).
    * `text` (String): Teks deskripsi jawaban.
    * `score` (Number): Skor poin yang didapatkan pengguna jika memilih jawaban ini.

### 6. Koleksi `ai_summaries`
Menyimpan log hasil analisis rekomendasi karier berbasis kecerdasan buatan (AI) untuk mahasiswa.
* **Fields**:
  * `uid` (String): ID mahasiswa bersangkutan (UID pengguna).
  * `name` (String): Nama mahasiswa.
  * `education` (String): Latar belakang pendidikan terakhir.
  * `targetJob` (String): Pekerjaan target/karier impian.
  * `hasProjects` (Boolean): Menunjukkan apakah mahasiswa memiliki riwayat proyek portofolio.
  * `projectCount` (Number): Jumlah proyek portofolio yang dicantumkan.
  * `hasCerts` (Boolean): Menunjukkan apakah mahasiswa memiliki sertifikasi keahlian.
  * `certCount` (Number): Jumlah sertifikasi keahlian.
  * `generatedAt` (Timestamp): Waktu ketika analisis AI berhasil di-generate.
  * `skills` (Map): Nilai aktual kompetensi mahasiswa pada saat analisis di-generate (10 aspek).
  * `summary` (String): Konten markdown laporan evaluasi AI yang terdiri dari tag parsing berikut:
    * `<kecocokan>`: Tabel perbandingan skor aktual vs target industri serta gap nilai.
    * `<rekomendasi>`: Rekomendasi langkah konkret pengembangan skill mahasiswa.
    * `<keselarasan>`: Evaluasi kelayakan portofolio/sertifikasi mahasiswa dan saran sertifikasi industri penunjang karier.

---

## 🚀 Instalasi & Cara Menjalankan (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek secara lokal:

### 1. Kloning Repositori
```bash
git clone https://github.com/[username]/smart-lms.git
cd smart-lms
```

### 2. Instalasi Dependensi
Pastikan Anda sudah menginstal **Node.js** (rekomendasi: versi 18+).
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (*Environment Variables*)
Buat file `.env` di folder *root* proyek (sejajar dengan `package.json`), dan isi dengan kredensial Firebase serta API Key OpenRouter Anda:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`.

## 🔐 Manajemen Akses & Akun Khusus
Sistem menggunakan *Firestore* untuk mencatat hak akses (*role*). Terdapat tiga hak akses: `user`, `instructor`, dan `admin`.
- Untuk mendapatkan hak akses **Admin**, ubah nilai `role` dari `"user"` menjadi `"admin"` pada dokumen pengguna terkait secara manual di Firebase Console.
- Untuk **Instruktur**, pendaftaran dilakukan melalui halaman khusus dan harus disetujui (di-*approve*) oleh Admin melalui dasbor.

## 🤝 Kontribusi
Jika Anda ingin berkontribusi pada pengembangan LMS ini, silakan buat *Pull Request* atau laporkan isu di tab **Issues**. Semua saran dan perbaikan sangat dihargai.

---
*Dibuat untuk memajukan pendidikan dan keselarasan karier generasi muda.* 🎓✨
