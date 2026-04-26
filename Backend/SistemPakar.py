"""
Sistem Pakar - Diagnosis Kerusakan Sepeda Motor
Metode: Forward Chaining (IF-THEN Rules)
Integrasi: API Ninjas — Motorcycle Specs (api-ninjas.com)
Cakupan: Honda, Yamaha, Suzuki
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import requests
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Frontend', '.env')
load_dotenv(env_path)

app = FastAPI(
    title="Sistem Pakar Diagnosis Sepeda Motor",
    description=(
        "Diagnosis kerusakan sepeda motor menggunakan Forward Chaining. "
        "Spesifikasi motor diambil real-time dari API Ninjas."
    ),
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
#  KONFIGURASI API NINJAS
#  Taruh API key di environment variable:
#  export API_NINJAS_KEY=your_key_here
# ─────────────────────────────────────────

API_NINJAS_KEY = os.getenv("API_NINJAS_KEY", "")
API_NINJAS_URL = "https://api.api-ninjas.com/v1/motorcycles"
MEREK_DIDUKUNG = ["honda", "yamaha", "suzuki"]


# ─────────────────────────────────────────
#  AMBIL SPESIFIKASI MOTOR — API NINJAS
# ─────────────────────────────────────────

def fetch_spesifikasi(make: str, model: str, year: Optional[int] = None) -> dict:
    """
    Ambil spesifikasi motor dari API Ninjas.
    Return dict spesifikasi, atau raise HTTPException jika gagal.
    """
    if not API_NINJAS_KEY:
        raise HTTPException(
            status_code=500,
            detail="API key belum dikonfigurasi. Set environment variable API_NINJAS_KEY=your_key"
        )

    params = {"make": make, "model": model}
    if year:
        params["year"] = year

    try:
        r = requests.get(
            API_NINJAS_URL,
            headers={"X-Api-Key": API_NINJAS_KEY},
            params=params,
            timeout=8
        )
        r.raise_for_status()
        data = r.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Gagal mengambil data dari API Ninjas: {str(e)}")

    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Motor '{make} {model}' tidak ditemukan. Coba cek ejaan atau gunakan GET /motor/cari."
        )

    return data[0]  # ambil hasil pertama (paling relevan)


def parse_spesifikasi(raw: dict) -> dict:
    """
    Normalisasi field dari API Ninjas ke format internal sistem pakar.
    Semua field dikonversi ke string bersih atau None jika tidak tersedia.
    """
    def ambil(key):
        val = raw.get(key)
        return str(val).strip() if val not in [None, "", "N/A"] else None

    return {
        "merek":            ambil("make"),
        "model":            ambil("model"),
        "tahun":            ambil("year"),
        "tipe":             ambil("type"),
        "kapasitas_mesin":  ambil("displacement"),        # cc
        "tenaga_max":       ambil("power"),               # hp
        "torsi_max":        ambil("torque"),              # Nm
        "tipe_pendingin":   ambil("cooling"),             # Air / Liquid
        "tipe_transmisi":   ambil("transmission"),        # Manual / CVT / dll
        "tipe_bahan_bakar": ambil("fuel_system"),         # Carb / Injection
        "kapasitas_tangki": ambil("fuel_capacity"),       # liter
        "berat":            ambil("dry_weight"),          # kg
        "starter":          ambil("starter"),             # Electric / Kick / Both
        "rem_depan":        ambil("front_brakes"),
        "rem_belakang":     ambil("rear_brakes"),
        "suspensi_depan":   ambil("front_suspension"),
        "suspensi_belakang":ambil("rear_suspension"),
    }


def adaptasi_rules(spek: dict) -> dict:
    """
    Dari spesifikasi motor, tentukan rules tambahan / penyesuaian
    yang relevan untuk sistem pakar.
    Kembalikan dict berisi flag konteks untuk inferensi.
    """
    pendingin  = (spek.get("tipe_pendingin") or "").lower()
    transmisi  = (spek.get("tipe_transmisi") or "").lower()
    bbm        = (spek.get("tipe_bahan_bakar") or "").lower()
    rem_depan  = (spek.get("rem_depan") or "").lower()
    starter    = (spek.get("starter") or "").lower()

    return {
        "pakai_pendingin_air":  any(k in pendingin  for k in ["liquid", "water", "radiator"]),
        "pakai_cvt":            "cvt" in transmisi or "automatic" in transmisi,
        "pakai_injeksi":        any(k in bbm        for k in ["injection", "fuel injection", "fi", "efi", "pgm-fi"]),
        "pakai_rem_cakram":     "disc" in rem_depan,
        "pakai_starter_elektrik": any(k in starter  for k in ["electric", "both"]),
    }


# ─────────────────────────────────────────
#  BASIS PENGETAHUAN — GEJALA
# ─────────────────────────────────────────

GEJALA = {
    # MESIN
    "G01": "Mesin tidak bisa dinyalakan",
    "G02": "Mesin susah dinyalakan saat dingin",
    "G03": "Mesin mati mendadak saat berjalan",
    "G04": "Mesin terasa kasar / bergetar berlebihan",
    "G05": "Suara mesin tidak normal (ngelitik / ketok)",
    "G06": "Mesin overheat / terlalu panas",
    "G07": "Tenaga mesin terasa drop / lemah",
    "G08": "Asap knalpot berwarna putih",
    "G09": "Asap knalpot berwarna hitam",
    "G10": "Oli mesin cepat berkurang",
    # KELISTRIKAN
    "G11": "Lampu tidak menyala",
    "G12": "Klakson tidak bunyi",
    "G13": "Starter elektrik tidak berfungsi",
    "G14": "Indikator baterai menyala",
    "G15": "Lampu sein tidak berkedip normal",
    "G16": "Speedometer / panel instrumen mati",
    "G17": "Kipas radiator tidak berputar",
    # BAHAN BAKAR
    "G18": "Konsumsi bahan bakar boros",
    "G19": "Motor brebet saat digas",
    "G20": "Motor tidak responsif saat akselerasi",
    "G21": "Bau bahan bakar menyengat",
    "G22": "Mesin mati saat idle / langsam",
    # REM
    "G23": "Rem depan tidak pakem",
    "G24": "Rem belakang tidak pakem",
    "G25": "Suara berdecit saat pengereman",
    "G26": "Tuas rem terasa keras / tidak fleksibel",
    "G27": "Motor menarik ke satu sisi saat ngerem",
    # TRANSMISI & KOPLING
    "G28": "Perpindahan gigi terasa berat",
    "G29": "Motor melompat saat pindah gigi",
    "G30": "Kopling selip (rpm naik tapi kecepatan tidak bertambah)",
    "G31": "Suara berisik dari area transmisi",
    # PENDINGIN
    "G32": "Indikator temperatur tinggi menyala",
    "G33": "Coolant / air radiator cepat berkurang",
    "G34": "Ada kebocoran cairan di bawah motor",
    # KAKI-KAKI
    "G35": "Setang terasa berat saat belok",
    "G36": "Motor oleng / tidak stabil",
    "G37": "Suara berdecit dari area roda",
    "G38": "Suspensi terasa sangat keras atau sangat empuk",
    # CVT (khusus motor matic)
    "G39": "Tarikan awal terasa berat / slip",
    "G40": "Suara berisik dari area CVT / sabuk",
    "G41": "Motor tidak bergerak meski gas ditarik",
    # INJEKSI (khusus motor injeksi)
    "G42": "Lampu MIL / check engine menyala",
    "G43": "Idle tidak stabil meski mesin sudah panas",
}


# ─────────────────────────────────────────
#  BASIS PENGETAHUAN — KERUSAKAN & RULES
# ─────────────────────────────────────────
# "konteks": jika diisi, rule ini hanya aktif jika flag konteks bernilai True
# "konteks" = None berarti rule universal (berlaku semua motor)

KERUSAKAN = {
    "K01": {
        "nama": "Busi Mati / Kotor",
        "komponen": "Mesin",
        "gejala": ["G01", "G02", "G03", "G05", "G07", "G19"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Periksa kondisi busi, bersihkan elektroda jika kotor",
            "Ganti busi jika elektroda sudah aus atau terbakar",
            "Pastikan celah busi sesuai spesifikasi (umumnya 0.8–1.0 mm)",
            "Periksa kabel busi, ganti jika retak atau longgar",
        ],
        "estimasi_biaya": "Rp 15.000 – Rp 75.000",
    },
    "K02": {
        "nama": "Karburator Kotor / Bermasalah",
        "komponen": "Bahan Bakar",
        "gejala": ["G02", "G07", "G09", "G18", "G19", "G20", "G22"],
        "min": 3,
        "konteks": "karburator",   # hanya aktif jika motor BUKAN injeksi
        "solusi": [
            "Bersihkan karburator secara menyeluruh (pilot jet, main jet, jarum)",
            "Setel ulang campuran udara-bahan bakar",
            "Ganti filter bahan bakar jika sudah lama",
        ],
        "estimasi_biaya": "Rp 50.000 – Rp 200.000",
    },
    "K03": {
        "nama": "Injektor Kotor / Sensor Injeksi Bermasalah",
        "komponen": "Bahan Bakar",
        "gejala": ["G02", "G07", "G09", "G18", "G19", "G20", "G22", "G42", "G43"],
        "min": 3,
        "konteks": "injeksi",      # hanya aktif jika motor injeksi
        "solusi": [
            "Lakukan injector cleaning (ultrasonik atau cairan pembersih)",
            "Periksa dan reset sensor TPS, O2, dan MAP",
            "Scan kode error dengan diagnostic tool (MIL lamp)",
            "Ganti injektor jika sudah tersumbat parah",
        ],
        "estimasi_biaya": "Rp 100.000 – Rp 500.000",
    },
    "K04": {
        "nama": "Aki / Baterai Lemah atau Mati",
        "komponen": "Kelistrikan",
        "gejala": ["G01", "G11", "G12", "G13", "G14", "G16"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Ukur tegangan aki (normal: 12.4–12.8V kondisi diam)",
            "Charge aki jika tegangan rendah",
            "Ganti aki jika tidak bisa menyimpan daya",
            "Periksa kiprok / regulator rectifier",
        ],
        "estimasi_biaya": "Rp 150.000 – Rp 450.000",
    },
    "K05": {
        "nama": "Sistem Pengisian (Kiprok/Alternator) Rusak",
        "komponen": "Kelistrikan",
        "gejala": ["G13", "G14", "G11", "G03"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Periksa tegangan output alternator saat mesin hidup (normal: 13.5–14.5V)",
            "Ganti kiprok / regulator rectifier jika rusak",
            "Periksa kabel dan konektor sistem pengisian",
        ],
        "estimasi_biaya": "Rp 100.000 – Rp 400.000",
    },
    "K06": {
        "nama": "Filter Udara Kotor / Tersumbat",
        "komponen": "Bahan Bakar",
        "gejala": ["G07", "G09", "G18", "G20", "G22"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Bersihkan filter udara menggunakan udara bertekanan",
            "Ganti filter udara jika sudah sangat kotor atau robek",
        ],
        "estimasi_biaya": "Rp 25.000 – Rp 100.000",
    },
    "K07": {
        "nama": "Oli Mesin Habis / Kualitas Buruk",
        "komponen": "Mesin",
        "gejala": ["G04", "G05", "G06", "G07", "G10"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Periksa level oli menggunakan dipstick",
            "Ganti oli mesin sesuai spesifikasi pabrikan",
            "Periksa kebocoran oli di gasket, seal, dan baut pembuangan",
        ],
        "estimasi_biaya": "Rp 50.000 – Rp 150.000",
    },
    "K08": {
        "nama": "Ring Piston / Piston Aus",
        "komponen": "Mesin",
        "gejala": ["G08", "G10", "G07", "G04", "G18"],
        "min": 3,
        "konteks": None,
        "solusi": [
            "Lakukan kompresi test untuk memastikan kebocoran kompresi",
            "Ganti ring piston jika hasil kompresi rendah",
            "Overhaul mesin jika piston dan dinding silinder sudah aus",
        ],
        "estimasi_biaya": "Rp 300.000 – Rp 1.500.000",
    },
    "K09": {
        "nama": "Kampas Rem Aus",
        "komponen": "Rem",
        "gejala": ["G23", "G24", "G25"],
        "min": 1,
        "konteks": None,
        "solusi": [
            "Periksa ketebalan kampas rem (ganti jika < 2 mm)",
            "Ganti kampas rem depan dan/atau belakang",
            "Bersihkan cakram / tromol dari kotoran dan karat",
        ],
        "estimasi_biaya": "Rp 50.000 – Rp 200.000",
    },
    "K10": {
        "nama": "Minyak Rem Habis / Bocor",
        "komponen": "Rem",
        "gejala": ["G23", "G24", "G26", "G34"],
        "min": 2,
        "konteks": "rem_cakram",   # hanya relevan jika pakai rem cakram
        "solusi": [
            "Periksa level minyak rem di reservoir",
            "Isi minyak rem sesuai spesifikasi (DOT 3 atau DOT 4)",
            "Periksa kebocoran pada selang, kaliper, dan master rem",
            "Bleeding rem jika ada angin dalam sistem",
        ],
        "estimasi_biaya": "Rp 20.000 – Rp 250.000",
    },
    "K11": {
        "nama": "Kopling Manual Aus / Selip",
        "komponen": "Transmisi",
        "gejala": ["G30", "G28", "G07", "G18"],
        "min": 2,
        "konteks": "manual",       # hanya aktif jika motor manual (bukan CVT)
        "solusi": [
            "Setel jarak main tuas kopling",
            "Periksa dan ganti kampas kopling jika sudah tipis",
            "Ganti per kopling jika sudah lemah",
        ],
        "estimasi_biaya": "Rp 100.000 – Rp 500.000",
    },
    "K12": {
        "nama": "CVT / V-Belt Aus atau Putus",
        "komponen": "Transmisi CVT",
        "gejala": ["G39", "G40", "G41", "G30", "G07"],
        "min": 2,
        "konteks": "cvt",          # hanya aktif jika motor matic/CVT
        "solusi": [
            "Periksa kondisi V-belt, ganti jika retak atau aus (setiap 20.000–25.000 km)",
            "Periksa roller CVT, ganti jika sudah peyang",
            "Bersihkan area CVT dari kotoran dan debu",
            "Periksa kampas ganda (sentrifugal clutch)",
        ],
        "estimasi_biaya": "Rp 150.000 – Rp 400.000",
    },
    "K13": {
        "nama": "Rantai / Gear Aus atau Kendur",
        "komponen": "Transmisi",
        "gejala": ["G28", "G29", "G31", "G37"],
        "min": 2,
        "konteks": "manual",
        "solusi": [
            "Setel ketegangan rantai (main bebas: 20–30 mm)",
            "Lumasi rantai secara rutin setiap 500 km",
            "Ganti set rantai dan sprocket jika sudah aus",
        ],
        "estimasi_biaya": "Rp 150.000 – Rp 600.000",
    },
    "K14": {
        "nama": "Radiator / Sistem Pendingin Bermasalah",
        "komponen": "Pendingin",
        "gejala": ["G06", "G17", "G32", "G33", "G34"],
        "min": 2,
        "konteks": "pendingin_air", # hanya aktif jika motor berpendingin air
        "solusi": [
            "Periksa level coolant, tambahkan jika kurang",
            "Periksa kondisi thermostat dan kipas radiator",
            "Cek kebocoran pada selang dan klem radiator",
            "Ganti water pump jika bocor atau aus",
        ],
        "estimasi_biaya": "Rp 100.000 – Rp 800.000",
    },
    "K15": {
        "nama": "Overheating (Pendingin Udara)",
        "komponen": "Mesin",
        "gejala": ["G06", "G04", "G07", "G05"],
        "min": 2,
        "konteks": "pendingin_udara",  # hanya aktif jika pendingin udara
        "solusi": [
            "Pastikan sirip-sirip pendingin mesin tidak tertutup kotoran",
            "Periksa kualitas dan level oli mesin",
            "Hindari idle terlalu lama di cuaca panas",
            "Periksa timing pengapian",
        ],
        "estimasi_biaya": "Rp 50.000 – Rp 300.000",
    },
    "K16": {
        "nama": "Sensor / ECU Bermasalah",
        "komponen": "Kelistrikan",
        "gejala": ["G42", "G43", "G03", "G19", "G20"],
        "min": 2,
        "konteks": "injeksi",
        "solusi": [
            "Scan kode error MIL menggunakan diagnostic tool Honda/Yamaha/Suzuki",
            "Periksa dan bersihkan konektor sensor (TPS, O2, IAT, MAP)",
            "Reset ECU: lepas aki selama 10 menit",
            "Ganti sensor yang rusak sesuai kode error",
        ],
        "estimasi_biaya": "Rp 100.000 – Rp 1.000.000",
    },
    "K17": {
        "nama": "Bearing Roda Aus",
        "komponen": "Kaki-kaki",
        "gejala": ["G36", "G37", "G35"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Periksa bearing roda depan dan belakang",
            "Ganti bearing yang aus atau berbunyi",
        ],
        "estimasi_biaya": "Rp 50.000 – Rp 250.000",
    },
    "K18": {
        "nama": "Suspensi Rusak / Oli Suspensi Habis",
        "komponen": "Kaki-kaki",
        "gejala": ["G36", "G38", "G34"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Periksa kebocoran oli pada shock absorber",
            "Ganti oli suspensi setiap 20.000 km",
            "Ganti seal shock absorber jika bocor",
        ],
        "estimasi_biaya": "Rp 100.000 – Rp 700.000",
    },
    "K19": {
        "nama": "Kebocoran Bahan Bakar",
        "komponen": "Bahan Bakar",
        "gejala": ["G21", "G18", "G34", "G03"],
        "min": 2,
        "konteks": None,
        "solusi": [
            "Periksa selang bahan bakar dari tangki ke karburator/injektor",
            "Ganti selang yang retak atau bocor",
            "Segera perbaiki — berisiko kebakaran",
        ],
        "estimasi_biaya": "Rp 20.000 – Rp 200.000",
    },
}


# ─────────────────────────────────────────
#  MESIN INFERENSI — FORWARD CHAINING
#  dengan penyesuaian konteks spesifikasi motor
# ─────────────────────────────────────────

def forward_chaining(gejala_input: list, konteks: Optional[dict] = None) -> list:
    """
    Cocokkan gejala input dengan rules, dengan mempertimbangkan
    konteks spesifikasi motor (injeksi/karbu, CVT/manual, dll).
    """
    hasil = []

    for kode, data in KERUSAKAN.items():
        # Filter berdasarkan konteks spesifikasi motor
        if konteks and data["konteks"]:
            flag = data["konteks"]
            # Mapping flag konteks ke kondisi
            aktif = {
                "injeksi":        konteks.get("pakai_injeksi", False),
                "karburator":     not konteks.get("pakai_injeksi", True),
                "cvt":            konteks.get("pakai_cvt", False),
                "manual":         not konteks.get("pakai_cvt", True),
                "pendingin_air":  konteks.get("pakai_pendingin_air", False),
                "pendingin_udara":not konteks.get("pakai_pendingin_air", True),
                "rem_cakram":     konteks.get("pakai_rem_cakram", False),
            }
            if not aktif.get(flag, True):
                continue  # skip rule yang tidak relevan untuk motor ini

        gejala_cocok = [g for g in gejala_input if g in data["gejala"]]
        jumlah_cocok = len(gejala_cocok)

        if jumlah_cocok >= data["min"]:
            confidence = round((jumlah_cocok / len(data["gejala"])) * 100, 1)
            hasil.append({
                "kode_kerusakan":      kode,
                "nama_kerusakan":      data["nama"],
                "komponen":            data["komponen"],
                "gejala_cocok":        [{"kode": g, "deskripsi": GEJALA[g]} for g in gejala_cocok],
                "jumlah_gejala_cocok": jumlah_cocok,
                "confidence":          confidence,
                "solusi":              data["solusi"],
                "estimasi_biaya":      data["estimasi_biaya"],
            })

    hasil.sort(key=lambda x: (x["jumlah_gejala_cocok"], x["confidence"]), reverse=True)
    return hasil


# ─────────────────────────────────────────
#  PYDANTIC MODELS
# ─────────────────────────────────────────

class InputDiagnosis(BaseModel):
    gejala: list[str] = Field(
        ...,
        example=["G01", "G13", "G14"],
        description="List kode gejala. Lihat GET /gejala untuk daftar lengkap."
    )

class InputDiagnosisMotor(BaseModel):
    make:   str       = Field(..., example="honda",  description="Merek motor: honda / yamaha / suzuki")
    model:  str       = Field(..., example="vario",  description="Model motor (partial match didukung)")
    year:   Optional[int] = Field(None, example=2022, description="Tahun motor (opsional)")
    gejala: list[str] = Field(
        ...,
        example=["G19", "G22", "G43"],
        description="List kode gejala. Lihat GET /gejala untuk daftar lengkap."
    )


# ─────────────────────────────────────────
#  ENDPOINTS
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "sistem": "Sistem Pakar Diagnosis Sepeda Motor v2",
        "endpoints": {
            "GET  /gejala":              "Semua gejala dikelompokkan per komponen",
            "GET  /gejala/{komponen}":   "Filter gejala per komponen",
            "GET  /kerusakan":           "Seluruh basis pengetahuan",
            "GET  /motor/cari":          "Cari spesifikasi motor dari API Ninjas",
            "POST /diagnosis":           "Diagnosis tanpa data motor (rules universal)",
            "POST /diagnosis/motor":     "Diagnosis + spesifikasi motor real-time (lebih akurat)",
        }
    }


@app.get("/gejala")
def daftar_gejala():
    kelompok = {
        "Mesin":        ["G01","G02","G03","G04","G05","G06","G07","G08","G09","G10"],
        "Kelistrikan":  ["G11","G12","G13","G14","G15","G16","G17"],
        "Bahan Bakar":  ["G18","G19","G20","G21","G22"],
        "Rem":          ["G23","G24","G25","G26","G27"],
        "Transmisi":    ["G28","G29","G30","G31"],
        "Pendingin":    ["G32","G33","G34"],
        "Kaki-kaki":    ["G35","G36","G37","G38"],
        "CVT (Matic)":  ["G39","G40","G41"],
        "Injeksi / ECU":["G42","G43"],
    }
    return {
        komponen: [{"kode": k, "deskripsi": GEJALA[k]} for k in kodes]
        for komponen, kodes in kelompok.items()
    }


@app.get("/gejala/{komponen}")
def gejala_per_komponen(komponen: str):
    peta = {
        "mesin":        ["G01","G02","G03","G04","G05","G06","G07","G08","G09","G10"],
        "kelistrikan":  ["G11","G12","G13","G14","G15","G16","G17"],
        "bahan_bakar":  ["G18","G19","G20","G21","G22"],
        "rem":          ["G23","G24","G25","G26","G27"],
        "transmisi":    ["G28","G29","G30","G31"],
        "pendingin":    ["G32","G33","G34"],
        "kaki_kaki":    ["G35","G36","G37","G38"],
        "cvt":          ["G39","G40","G41"],
        "injeksi":      ["G42","G43"],
    }
    key = komponen.lower().replace("-","_").replace(" ","_")
    if key not in peta:
        raise HTTPException(status_code=404, detail=f"Komponen tidak ditemukan. Pilihan: {list(peta.keys())}")
    return {
        "komponen": komponen,
        "gejala": [{"kode": k, "deskripsi": GEJALA[k]} for k in peta[key]]
    }


@app.get("/motor/search")
def search_motor_list(
    make:  str           = Query(..., description="Merek: honda / yamaha / suzuki", example="honda"),
    model: str           = Query(..., description="Keyword pencarian model motor", example="beat"),
):
    """Cari semua motor yang cocok dari API Ninjas, return sebagai daftar."""
    if make.lower() not in MEREK_DIDUKUNG:
        raise HTTPException(status_code=400, detail=f"Merek tidak didukung. Pilihan: {MEREK_DIDUKUNG}")
    
    if not API_NINJAS_KEY:
        raise HTTPException(status_code=500, detail="API key belum dikonfigurasi.")

    try:
        r = requests.get(
            API_NINJAS_URL,
            headers={"X-Api-Key": API_NINJAS_KEY},
            params={"make": make, "model": model},
            timeout=8
        )
        r.raise_for_status()
        data = r.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Gagal mengambil data dari API Ninjas: {str(e)}")

    results = []
    for item in data:
        spek = parse_spesifikasi(item)
        results.append({
            "label": f"{spek['merek']} {spek['model']} ({spek['tahun'] or '?'})",
            "spesifikasi": spek,
            "konteks_sistem_pakar": adaptasi_rules(spek),
            "data_mentah_api": item,
        })

    return {
        "query": f"{make} {model}",
        "total": len(results),
        "results": results,
    }


@app.get("/motor/cari")
def cari_motor(
    make:  str           = Query(..., description="Merek: honda / yamaha / suzuki", example="honda"),
    model: str           = Query(..., description="Model motor", example="vario"),
    year:  Optional[int] = Query(None, description="Tahun (opsional)", example=2022),
):
    """Ambil spesifikasi motor dari API Ninjas dan kembalikan dalam format bersih."""
    if make.lower() not in MEREK_DIDUKUNG:
        raise HTTPException(status_code=400, detail=f"Merek tidak didukung. Pilihan: {MEREK_DIDUKUNG}")
    raw  = fetch_spesifikasi(make, model, year)
    spek = parse_spesifikasi(raw)
    return {
        "spesifikasi": spek,
        "konteks_sistem_pakar": adaptasi_rules(spek),
        "data_mentah_api": raw,
    }


@app.post("/diagnosis")
def diagnosis_universal(data: InputDiagnosis):
    """
    Diagnosis tanpa data spesifikasi motor.
    Hanya rules universal yang dijalankan (konteks diabaikan).
    """
    tidak_valid = [g for g in data.gejala if g not in GEJALA]
    if tidak_valid:
        raise HTTPException(status_code=422, detail=f"Kode gejala tidak dikenal: {tidak_valid}")

    hasil = forward_chaining(data.gejala, konteks=None)
    return {
        "mode": "universal (tanpa spesifikasi motor)",
        "gejala_diinput": [{"kode": g, "deskripsi": GEJALA[g]} for g in data.gejala],
        "jumlah_diagnosis": len(hasil),
        "diagnosis": hasil,
        "pesan": (
            f"Ditemukan {len(hasil)} kemungkinan kerusakan."
            if hasil else
            "Tidak ditemukan kerusakan yang cocok. Coba tambahkan lebih banyak gejala."
        ),
    }


@app.post("/diagnosis/motor")
def diagnosis_dengan_motor(data: InputDiagnosisMotor):
    """
    Diagnosis dengan spesifikasi motor real-time dari API Ninjas.
    Rules disesuaikan otomatis berdasarkan tipe pendingin, transmisi, dan sistem bahan bakar.
    """
    if data.make.lower() not in MEREK_DIDUKUNG:
        raise HTTPException(status_code=400, detail=f"Merek tidak didukung. Pilihan: {MEREK_DIDUKUNG}")

    tidak_valid = [g for g in data.gejala if g not in GEJALA]
    if tidak_valid:
        raise HTTPException(status_code=422, detail=f"Kode gejala tidak dikenal: {tidak_valid}")

    # Ambil & proses spesifikasi dari API Ninjas
    raw     = fetch_spesifikasi(data.make, data.model, data.year)
    spek    = parse_spesifikasi(raw)
    konteks = adaptasi_rules(spek)

    # Jalankan forward chaining dengan konteks
    hasil = forward_chaining(data.gejala, konteks=konteks)

    return {
        "mode": "dengan spesifikasi motor (konteks-aware)",
        "motor": {
            "merek":  spek["merek"],
            "model":  spek["model"],
            "tahun":  spek["tahun"],
            "tipe_bahan_bakar": spek["tipe_bahan_bakar"],
            "tipe_transmisi":   spek["tipe_transmisi"],
            "tipe_pendingin":   spek["tipe_pendingin"],
        },
        "konteks_aktif": konteks,
        "gejala_diinput": [{"kode": g, "deskripsi": GEJALA[g]} for g in data.gejala],
        "jumlah_diagnosis": len(hasil),
        "diagnosis": hasil,
        "pesan": (
            f"Ditemukan {len(hasil)} kemungkinan kerusakan untuk {spek['merek']} {spek['model']}."
            if hasil else
            "Tidak ditemukan kerusakan yang cocok. Coba tambahkan lebih banyak gejala."
        ),
    }


@app.get("/kerusakan")
def daftar_kerusakan():
    return {
        kode: {
            "nama":                    data["nama"],
            "komponen":                data["komponen"],
            "jumlah_gejala_terdaftar": len(data["gejala"]),
            "konteks":                 data["konteks"] or "universal",
            "estimasi_biaya":          data["estimasi_biaya"],
        }
        for kode, data in KERUSAKAN.items()
    }