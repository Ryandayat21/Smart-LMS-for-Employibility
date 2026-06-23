import * as XLSX from 'xlsx';

/**
 * Fungsi untuk mengunduh data asesmen mahasiswa ke dalam format Excel (.xlsx)
 * @param {Array} studentData - Array of object berisi data skor dan penjelasan AI mahasiswa
 * @param {String} packageName - Nama paket soal/asesmen untuk penamaan file
 */
export const exportAssessmentToExcel = (studentData, packageName = "Asesmen") => {
  // 1. Map data dari StudentResults ke struktur kolom Excel yang rapi terpisah
  const formattedRows = studentData.map((item, index) => {
    return {
      "No": index + 1,
      "Nama Mahasiswa": item.studentName || "Anonymous",
      "Email": item.studentEmail || "-",
      "Kelas": item.className || "-",
      "Total Skor Tertulis": item.totalScore || 0,
      "Skor AI Voice": item.voiceScore || 0,
      "Aspek Dominan": item.dominantAspect || "-",
      "Rekomendasi Karier (AI)": item.recommendedJob || "-",
      // 💡 KOLOM BARU: Hasil parsing tabel gap analisis AI
      "Analisis Gap Kompetensi (AI)": item.gapAnalysisAI || "Belum dianalisis",
      "Rangkuman Karir AI": item.aiExplanation || "Belum ada analisis AI"
    };
  });

  // 2. Buat worksheet baru dari objek JSON
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // 3. Atur lebar kolom (styling basic agar teks penjelasan panjang tidak saling tertumpuk)
  worksheet['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // Nama Mahasiswa
    { wch: 25 },  // Email
    { wch: 15 },  // Kelas
    { wch: 20 },  // Total Skor Tertulis
    { wch: 15 },  // Skor AI Voice
    { wch: 20 },  // Aspek Dominan
    { wch: 25 },  // Rekomendasi Karier
    { wch: 45 },  // Analisis Gap Kompetensi (Diberi ruang cukup untuk format string)
    { wch: 60 },  // Rangkuman Karir AI (Diberi ruang lebar karena teks narasi panjang)
  ];

  for (let row in worksheet) {
    if (row[0] === '!') continue; // Lewati properti konfigurasi bawaan sheet
    
    // Pastikan object alignment terdefinisi
    if (!worksheet[row].s) worksheet[row].s = {};
    worksheet[row].s.alignment = { 
        wrapText: true, 
        vertical: 'top' // Membuat posisi teks rapi rata atas
    };
  }

  // 4. Buat workbook baru dan masukkan worksheet ke dalamnya
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Asesmen");

  // 5. Generate file dan trigger otomatis download di browser
  const cleanPackageName = packageName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `hasil_asesmen_${cleanPackageName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
};