"""
Sistem Fuzzy - Rekomendasi Aktivitas Pertanian
Menggunakan data cuaca real-time dari Open-Meteo API
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import requests
from functools import lru_cache
from typing import Optional

app = FastAPI(
    title="Sistem Fuzzy Rekomendasi Pertanian",
    description="Rekomendasi aktivitas pertanian berbasis logika fuzzy & cuaca real-time (Open-Meteo)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
#  BUILD FUZZY SYSTEM (dijalankan sekali)
# ─────────────────────────────────────────

@lru_cache(maxsize=1)
def get_fuzzy_control_system():
    # Antecedent (input)
    suhu        = ctrl.Antecedent(np.arange(0, 46, 1),  'suhu')
    kelembaban  = ctrl.Antecedent(np.arange(0, 101, 1), 'kelembaban')
    hujan       = ctrl.Antecedent(np.arange(0, 101, 1), 'hujan')

    # Consequent (output)
    rekomendasi = ctrl.Consequent(np.arange(0, 101, 1), 'rekomendasi')

    # MF — Suhu (°C)
    suhu['dingin'] = fuzz.trimf(suhu.universe, [0,  0,  20])
    suhu['sejuk']  = fuzz.trimf(suhu.universe, [15, 22, 30])
    suhu['panas']  = fuzz.trimf(suhu.universe, [25, 45, 45])

    # MF — Kelembaban (%)
    kelembaban['kering'] = fuzz.trimf(kelembaban.universe, [0,  0,  40])
    kelembaban['normal'] = fuzz.trimf(kelembaban.universe, [30, 55, 75])
    kelembaban['lembab'] = fuzz.trimf(kelembaban.universe, [65, 100, 100])

    # MF — Probabilitas hujan (%)
    hujan['rendah'] = fuzz.trimf(hujan.universe, [0,  0,  35])
    hujan['sedang'] = fuzz.trimf(hujan.universe, [25, 50, 75])
    hujan['tinggi'] = fuzz.trimf(hujan.universe, [65, 100, 100])

    # MF — Output (0–100)
    rekomendasi['tidak_disarankan']  = fuzz.trimf(rekomendasi.universe, [0,   0,  35])
    rekomendasi['pertimbangkan']     = fuzz.trimf(rekomendasi.universe, [25,  50, 75])
    rekomendasi['sangat_disarankan'] = fuzz.trimf(rekomendasi.universe, [65, 100, 100])

    rules = [
        # ═══ SEJUK ═══
        ctrl.Rule(suhu['sejuk']  & kelembaban['kering'] & hujan['rendah'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['kering'] & hujan['sedang'],  rekomendasi['sangat_disarankan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['kering'] & hujan['tinggi'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['normal'] & hujan['rendah'],  rekomendasi['sangat_disarankan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['normal'] & hujan['sedang'],  rekomendasi['sangat_disarankan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['normal'] & hujan['tinggi'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['lembab'] & hujan['rendah'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['lembab'] & hujan['sedang'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['sejuk']  & kelembaban['lembab'] & hujan['tinggi'],  rekomendasi['tidak_disarankan']),

        # ═══ PANAS ═══
        ctrl.Rule(suhu['panas']  & kelembaban['kering'] & hujan['rendah'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['panas']  & kelembaban['kering'] & hujan['sedang'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['panas']  & kelembaban['kering'] & hujan['tinggi'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['panas']  & kelembaban['normal'] & hujan['rendah'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['panas']  & kelembaban['normal'] & hujan['sedang'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['panas']  & kelembaban['normal'] & hujan['tinggi'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['panas']  & kelembaban['lembab'] & hujan['rendah'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['panas']  & kelembaban['lembab'] & hujan['sedang'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['panas']  & kelembaban['lembab'] & hujan['tinggi'],  rekomendasi['tidak_disarankan']),

        # ═══ DINGIN ═══
        ctrl.Rule(suhu['dingin'] & kelembaban['kering'] & hujan['rendah'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['kering'] & hujan['sedang'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['kering'] & hujan['tinggi'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['normal'] & hujan['rendah'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['normal'] & hujan['sedang'],  rekomendasi['pertimbangkan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['normal'] & hujan['tinggi'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['lembab'] & hujan['rendah'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['lembab'] & hujan['sedang'],  rekomendasi['tidak_disarankan']),
        ctrl.Rule(suhu['dingin'] & kelembaban['lembab'] & hujan['tinggi'],  rekomendasi['tidak_disarankan']),
    ]

    return ctrl.ControlSystem(rules)


# ─────────────────────────────────────────
#  LOGIKA INFERENSI
# ─────────────────────────────────────────

def hitung_fuzzy(suhu_val: float, kelembaban_val: float, hujan_val: float) -> dict:
    # Create a FRESH simulation for each call — ControlSystemSimulation holds
    # mutable state, so reusing a cached instance causes stale/corrupt results
    sistem = get_fuzzy_control_system()
    sim = ctrl.ControlSystemSimulation(sistem)
    sim.input['suhu']       = np.clip(suhu_val, 0, 45)
    sim.input['kelembaban'] = np.clip(kelembaban_val, 0, 100)
    sim.input['hujan']      = np.clip(hujan_val, 0, 100)
    
    try:
        sim.compute()
        nilai = round(float(sim.output['rekomendasi']), 2)
    except Exception:
        # Fallback: if fuzzy inference fails, default to middle value
        nilai = 50.0

    if nilai >= 65:
        label = "SANGAT DISARANKAN"
        aktivitas = [
            "Penyemprotan pestisida / pupuk daun",
            "Pengolahan lahan (membajak, mencangkul)",
            "Penanaman bibit",
            "Pemanenan (jika sudah waktunya)",
        ]
    elif nilai >= 35:
        label = "PERTIMBANGKAN"
        aktivitas = [
            "Irigasi tambahan jika tanah kering",
            "Monitoring dan inspeksi kondisi tanaman",
            "Persiapan perlindungan dari cuaca ekstrem",
        ]
    else:
        label = "TIDAK DISARANKAN"
        aktivitas = [
            "Tunda aktivitas lapangan",
            "Lakukan perencanaan dan administrasi",
            "Perbaikan alat pertanian di dalam gudang",
        ]

    saran_irigasi = None
    if kelembaban_val < 40 and hujan_val < 30:
        saran_irigasi = "Tanah kering — aktifkan sistem irigasi"
    elif hujan_val > 70:
        saran_irigasi = "Hujan lebat diprediksi — tunda penyiraman manual"

    return {
        "skor": nilai,
        "label": label,
        "aktivitas_disarankan": aktivitas,
        "saran_irigasi": saran_irigasi,
    }


# ─────────────────────────────────────────
#  AMBIL DATA CUACA — Open-Meteo
# ─────────────────────────────────────────

def fetch_cuaca(lat: float, lon: float) -> dict:
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,precipitation_probability"
        "&timezone=Asia%2FJakarta"
    )
    try:
        r = requests.get(url, timeout=8)
        r.raise_for_status()
        current = r.json()["current"]
        return {
            "suhu":       current.get("temperature_2m") or 0,
            "kelembaban": current.get("relative_humidity_2m") or 0,
            "hujan":      current.get("precipitation_probability") or 0,
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Gagal mengambil data cuaca: {str(e)}")


# ─────────────────────────────────────────
#  PYDANTIC MODELS
# ─────────────────────────────────────────

class InputManual(BaseModel):
    suhu: float       = Field(..., ge=0, le=45,  example=27.5, description="Suhu udara dalam °C (0–45)")
    kelembaban: float = Field(..., ge=0, le=100, example=70.0, description="Kelembaban udara dalam % (0–100)")
    hujan: float      = Field(..., ge=0, le=100, example=20.0, description="Probabilitas hujan dalam % (0–100)")


# ─────────────────────────────────────────
#  ENDPOINTS
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "sistem": "Fuzzy Rekomendasi Pertanian",
        "versi": "1.0.0",
        "endpoints": {
            "POST /rekomendasi/manual":  "Input cuaca manual",
            "GET  /rekomendasi/lokasi":  "Input koordinat, cuaca diambil otomatis dari Open-Meteo",
        }
    }


@app.post("/rekomendasi/manual")
def rekomendasi_manual(data: InputManual):
    """
    Hitung rekomendasi berdasarkan input cuaca manual.
    """
    hasil_fuzzy = hitung_fuzzy(data.suhu, data.kelembaban, data.hujan)
    return {
        "input": {
            "suhu":       data.suhu,
            "kelembaban": data.kelembaban,
            "hujan":      data.hujan,
        },
        "hasil": hasil_fuzzy,
    }


@app.get("/rekomendasi/lokasi")
def rekomendasi_lokasi(
    lat: float = Query(..., description="Latitude lokasi", example=-7.4212),
    lon: float = Query(..., description="Longitude lokasi", example=109.2326),
):
    """
    Ambil cuaca real-time dari koordinat via Open-Meteo,
    lalu hitung rekomendasi fuzzy secara otomatis.
    """
    import traceback
    try:
        cuaca = fetch_cuaca(lat, lon)
        hasil_fuzzy = hitung_fuzzy(cuaca["suhu"], cuaca["kelembaban"], cuaca["hujan"])
        return {
            "koordinat": {"lat": lat, "lon": lon},
            "cuaca_realtime": cuaca,
            "hasil": hasil_fuzzy,
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")