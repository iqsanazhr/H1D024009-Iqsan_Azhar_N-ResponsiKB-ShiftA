# Responsi Praktikum Kecerdasan Buatan - Shift A

**Nama:** IQSAN AZHAR N  
**NIM:** H1D024009  
**Shift:** A

---

## 🚀 Penjelasan Program: Systems AI (Pakar & Fuzzy)

Program ini adalah platform kecerdasan buatan berbasis web yang mengintegrasikan dua sistem cerdas utama untuk membantu pengguna dalam bidang mekanik kendaraan bermotor dan optimasi pertanian.

### 1. Sistem Pakar Diagnosa Motor (Forward Chaining)

Sistem ini dirancang untuk mendeteksi kerusakan pada sepeda motor (khususnya merek Honda, Yamaha, dan Suzuki) berdasarkan gejala-gejala yang dialami.

- **Teknologi:** Menggunakan algoritma **Forward Chaining** untuk mencocokkan fakta (gejala) dengan aturan (knowledge base).
- **Integrasi API:** Terhubung dengan **API Ninjas** untuk mengambil spesifikasi teknis motor secara _real-time_ (kapasitas mesin, tipe transmisi, pendingin, dll).
- **Fitur:**
  - Pencarian model motor otomatis.
  - Deteksi otomatis tipe transmisi (CVT/Manual) untuk menyesuaikan daftar gejala.
  - Output diagnosis berupa nama kerusakan, solusi perbaikan, estimasi biaya, dan tingkat kepercayaan (_confidence level_).

### 2. Sistem Rekomendasi Pertanian (Logika Fuzzy)

Sistem ini memberikan saran aktivitas pertanian yang optimal berdasarkan kondisi lingkungan terkini.

- **Teknologi:** Menggunakan **Logika Fuzzy (Mamdani/Sugeno)** melalui library `scikit-fuzzy`.
- **Input:** Suhu udara, Kelembaban, dan Peluang Hujan.
- **Fitur:**
  - Integrasi peta interaktif (**Leaflet**) untuk menentukan lokasi.
  - Pengambilan data cuaca _real-time_ (opsional/simulasi) berdasarkan koordinat.
  - Output berupa skor rekomendasi aktivitas (Sangat Disarankan, Disarankan, atau Tidak Disarankan).

---

## 🛠️ Stack Teknologi

**Backend:**

- **FastAPI:** Framework Python modern untuk performa tinggi.
- **Scikit-Fuzzy:** Untuk pemrosesan logika fuzzy.
- **Pydantic:** Validasi data dan skema API.
- **Requests:** Komunikasi dengan API eksternal (API Ninjas).

**Frontend:**

- **React.js + Vite:** Library UI yang cepat dan responsif.
- **TailwindCSS:** Styling dengan konsep _Bento Box UI_ yang modern dan premium.
- **Lucide React:** Icon set yang konsisten dan elegan.
- **React Leaflet:** Integrasi peta interaktif.

---

## 📦 Instalasi Lokal

1. **Clone Repository:**

   ```bash
   git clone https://github.com/iqsanazhr/H1D024009-Iqsan_Azhar_N-ResponsiKB-ShiftA.git
   cd H1D024009-Iqsan_Azhar_N-ResponsiKB-ShiftA
   ```

2. **Backend Setup:**

   ```bash
   pip install -r requirements.txt
   # Jalankan server
   uvicorn api.index:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   npm install
   npm run dev
   ```

---

## 🌐 Deployment

Aplikasi ini dikonfigurasi untuk **Vercel Serverless Functions**. Semua endpoint backend dipetakan secara otomatis melalui file `vercel.json` ke direktori `api/`.

---

_Tugas ini disusun untuk memenuhi syarat Responsi Praktikum Kecerdasan Buatan 2026._
