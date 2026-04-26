import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Tractor, Bike, Database, Zap, Code, AlertTriangle, Check, Loader2, ArrowLeft, Terminal, Bot, Gauge, Fuel, Settings, Droplets, Weight, ShieldCheck, Cpu, MapPin, Search, Wind, CloudRain, Thermometer, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_PAKAR = import.meta.env.VITE_API_PAKAR || 'http://localhost:8000';
const API_FUZZY = import.meta.env.VITE_API_FUZZY || 'http://localhost:8003';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'motorcycle' | 'agriculture'
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'} font-sans relative`}>
      
      {/* iOS Edge Ambient Glow (Blue/Silver) */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Subtle inner screen bezel glow */}
        <div className={`absolute inset-0 shadow-[inset_0_0_120px_rgba(99,102,241,0.15)] mix-blend-screen ${darkMode ? 'shadow-[inset_0_0_150px_rgba(139,92,246,0.2)]' : ''}`}></div>
        
        {/* Corner Ambient Gradients */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Pill-shaped Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-100">
        <div className={`backdrop-blur-xl rounded-full px-6 py-3 flex items-center justify-between relative transition-colors border ${darkMode ? 'bg-slate-900/40 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' : 'bg-white/40 border-white/50 shadow-[0_8px_32px_0_rgba(148,163,184,0.3)]'}`}>
          <div 
            className="flex items-center space-x-1.5 cursor-pointer z-10 group" 
            onClick={() => setCurrentPage('landing')}
          >
            <div className="bg-linear-to-r from-indigo-600 to-violet-600 text-white p-1.5 rounded-lg shadow-sm group-hover:from-indigo-700 group-hover:to-violet-700 transition-all">
              <Bot size={18} strokeWidth={2.5} />
            </div>
            <div className="flex items-center ml-0.5">
              <span className="font-bold text-lg tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">Systems</span>
              <span className={`font-bold text-lg tracking-tight ${darkMode ? 'text-white' : 'text-indigo-900'}`}>AI</span>
            </div>
          </div>
          
          {/* Centered Nav Links */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center bg-transparent backdrop-blur-md rounded-full p-1 space-x-1 border border-indigo-200/50 dark:border-violet-800/50">
            <button 
              onClick={() => setCurrentPage('motorcycle')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-linear-to-r ${currentPage === 'motorcycle' ? 'from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20' : 'text-transparent bg-clip-text from-blue-500 to-violet-500 opacity-80 hover:opacity-100 hover:scale-105'}`}
            >
              Sistem Motor
            </button>
            <button 
              onClick={() => setCurrentPage('agriculture')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-linear-to-r ${currentPage === 'agriculture' ? 'from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20' : 'text-transparent bg-clip-text from-blue-500 to-violet-500 opacity-80 hover:opacity-100 hover:scale-105'}`}
            >
              Sistem Pertanian
            </button>
          </div>

          <div className="flex items-center space-x-4 z-10">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-indigo-900 text-yellow-400 hover:bg-indigo-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full relative pt-0">
        {currentPage === 'landing' ? (
          <LandingPage onNavigate={setCurrentPage} darkMode={darkMode} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentPage === 'motorcycle' && <MotorcyclePage onBack={() => setCurrentPage('landing')} darkMode={darkMode} />}
            {currentPage === 'agriculture' && <AgriculturePage onBack={() => setCurrentPage('landing')} darkMode={darkMode} />}
          </div>
        )}
      </main>

      <footer className="w-full max-w-6xl mx-auto px-4 mt-24 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 pb-12">
        <p>© 2026 Systems AI. Built with FastAPI, React, and TailwindCSS.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300">Documentation</a>
          <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// LANDING PAGE
// ============================================================================
function LandingPage({ onNavigate, darkMode }) {
  const gridRef = React.useRef(null);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gridRef.current.style.setProperty('--mouse-x', `${x}px`);
      gridRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full relative min-h-screen flex flex-col items-center justify-start pt-32 pb-20 overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div ref={gridRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-slate-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${darkMode ? 'mix-blend-screen bg-slate-600/20' : ''}`}></div>
        <div className={`absolute top-0 right-1/4 w-96 h-96 bg-slate-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 ${darkMode ? 'mix-blend-screen bg-slate-500/20' : ''}`}></div>
        <div className={`absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-slate-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 ${darkMode ? 'mix-blend-screen bg-slate-400/20' : ''}`}></div>
        
        {/* Base Grid Lines (Static) */}
        <div className="static-grid-bg pointer-events-none"></div>
        
        {/* Blue Glowing Lights on Grid (Moving) */}
        <div className="rgb-grid-lights pointer-events-none"></div>

        {/* Interactive Mouse Cursor Light */}
        <div className="cursor-grid-light pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Hero Content */}
        <div className="text-center max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border mb-6 shadow-sm backdrop-blur-md bg-transparent border-indigo-200/50 dark:border-violet-800/50">
            <span className="flex h-2 w-2 rounded-full bg-linear-to-r from-indigo-500 to-violet-500"></span>
            <span className={`text-xs font-bold tracking-widest uppercase ${darkMode ? 'text-slate-300' : 'text-indigo-600'}`}>Systems AI</span>
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight ${darkMode ? 'text-white' : 'text-indigo-900'}`}>
            Kecerdasan Presisi untuk <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
              Pertanian & Mekanik
            </span>
          </h1>
          
          <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
            Platform cerdas yang mengintegrasikan Logika Fuzzy untuk keputusan lingkungan dan mesin inferensi Forward Chaining untuk analisis kerusakan kendaraan bermotor.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => onNavigate('motorcycle')}
              className={`group relative px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 flex items-center justify-center space-x-3 backdrop-blur-xl border ${darkMode ? 'bg-indigo-600/40 border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-indigo-600/60 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.3)]' : 'bg-linear-to-r from-indigo-600/60 to-violet-600/60 border-white/60 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:from-indigo-600/80 hover:to-violet-600/80 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.4)]'}`}
            >
              <Bike size={20} className="transition-transform group-hover:-rotate-12" />
              <span>Sistem Pakar Motor</span>
            </button>
            <button 
              onClick={() => onNavigate('agriculture')}
              className={`group relative px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 flex items-center justify-center space-x-3 backdrop-blur-xl border ${darkMode ? 'bg-slate-900/40 border-white/10 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-slate-900/60 hover:border-white/30' : 'bg-white/40 border-white/60 text-indigo-900 shadow-[0_8px_32px_0_rgba(148,163,184,0.3)] hover:bg-white/60 hover:border-white/80'}`}
            >
              <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-indigo-600/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Tractor size={20} className="relative z-10 transition-transform group-hover:translate-x-1" />
              <span className="relative z-10">Fuzzy Pertanian</span>
            </button>
          </div>
        </div>

        {/* Bento Box Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          
          {/* Motor Card (Large) */}
          <div 
            onClick={() => onNavigate('motorcycle')}
            className={`md:col-span-7 rounded-[1.4rem] p-8 cursor-pointer flex flex-col relative z-10 transition-all duration-500 hover:-translate-y-2 group backdrop-blur-xl border ${darkMode ? 'bg-slate-900/40 border-white/10 hover:border-indigo-500/50 hover:bg-slate-900/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' : 'bg-white/40 border-white/50 hover:border-white hover:bg-white/50 shadow-[0_8px_32px_0_rgba(148,163,184,0.3)]'}`}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-3.5 rounded-2xl shadow-sm border ${darkMode ? 'bg-indigo-900/50 border-indigo-700/50' : 'bg-indigo-50 border-indigo-200'}`}>
                <Bike className="text-indigo-600 dark:text-violet-400" size={28} strokeWidth={2.5} />
              </div>
              <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Forward Chaining Pakar</h2>
            </div>
            <p className={`text-sm mb-8 leading-relaxed max-w-md font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Mesin inferensi berbasis aturan (IF-THEN) yang mendiagnosis anomali pada sistem pembakaran, CVT, dan kelistrikan dengan nilai *confidence*.
            </p>
            
            <div className={`mt-auto rounded-2xl p-5 h-48 font-mono text-xs border shadow-xl flex flex-col relative overflow-hidden transition-colors ${darkMode ? 'bg-[#0f172a] border-slate-700 group-hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-400/50'}`}>
              {/* Window Controls */}
              <div className={`flex space-x-2 mb-4 border-b pb-3 items-center ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div className="w-3 h-3 rounded-full bg-slate-300/80 shadow-[0_0_10px_rgba(148,163,184,0.4)]"></div>
                <div className="w-3 h-3 rounded-full bg-slate-400/80 shadow-[0_0_10px_rgba(148,163,184,0.4)]"></div>
                <div className="w-3 h-3 rounded-full bg-slate-500/80 shadow-[0_0_10px_rgba(148,163,184,0.4)]"></div>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>expert_engine.py</span>
              </div>
              <div className="space-y-2.5">
                <div className={`flex items-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}><span className="text-indigo-500 mr-2">➜</span> <span className="opacity-70">Mencocokkan 43 gejala...</span></div>
                <div className={`pl-4 border-l-2 ml-1 ${darkMode ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-300'}`}>Rule K12 terpenuhi...</div>
                <div className="text-indigo-500 font-bold pl-4 border-l-2 border-indigo-500/50 ml-1 flex items-center space-x-2">
                  <AlertTriangle size={12} />
                  <span>WARNING: V-Belt CVT Aus/Putus</span>
                </div>
                <div className={`flex items-center mt-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}><span className="text-slate-400 mr-2">✔</span> <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Solusi: Periksa kondisi V-belt.</span></div>
              </div>
              <div className={`absolute bottom-4 right-4 w-2 h-4 animate-pulse ${darkMode ? 'bg-slate-500' : 'bg-indigo-500'}`}></div>
            </div>
          </div>

          {/* Agri Card (Medium) */}
          <div 
            onClick={() => onNavigate('agriculture')}
            className={`md:col-span-5 rounded-[1.4rem] p-8 cursor-pointer flex flex-col relative z-10 transition-all duration-500 hover:-translate-y-2 group backdrop-blur-xl border ${darkMode ? 'bg-slate-900/40 border-white/10 hover:border-slate-500/50 hover:bg-slate-900/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' : 'bg-white/40 border-white/50 hover:border-white hover:bg-white/50 shadow-[0_8px_32px_0_rgba(148,163,184,0.3)]'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3.5 rounded-2xl shadow-sm border ${darkMode ? 'bg-slate-800/50 border-slate-600/50' : 'bg-slate-100 border-slate-300'}`}>
                  <Tractor className="text-slate-600 dark:text-slate-400" size={28} strokeWidth={2.5} />
                </div>
                <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Logika Fuzzy</h2>
              </div>
            </div>
            <p className={`text-sm mb-8 leading-relaxed font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Sistem rekomendasi aktivitas pertanian yang mengolah input suhu, kelembaban, dan peluang hujan.
            </p>
            
            <div className={`mt-auto relative rounded-2xl overflow-hidden h-48 border flex flex-col justify-end transition-colors shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800 group-hover:border-slate-500/50' : 'bg-slate-50 border-slate-200 group-hover:border-slate-400/50'}`}>
              <div className={`absolute inset-0 bg-radial-[at_bottom] opacity-80 group-hover:opacity-100 transition-opacity duration-500 ${darkMode ? 'from-slate-500/20 via-slate-900 to-slate-900' : 'from-slate-400/20 via-slate-50 to-slate-50'}`}></div>
              <div className="absolute bottom-0 w-full h-px bg-linear-to-r from-transparent via-slate-400 to-transparent shadow-[0_0_15px_5px_rgba(148,163,184,0.3)]"></div>
              
              <div className="relative z-10 w-full p-4 flex flex-col space-y-3">
                <div className={`flex justify-between items-center backdrop-blur-md rounded-xl p-3 border ${darkMode ? 'bg-white/10 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Suhu Udara</span>
                  <span className={`text-sm font-black px-2 py-0.5 rounded-md border ${darkMode ? 'text-white bg-indigo-500/20 border-indigo-500/30' : 'text-indigo-700 bg-indigo-100 border-indigo-300'}`}>28°C</span>
                </div>
                <div className={`flex justify-between items-center backdrop-blur-md rounded-xl p-3 border ${darkMode ? 'bg-white/10 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Skor Saran</span>
                  <span className="text-sm font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-violet-400">SANGAT DISARANKAN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Small Feature Cards */}
          {/* Small Feature Cards */}
          <div className={`md:col-span-4 rounded-3xl p-6 border shimmer-card transition-all duration-300 hover:-translate-y-1 group backdrop-blur-xl ${darkMode ? 'bg-slate-900/40 border-white/10 hover:bg-slate-900/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' : 'bg-white/40 border-white/50 hover:bg-white/50 shadow-[0_8px_32px_0_rgba(148,163,184,0.3)]'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md border ${darkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
              <Zap size={24} className="text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
            </div>
            <h3 className={`font-extrabold text-lg mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>API Ninjas Connect</h3>
            <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Pengambilan data spesifikasi motor *real-time* untuk mendeteksi tipe transmisi otomatis secara akurat.
            </p>
          </div>
          
          <div className={`md:col-span-4 rounded-3xl p-6 border shimmer-card transition-all duration-300 hover:-translate-y-1 group backdrop-blur-xl ${darkMode ? 'bg-slate-900/40 border-white/10 hover:bg-slate-900/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' : 'bg-white/40 border-white/50 hover:bg-white/50 shadow-[0_8px_32px_0_rgba(148,163,184,0.3)]'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md border ${darkMode ? 'bg-indigo-900/80 border-indigo-600' : 'bg-indigo-50 border-indigo-200'}`}>
              <Database size={24} className="text-indigo-600 dark:text-violet-400" strokeWidth={2.5} />
            </div>
            <h3 className={`font-extrabold text-lg mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>FastAPI Engine</h3>
            <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Arsitektur Python berkinerja tinggi, *asynchronous*, dan sangat tangguh untuk pemrosesan AI tingkat lanjut.
            </p>
          </div>
          
          <div className={`md:col-span-4 rounded-3xl p-6 border shimmer-card transition-all duration-300 hover:-translate-y-1 group backdrop-blur-xl ${darkMode ? 'bg-slate-900/40 border-white/10 hover:bg-slate-900/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' : 'bg-white/40 border-white/50 hover:bg-white/50 shadow-[0_8px_32px_0_rgba(148,163,184,0.3)]'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md border ${darkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
              <Code size={24} className="text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
            </div>
            <h3 className={`font-extrabold text-lg mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Pydantic Validation</h3>
            <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Menjamin integritas data pada level *endpoint* dengan fitur *type checking* kuat berbasis skema JSON.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MOTORCYCLE EXPERT PAGE
// ============================================================================
function MotorcyclePage({ onBack, darkMode }) {
  const [gejalaList, setGejalaList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [make, setMake] = useState('honda');
  const [model, setModel] = useState('');
  
  // Data Pencarian Motor (live search)
  const [searchResults, setSearchResults] = useState([]);
  const [motorSpec, setMotorSpec] = useState(null);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [specError, setSpecError] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    fetch(`${API_PAKAR}/gejala`)
      .then(res => res.json())
      .then(data => {
        let all = [];
        Object.values(data).forEach(arr => all.push(...arr));
        setGejalaList(all);
      });
  }, []);

  // Debounced live search — panggil API setelah 1 detik berhenti mengetik
  useEffect(() => {
    if (!model || model.length < 2) {
      setSearchResults([]);
      setSpecError('');
      return;
    }

    setLoadingSpec(true);
    setSpecError('');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_PAKAR}/motor/search?make=${make}&model=${model}`);
        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.results || []);
          if (data.total === 0) setSpecError('Tidak ditemukan motor yang cocok.');
        } else {
          setSpecError(data.detail || 'Gagal mencari motor.');
          setSearchResults([]);
        }
      } catch (e) {
        setSpecError('Koneksi ke backend gagal.');
        setSearchResults([]);
      } finally {
        setLoadingSpec(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [model, make]);

  const handleSelectMotor = (item) => {
    setMotorSpec(item);
    setSearchResults([]);
    setResult(null);
  };

  const toggleSelect = (kode) => {
    setSelected(prev => prev.includes(kode) ? prev.filter(k => k !== kode) : [...prev, kode]);
  };

  const handleDiagnose = async () => {
    if(selected.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_PAKAR}/diagnosis/motor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          make: motorSpec.spesifikasi.merek || make, 
          model: motorSpec.spesifikasi.model || model, 
          year: motorSpec.spesifikasi.tahun ? parseInt(motorSpec.spesifikasi.tahun) : null, 
          gejala: selected 
        })
      });
      const data = await res.json();
      if(res.ok && data.diagnosis.length > 0) {
        setResult(data.diagnosis[0]); 
      } else {
        setResult({ 
          nama_kerusakan: "Tidak terdeteksi kerusakan spesifik", 
          solusi: ["Pilih gejala lebih akurat", "Periksa kembali komponen secara manual"], 
          estimasi_biaya: "-",
          confidence: 0
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 ease-out max-w-6xl mx-auto pt-30">
      <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={16} /> <span>Kembali ke Beranda</span>
      </button>

      <div className="mb-10">
        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Motorcycle Expert Engine</h1>
        <p className={`text-lg max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Identifikasi motor Anda, pilih gejala yang diamati, dan biarkan sistem pakar mendiagnosis masalahnya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT: Input Panel */}
        <div className={`rounded-3xl p-8 border shadow-[0_10px_40px_-10px_rgb(0,0,0,0.05)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          {/* Step 1: Identifikasi Motor */}
          <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>1. Identifikasi Kendaraan</h3>
            <div className="flex flex-col space-y-3 mb-4">
               <select 
                 value={make} 
                 onChange={e => { setMake(e.target.value); setMotorSpec(null); setSearchResults([]); }}
                 className={`p-3 border rounded-xl text-sm font-medium ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
               >
                 <option value="honda">Honda</option>
                 <option value="yamaha">Yamaha</option>
                 <option value="suzuki">Suzuki</option>
               </select>
               <div className="relative">
                 <input 
                   type="text" 
                   value={model} 
                   onChange={e => { setModel(e.target.value); setMotorSpec(null); }}
                   placeholder="Ketik model motor, misal: beat, vario, nmax..." 
                   className={`w-full p-3 border rounded-xl text-sm font-medium outline-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                 />
                 {loadingSpec && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                     <Loader2 size={18} className="animate-spin text-indigo-500" />
                   </div>
                 )}
               </div>
            </div>
            
            {specError && <p className="text-red-500 text-sm mt-2">{specError}</p>}

            {/* Motor yang terpilih */}
            {motorSpec && (
              <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-200'}`}>
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-indigo-500" />
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-indigo-900'}`}>{motorSpec.label}</span>
                </div>
                <button 
                  onClick={() => { setMotorSpec(null); setModel(''); setResult(null); }}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >Ganti</button>
              </div>
            )}

            {/* Live Search Results */}
            {searchResults.length > 0 && !motorSpec && (
              <div className={`mt-3 rounded-xl border overflow-hidden ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {searchResults.length} motor ditemukan — pilih salah satu:
                </div>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  {searchResults.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectMotor(item)}
                      className={`px-4 py-3 cursor-pointer transition-all border-b last:border-b-0 flex items-center justify-between ${darkMode ? 'border-slate-700 hover:bg-indigo-900/30 text-slate-200' : 'border-slate-100 hover:bg-indigo-50 text-slate-700'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Bike size={14} className="text-indigo-500 shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-500'}`}>
                        {item.spesifikasi?.tipe || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Pilih Gejala */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>2. Observasi Gejala</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Pilih semua gejala yang terjadi pada kendaraan Anda.</p>
            
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
              {gejalaList.map((g) => {
                const isSelected = selected.includes(g.kode);
                return (
                  <div 
                    key={g.kode} 
                    onClick={() => toggleSelect(g.kode)}
                    className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected 
                        ? (darkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-200')
                        : (darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : (darkMode ? 'border-slate-500 bg-slate-700' : 'border-slate-300 bg-white')
                    }`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span className={`text-sm ${isSelected ? (darkMode ? 'text-white font-bold' : 'text-slate-900 font-bold') : (darkMode ? 'text-slate-300' : 'text-slate-600')}`}>
                      {g.deskripsi}
                    </span>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={handleDiagnose}
              disabled={loading || selected.length === 0 || !motorSpec}
              className="mt-8 w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Jalankan Diagnosis'}
            </button>
          </div>
        </div>

        {/* RIGHT: Results Panel */}
        <div className="space-y-6">
          
          {/* API Spec Result */}
          {motorSpec && (
            <div className={`rounded-3xl p-6 border shadow-[0_10px_40px_-10px_rgb(0,0,0,0.05)] animate-in fade-in slide-in-from-right-4 transition-all duration-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Spesifikasi Kendaraan</h3>
                <button 
                  onClick={() => setShowRaw(!showRaw)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    showRaw 
                      ? 'bg-indigo-500 text-white' 
                      : (darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                  }`}
                >
                  <Terminal size={12} />
                  <span>{showRaw ? 'Visual View' : 'Raw JSON'}</span>
                </button>
              </div>

              {!showRaw ? (
                <div className="grid grid-cols-2 gap-3">
                  <SpecCard icon={<Gauge size={16}/>} label="Engine" value={motorSpec.spesifikasi.kapasitas_mesin} darkMode={darkMode} />
                  <SpecCard icon={<Cpu size={16}/>} label="Type" value={motorSpec.spesifikasi.tipe} darkMode={darkMode} />
                  <SpecCard icon={<Droplets size={16}/>} label="Cooling" value={motorSpec.spesifikasi.tipe_pendingin} darkMode={darkMode} />
                  <SpecCard icon={<Settings size={16}/>} label="Trans" value={motorSpec.spesifikasi.tipe_transmisi} darkMode={darkMode} />
                  <SpecCard icon={<Fuel size={16}/>} label="Fuel" value={motorSpec.spesifikasi.tipe_bahan_bakar} darkMode={darkMode} />
                  <SpecCard icon={<ShieldCheck size={16}/>} label="Starter" value={motorSpec.spesifikasi.starter} darkMode={darkMode} />
                  <SpecCard icon={<Weight size={16}/>} label="Weight" value={motorSpec.spesifikasi.berat} darkMode={darkMode} />
                  <SpecCard icon={<Settings size={16}/>} label="Year" value={motorSpec.spesifikasi.tahun} darkMode={darkMode} />
                </div>
              ) : (
                <div className={`rounded-xl border p-4 font-mono text-xs overflow-x-auto ${darkMode ? 'bg-[#1e1e1e] border-slate-700' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center space-x-2 text-slate-400 mb-3 border-b border-slate-700 pb-2">
                    <Terminal size={12} />
                    <span>api-ninjas/motorcycles/response.json</span>
                  </div>
                  <pre className="text-green-400">
                    <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(JSON.stringify(motorSpec.spesifikasi, null, 2)) }} />
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis Result */}
          {result && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <div className={`relative border rounded-3xl p-6 overflow-hidden shadow-[0_10px_40px_-10px_rgb(0,0,0,0.05)] ${darkMode ? 'bg-red-950/20 border-red-900/50' : 'bg-[#fffbfa] border-red-100'}`}>
                <div className="absolute top-0 left-0 h-full w-1.5 bg-red-600"></div>
                
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="text-red-600 shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-red-400' : 'text-slate-900'}`}>
                        Hasil Diagnosis: {result.nama_kerusakan}
                      </h3>
                      {result.confidence !== undefined && (
                         <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Conf: {result.confidence}%</span>
                      )}
                    </div>
                    
                    <div className={`text-sm space-y-4 mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <p>Kombinasi gejala yang dipilih mengarah kuat pada masalah ini.</p>
                      
                      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <p className="font-bold text-xs uppercase tracking-widest mb-2">Solusi Perbaikan:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.solusi.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-bold text-indigo-600">
                        Estimasi Biaya: {result.estimasi_biaya}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!motorSpec && !result && (
            <div className={`rounded-3xl p-12 border border-dashed flex flex-col items-center justify-center text-center min-h-[400px] ${darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              <Bot size={48} strokeWidth={1.5} className="mb-4 opacity-50" />
              <p className="font-bold text-lg mb-2">Belum Ada Hasil</p>
              <p className="text-sm max-w-xs">Identifikasi motor Anda dan pilih gejala di panel kiri untuk memulai diagnosis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for Specification Card
function SpecCard({ icon, label, value, darkMode }) {
  if (!value || value === "null" || value === "N/A") return null;
  
  return (
    <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all hover:scale-[1.02] ${
      darkMode 
        ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' 
        : 'bg-slate-50 border-slate-200/60 hover:bg-white hover:shadow-md'
    }`}>
      <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        <span className={`text-xs font-bold truncate max-w-[120px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

// Component untuk Map Input
function MapInput({ lat, lon, setCoords, darkMode, temp, humidity, rain }) {
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Helper to sync map center
  function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
  }

  // Handle Map Click
  function MapEvents() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCoords(parseFloat(data[0].lat), parseFloat(data[0].lon));
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari lokasi (contoh: Purwokerto, Jakarta...)"
          className={`w-full p-3 pl-10 border rounded-xl text-sm font-medium outline-indigo-500 transition-all ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        />
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
        </button>
      </form>

      <div className={`h-64 rounded-2xl border overflow-hidden relative z-10 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <MapContainer center={[lat, lon]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={darkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          />
          <Marker position={[lat, lon]} />
          <ChangeView center={[lat, lon]} />
          <MapEvents />
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-700">
          📍 {lat.toFixed(4)}, {lon.toFixed(4)}
        </div>

        {/* Real-time Weather Stats Overlay */}
        <div className="absolute top-2 right-2 z-20 flex flex-col space-y-1">
          <div className={`p-2 rounded-xl backdrop-blur-md border shadow-sm flex items-center space-x-3 ${darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/60 border-slate-200'}`}>
            <div className="flex flex-col items-center">
              <Thermometer size={14} className="text-orange-500 mb-0.5" />
              <span className={`text-[10px] font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{temp}°</span>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 opacity-50"></div>
            <div className="flex flex-col items-center">
              <Droplets size={14} className="text-blue-500 mb-0.5" />
              <span className={`text-[10px] font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{humidity}%</span>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 opacity-50"></div>
            <div className="flex flex-col items-center">
              <CloudRain size={14} className="text-indigo-500 mb-0.5" />
              <span className={`text-[10px] font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{rain}%</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 italic flex items-center space-x-1">
        <MapIcon size={10} /> <span>Klik pada peta untuk memindahkan penanda.</span>
      </p>
    </div>
  );
}

// Helper untuk mewarnai sintaks JSON
function syntaxHighlight(json) {
  if (!json) return '';
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'text-indigo-400'; // number
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'text-pink-400'; // key
          } else {
              cls = 'text-amber-300'; // string
          }
      } else if (/true|false/.test(match)) {
          cls = 'text-purple-400'; // boolean
      } else if (/null/.test(match)) {
          cls = 'text-slate-500'; // null
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
}


// ============================================================================
// AGRICULTURE FUZZY PAGE
// ============================================================================
function AgriculturePage({ onBack, darkMode }) {
  const [humidity, setHumidity] = useState(42);
  const [temp, setTemp] = useState(28);
  const [rain, setRain] = useState(20);
  
  const [lat, setLat] = useState(-7.4212);
  const [lon, setLon] = useState(109.2326);
  const [isLocationMode, setIsLocationMode] = useState(true);
  
  // Use a counter-based guard: increment on every location fetch,
  // decrement in the manual-mode effect. This handles batched state updates properly.
  const skipManualFetchCount = React.useRef(0);
  // AbortController to cancel previous in-flight location fetch
  const locationAbortRef = React.useRef(null);
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initial fetch on mount only
  useEffect(() => {
    fetchFuzzyLocation(lat, lon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced fetch — manual mode only
  useEffect(() => {
    // Don't run in location mode
    if (isLocationMode) return;
    
    // If we have pending skips from a location-sync, consume one and bail
    if (skipManualFetchCount.current > 0) {
      skipManualFetchCount.current = 0; // reset all pending skips at once
      return;
    }
    
    const timer = setTimeout(() => {
      fetchFuzzyManual();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [humidity, temp, rain, isLocationMode]);

  // NOTE: Removed the old useEffect([isLocationMode]) that caused duplicate fetches
  // with stale lat/lon values. Now location fetches are triggered explicitly.

  const fetchFuzzyManual = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_FUZZY}/rekomendasi/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suhu: temp, kelembaban: humidity, hujan: rain })
      });
      const data = await res.json();
      if(res.ok) setResult(data.hasil);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFuzzyLocation = async (fetchLat, fetchLon) => {
    // Cancel any previous in-flight location fetch
    if (locationAbortRef.current) {
      locationAbortRef.current.abort();
    }
    const controller = new AbortController();
    locationAbortRef.current = controller;
    
    setLoading(true);
    try {
      const res = await fetch(
        `${API_FUZZY}/rekomendasi/lokasi?lat=${fetchLat}&lon=${fetchLon}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if(res.ok) {
        setResult(data.hasil);
        
        // Extract weather data with null-safety (Open-Meteo can return null)
        const newTemp = data.cuaca_realtime?.suhu ?? 0;
        const newHumidity = data.cuaca_realtime?.kelembaban ?? 0;
        const newRain = data.cuaca_realtime?.hujan ?? 0;
        
        // Guard: tell the manual-mode effect to skip the next trigger
        // because we're about to batch-update temp/humidity/rain from location data
        skipManualFetchCount.current += 1;
        
        setTemp(Math.round(newTemp * 10) / 10);
        setHumidity(Math.round(newHumidity * 10) / 10);
        setRain(Math.round(newRain * 10) / 10);
      }
    } catch (e) {
      // Ignore abort errors — they're intentional
      if (e.name === 'AbortError') return;
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const setCoords = (newLat, newLon) => {
    setLat(newLat);
    setLon(newLon);
    setIsLocationMode(true);
    // Fetch with the EXACT new coordinates (not stale state)
    fetchFuzzyLocation(newLat, newLon);
  };

  const score = result ? result.skor : 0;

  return (
    <div className="animate-in fade-in slide-in-from-left-8 duration-500 ease-out max-w-6xl mx-auto pt-30">
      <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={16} /> <span>Kembali ke Beranda</span>
      </button>

      <div className="mb-10">
        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Agriculture Fuzzy Logic</h1>
        <p className={`text-lg max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Sistem inferensi Mamdani untuk menghitung kebutuhan operasional pertanian berdasarkan data lingkungan secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT: Input Sliders & Map */}
        <div className={`rounded-3xl p-8 border shadow-[0_10px_40px_-10px_rgb(0,0,0,0.05)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Kondisi Lahan</h3>
            <button 
              onClick={() => setIsLocationMode(!isLocationMode)}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                isLocationMode 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')
              }`}
            >
              {isLocationMode ? '📍 Mode Lokasi Aktif' : '🖱️ Mode Manual'}
            </button>
          </div>

          <div className="space-y-8">
            <MapInput 
              lat={lat} 
              lon={lon} 
              setCoords={setCoords} 
              darkMode={darkMode} 
              temp={temp} 
              humidity={humidity} 
              rain={rain} 
            />

            <div className={`p-6 rounded-2xl space-y-8 ${darkMode ? 'bg-slate-800/40' : 'bg-slate-50/50'}`}>
              <CustomSlider 
                label="Suhu Udara" 
                value={temp} 
                setValue={(v) => { setTemp(v); setIsLocationMode(false); }} 
                unit="°C" 
                max={45}
                leftLabel="Dingin" 
                midLabel="Sejuk" 
                rightLabel="Panas" 
                darkMode={darkMode}
              />
              <CustomSlider 
                label="Kelembaban Udara" 
                value={humidity} 
                setValue={(v) => { setHumidity(v); setIsLocationMode(false); }} 
                unit="%" 
                leftLabel="Kering" 
                midLabel="Normal" 
                rightLabel="Lembab"
                darkMode={darkMode}
              />
              <CustomSlider 
                label="Peluang Hujan" 
                value={rain} 
                setValue={(v) => { setRain(v); setIsLocationMode(false); }} 
                unit="%" 
                leftLabel="Rendah" 
                midLabel="Sedang" 
                rightLabel="Tinggi" 
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Inference Output */}
        <div className="space-y-6">
          <div className={`rounded-3xl p-8 border shadow-[0_10px_40px_-10px_rgb(0,0,0,0.05)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <p className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Analisis Logika Fuzzy</p>
            <div className={`relative h-60 border rounded-2xl overflow-hidden p-4 ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-[#fcfdfe] border-slate-200'}`}>
              
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* The SVG Chart */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full p-4 pb-10">
                {/* 3 Segitiga Aturan */}
                <path d="M 0 100 L 15 40 L 35 100 Z" fill={darkMode ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.02)'} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="1" />
                <path d="M 25 100 L 50 40 L 75 100 Z" fill={darkMode ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.02)'} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="1" />
                <path d="M 65 100 L 85 40 L 100 100 Z" fill={darkMode ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.02)'} stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="1" />
                
                {/* Active Highlight Layer */}
                <path d={`M ${score-15} 100 L ${score} 60 L ${score+15} 100 Z`} fill={darkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'} stroke="#6366f1" strokeWidth="2" className="transition-all duration-700" />
                
                {/* Output Line */}
                {result && (
                  <line 
                    x1={`${score}%`} y1="0" 
                    x2={`${score}%`} y2="100" 
                    stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" 
                    className="transition-all duration-700"
                  />
                )}
                {/* Data Point Dot */}
                {result && (
                  <circle cx={`${score}%`} cy="60" r="4" fill="#6366f1" className="transition-all duration-700 shadow-xl" />
                )}
              </svg>
              
              <div className="absolute bottom-3 left-4 text-[9px] font-black text-slate-400 tracking-tighter uppercase">0 — Rendah</div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 tracking-tighter uppercase">50 — Sedang</div>
              <div className="absolute bottom-3 right-4 text-[9px] font-black text-slate-400 tracking-tighter uppercase">100 — Tinggi</div>

              {result && (
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm transition-all ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                  <span className={`text-[11px] font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Output: <span className="text-indigo-500 font-black">{score}%</span>
                  </span>
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                   <div className="flex flex-col items-center space-y-2">
                     <Loader2 className="animate-spin text-indigo-500" size={32} />
                     <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Processing</span>
                   </div>
                </div>
              )}
            </div>

            {result && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                  <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-[0.2em] uppercase mb-3 border shadow-sm ${
                    score >= 65 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : score >= 35 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}>
                    {result.label}
                  </div>
                  <h4 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Rekomendasi Operasional
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {result.aktivitas_disarankan.map((akt, i) => (
                    <div 
                      key={i} 
                      className={`group p-4 rounded-2xl border transition-all hover:translate-x-1 ${
                        darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl transition-colors ${
                          score >= 65 ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {i === 0 ? <Zap size={18} /> : i === 1 ? <Settings size={18} /> : <Check size={18} />}
                        </div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{akt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {result.saran_irigasi && (
                   <div className={`mt-6 p-4 rounded-2xl border-2 border-dashed ${darkMode ? 'border-indigo-900/50 bg-indigo-950/20' : 'border-indigo-100 bg-indigo-50/30'}`}>
                     <div className="flex items-start space-x-3">
                       <Bot size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                       <p className={`text-sm leading-relaxed ${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                         <span className="font-black uppercase text-[10px] block mb-1 opacity-50">Saran AI:</span>
                         {result.saran_irigasi}
                       </p>
                     </div>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Slider Component
function CustomSlider({ label, value, setValue, unit, leftLabel, midLabel, rightLabel, max=100, darkMode }) {
  const percent = (value / max) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <label className={`text-sm font-bold flex items-center space-x-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          <span>{label}</span>
        </label>
        <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">{value}{unit}</span>
      </div>
      
      <div className={`relative h-2 rounded-full w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
        <div 
          className="absolute h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-l-full" 
          style={{ width: `${percent}%` }}
        ></div>
        
        <input 
          type="range" 
          min="0" 
          max={max}
          step="0.1"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-white dark:border-slate-900 z-10 pointer-events-none transition-transform"
          style={{ left: `calc(${percent}% - 10px)` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{leftLabel}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{midLabel}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{rightLabel}</span>
      </div>
    </div>
  );
}
