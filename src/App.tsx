import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserRound, 
  Binary, 
  Award, 
  BarChart3, 
  Settings2, 
  Menu, 
  X, 
  ChevronRight,
  Search,
  Sun,
  Moon,
  User,
  Trophy,
  School,
  Calendar,
  Edit2,
  Trash2,
  RotateCcw,
  Save,
  Check,
  FileDown,
  FileSpreadsheet,
  Plus,
  Printer,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';
import Login from './components/Login';

// --- Types ---
type View = 'Dashboard' | 'Data Peserta' | 'Nomor Tampilan' | 'Penilaian' | 'Rekap Nilai' | 'Rekap Per-Cabang Lomba' | 'Pengumuman' | 'Pengaturan' | 'Daftar Hadir' | 'Sertifikat';

interface Peserta {
  id: string;
  name: string;
  school: string;
  birthInfo: string;
  category: string;
  status: 'Terverifikasi' | 'Pending';
  displayNumber?: string;
  scores?: [number | string, number | string, number | string];
}

interface AppSettings {
  judgeName: string;
  judgeNip: string;
  place: string;
  date: string;
  kkksChairmanName: string;
  kkksChairmanNip: string;
  coordinatorName: string;
  coordinatorNip: string;
  headOfDepartmentName: string;
  headOfDepartmentNip: string;
  categoryJudges: Record<string, { name: string, nip: string }>;
  logoKabupaten?: string;
  logoFLS3N?: string;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  darkMode?: boolean;
}

// --- Constants ---
const SCHOOL_LIST = [
  "SDN BAUJENG I",
  "SDN BAUJENG II",
  "SDN BEJI I",
  "SDN BEJI II",
  "SDN BEJI IV",
  "SDN CANGKRINGMALANG I",
  "SDN CANGKRINGMALANG II",
  "SDN CANGKRINGMALANG III",
  "SDN GAJAHBENDO",
  "SDN GLANGGANG I",
  "SDN GLANGGANG II",
  "SDN GUNUNGGANGSIR I",
  "SDN GUNUNGGANGSIR II",
  "SDN GUNUNGGANGSIR III",
  "SDN GUNUNG SARI I",
  "SDN GUNUNG SARI II",
  "SDN KEDUNGBOTO",
  "SDN KEDUNGRINGIN I",
  "SDN KEDUNGRINGIN II",
  "SDN KEDUNGRINGIN III",
  "SDN KEDUNGRINGIN IV",
  "SDN KENEP",
  "SDN NGEMBE 1",
  "SDN PAGAK",
  "SDN SIDOWAYAH",
  "SDN SUMBERSARI I",
  "SDN SUMBERSARI II",
  "SD ISLAM YASPAI",
  "SD ISLAM HASAN MUNADI",
  "SD AR-ROUDHOH",
  "SD ISLAM AZ ZAHRA",
  "SD ISLAM DARUSSALAM"
];

const CABANG_LOMBA = [
  "Gambar Bercerita",
  "Kriya Anyam",
  "Menyanyi Solo",
  "Pantomim",
  "Seni Tari",
  "Mendongeng",
  "Menulis Cerita"
];

// --- Components ---

const NavItem = ({ icon: Icon, label, active, onClick, darkMode }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-xl mb-1 ${
      active 
        ? (darkMode ? 'bg-indigo-500/20 text-indigo-400 shadow-lg' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200') 
        : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')
    }`}
  >
    <div className={`p-1.5 rounded-lg transition-colors ${active ? (darkMode ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-600 shadow-sm') : 'text-inherit'}`}>
      <Icon size={18} />
    </div>
    <span className={`font-bold text-sm ${active ? 'opacity-100' : 'opacity-90'}`}>{label}</span>
    {active && (
      <motion.div 
        layoutId="active-indicator"
        className="ml-auto"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'}`} />
      </motion.div>
    )}
  </button>
);

const SubNavItem = ({ label, active, onClick, darkMode }: { label: string, active: boolean, onClick: () => void, darkMode?: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 transition-all duration-200 text-xs font-bold ${
      active 
        ? (darkMode ? 'text-indigo-400 bg-indigo-500/10 border-l-4 border-indigo-500' : 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600') 
        : (darkMode ? 'text-slate-500 hover:text-slate-300 border-l-4 border-transparent' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 border-l-4 border-transparent')
    }`}
  >
    <div className={`w-1.5 h-1.5 rounded-full ${active ? (darkMode ? 'bg-indigo-400' : 'bg-indigo-600') : (darkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
    <span className="uppercase tracking-wider">{label}</span>
  </button>
);

const StatCard = ({ title, value, icon: Icon, color, darkMode, onClick }: { title: string, value: string | number, icon: React.ElementType, color: "emerald" | "amber" | "blue" | "rose", darkMode?: boolean, onClick?: () => void }) => {
  const colors = {
    emerald: darkMode ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-600",
    amber: darkMode ? "border-amber-500/20 bg-amber-500/5 text-amber-400" : "border-amber-500/20 bg-amber-500/5 text-amber-600",
    blue: darkMode ? "border-blue-500/20 bg-blue-500/5 text-blue-400" : "border-blue-500/20 bg-blue-500/5 text-blue-600",
    rose: darkMode ? "border-rose-500/20 bg-rose-500/5 text-rose-400" : "border-rose-500/20 bg-rose-500/5 text-rose-600"
  };

  const iconColors = {
    emerald: darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600",
    amber: darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600",
    blue: darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
    rose: darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600"
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-[2rem] border ${colors[color]} shadow-sm transition-all cursor-pointer group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconColors[color]} shadow-sm group-hover:shadow-md transition-all`}>
          <Icon size={24} />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={16} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{title}</p>
        <h3 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      </div>
    </motion.div>
  );
};

// --- Views ---

const DashboardView = ({ 
  pesertaList, 
  cabangLomba, 
  schoolList,
  settings,
  darkMode,
  onNavigate
}: { 
  pesertaList: Peserta[], 
  cabangLomba: string[], 
  schoolList: string[],
  settings: AppSettings,
  darkMode?: boolean,
  onNavigate: (view: View) => void
}) => {
  const totalPeserta = pesertaList.length;
  const totalCabang = cabangLomba.length;
  const totalSekolah = schoolList.length;

  // Data for Category Distribution
  const categoryData = cabangLomba.map(cat => ({
    name: cat,
    peserta: pesertaList.filter(p => p.category === cat).length
  })).sort((a, b) => b.peserta - a.peserta);

  // Data for Scoring Progress
  const judgedCount = pesertaList.filter(p => p.scores && p.scores.some(s => s !== '' && s !== 0)).length;
  const progressPercentage = totalPeserta > 0 ? Math.round((judgedCount / totalPeserta) * 100) : 0;
  
  const pieData = [
    { name: 'Dinilai', value: judgedCount },
    { name: 'Belum', value: totalPeserta - judgedCount }
  ];
  const PIE_COLORS = ['#0d9488', '#f1f5f9'];
  const CATEGORY_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
  ];

  // Data for Top Schools (by participation)
  const schoolParticipation = schoolList.map(school => ({
    name: school,
    count: pesertaList.filter(p => p.school === school).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);

  // Data for Top 6 per Category
  const topRankings = cabangLomba.map(cat => {
    const sorted = uniquePesertaList
      .filter(p => p.category === cat)
      .map(p => {
        const allParticipantsFromSchool = pesertaList.filter(
          ap => ap.school === p.school && ap.category === cat
        );
        const combinedNames = allParticipantsFromSchool.map(ap => ap.name).join(', ');
        
        return { 
          ...p,
          name: combinedNames,
          total: (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0) 
        };
      })
      .filter(p => p.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
    
    return { category: cat, top: sorted };
  });

  const slides = [
    {
      title: <>Selamat datang di <span className="text-indigo-600">FLS3N-SD</span> Tahun 2026</>,
      subtitle: "Kecamatan Beji"
    },
    {
      title: <>Festival Lomba Seni dan Sastra Siswa Nasional</>,
      subtitle: "Ajang Kreativitas dan Bakat Siswa Sekolah Dasar"
    },
    {
      title: <>Berprestasi dan Berkarya</>,
      subtitle: "Mewujudkan Generasi Emas Indonesia"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="space-y-8 pb-10">
      {/* Slideshow Welcome Banner */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-8 border shadow-sm min-h-[240px] flex items-center ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="relative z-10 max-w-2xl w-full">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border shadow-sm ${
            darkMode ? 'bg-indigo-600 text-white border-indigo-500/50' : 'bg-indigo-900 text-white border-indigo-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Dashboard Overview
          </div>
          
          <div className="relative h-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <h2 className={`text-3xl font-black mb-3 tracking-tighter leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {slides[currentSlide].title}
                </h2>
                <p className={`leading-relaxed text-base font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {slides[currentSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-8 bg-indigo-600' 
                    : `w-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`
                }`}
              />
            ))}
          </div>
        </div>
        {/* Subtle background elements */}
        <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] -mr-20 -mt-20 rounded-full transition-colors duration-1000 ${
          darkMode 
            ? currentSlide === 0 ? 'bg-indigo-500/10' : currentSlide === 1 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
            : currentSlide === 0 ? 'bg-indigo-500/5' : currentSlide === 1 ? 'bg-emerald-500/5' : 'bg-rose-500/5'
        }`} />
        <div className={`absolute bottom-0 left-0 w-64 h-64 blur-[80px] -ml-20 -mb-20 rounded-full transition-colors duration-1000 ${
          darkMode 
            ? currentSlide === 0 ? 'bg-violet-500/10' : currentSlide === 1 ? 'bg-teal-500/10' : 'bg-amber-500/10'
            : currentSlide === 0 ? 'bg-violet-500/5' : currentSlide === 1 ? 'bg-teal-500/5' : 'bg-amber-500/5'
        }`} />
      </div>

      {/* Stats Grid with distinct colors and navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Peserta" value={totalPeserta} icon={UserRound} color="emerald" darkMode={darkMode} onClick={() => onNavigate('Data Peserta')} />
        <StatCard title="Cabang Lomba" value={totalCabang.toString()} icon={Binary} color="amber" darkMode={darkMode} onClick={() => onNavigate('Nomor Tampilan')} />
        <StatCard title="Sekolah Terdaftar" value={totalSekolah.toString()} icon={School} color="blue" darkMode={darkMode} onClick={() => onNavigate('Pengaturan')} />
        <StatCard title="Progres Penilaian" value={`${progressPercentage}%`} icon={BarChart3} color="rose" darkMode={darkMode} onClick={() => onNavigate('Penilaian')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Distribution Chart */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Distribusi Peserta per Cabang</h3>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Jumlah Peserta</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="peserta" radius={[6, 6, 0, 0]} barSize={40}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress & Quick Stats */}
        <div className="space-y-8">
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
            <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <Check size={18} className="text-indigo-600" />
              Progres Penilaian
            </h3>
            <div className="flex items-center justify-center relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-4xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  {progressPercentage}%
                </motion.span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selesai</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className={`flex justify-between items-center p-3 border rounded-xl ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-indigo-50/50 border-indigo-100/50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Check size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sudah Dinilai</span>
                </div>
                <span className={`font-extrabold text-lg ${darkMode ? 'text-indigo-400' : 'text-indigo-900'}`}>{judgedCount}</span>
              </div>
              <div className={`flex justify-between items-center p-3 border rounded-xl ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                    <X size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Belum Dinilai</span>
                </div>
                <span className={`font-extrabold text-lg ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>{totalPeserta - judgedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Schools by Participation */}
        <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Partisipasi Sekolah Terbanyak</h3>
          <div className="space-y-5">
            {schoolParticipation.map((school, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-500'}`}>
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{school.name}</span>
                    <span className="text-sm font-bold text-indigo-400">{school.count} Peserta</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(school.count / (schoolParticipation[0]?.count || 1)) * 100}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Aktivitas Terbaru</h3>
          <div className="space-y-6">
            {[
              { user: "Admin", action: "Memperbarui nilai Seni Tari", time: "Baru saja", icon: Edit2, color: darkMode ? "text-blue-400 bg-blue-900/20" : "text-blue-500 bg-blue-50" },
              { user: "Sistem", action: "Sinkronisasi data peserta", time: "10 menit yang lalu", icon: RotateCcw, color: darkMode ? "text-emerald-400 bg-emerald-900/20" : "text-emerald-500 bg-emerald-50" },
              { user: "Admin", action: "Menambahkan peserta baru", time: "25 menit yang lalu", icon: UserRound, color: darkMode ? "text-amber-400 bg-amber-900/20" : "text-amber-500 bg-amber-50" },
              { user: "Sistem", action: "Backup data berhasil", time: "1 jam yang lalu", icon: Save, color: darkMode ? "text-rose-400 bg-rose-900/20" : "text-rose-500 bg-rose-50" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${item.color}`}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.user}</span> {item.action}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Rankings per Category */}
      <div className="space-y-6">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Peringkat Teratas per Cabang Lomba</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {topRankings.map((ranking, i) => (
            <div key={i} className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Trophy size={20} />
                </div>
                <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{ranking.category}</h4>
              </div>
              
              {ranking.top.length > 0 ? (
                <div className="space-y-4">
                  {ranking.top.map((p, idx) => (
                    <div key={p.id} className={`flex items-center gap-4 p-3 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border ${
                        idx === 0 ? (darkMode ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 'bg-amber-100 text-amber-600 border-amber-200') :
                        idx === 1 ? (darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300') :
                        idx === 2 ? (darkMode ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-100 text-orange-600 border-orange-200') :
                        (darkMode ? 'bg-slate-800/50 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200')
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{p.name}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.school}</p>
                      </div>
                      <div className={`text-sm font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {p.total}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center h-32 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Trophy size={24} className="mb-2 opacity-20" />
                  <p className="text-sm">Belum ada nilai</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DataPesertaView = ({ 
  pesertaList, 
  onAddClick,
  onEditClick,
  onDeleteClick,
  onImportCSV,
  schoolFilter,
  onSchoolFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onResetFilters,
  schoolList,
  cabangLomba,
  darkMode
}: { 
  pesertaList: Peserta[], 
  onAddClick: () => void,
  onEditClick: (peserta: Peserta) => void,
  onDeleteClick: (id: string) => void,
  onImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void,
  schoolFilter: string,
  onSchoolFilterChange: (school: string) => void,
  categoryFilter: string,
  onCategoryFilterChange: (category: string) => void,
  onResetFilters: () => void,
  schoolList: string[],
  cabangLomba: string[],
  darkMode?: boolean
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daftar Peserta Terdaftar</h3>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[180px]">
            <select 
              value={schoolFilter}
              onChange={(e) => onSchoolFilterChange(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none pr-8 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
              }`}
            >
              <option value="">Semua Sekolah</option>
              {schoolList.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
          <div className="relative flex-1 sm:flex-none min-w-[180px]">
            <select 
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 appearance-none pr-8 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black'
              }`}
            >
              <option value="">Semua Cabang Lomba</option>
              {cabangLomba.map(lomba => (
                <option key={lomba} value={lomba}>{lomba}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
          <button 
            onClick={onResetFilters}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'text-slate-400 hover:text-teal-400 hover:bg-slate-800' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
            }`}
            title="Reset Filter"
          >
            <RotateCcw size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onImportCSV} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <FileDown size={16} /> Import CSV
          </button>
          <button 
            onClick={onAddClick}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-20">No. Urut</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Peserta</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tempat Tgl Lahir</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cabang Lomba</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {[...pesertaList].sort((a, b) => a.school.localeCompare(b.school)).map((peserta, index) => (
              <tr key={peserta.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{index + 1}</td>
                <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.school}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {peserta.name[0]}
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.name}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.birthInfo}</td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getUniqueSchoolParticipants = (pesertaList: Peserta[]) => {
  const uniqueList: Peserta[] = [];
  const seen = new Set<string>();

  for (const p of pesertaList) {
    if (p.category === 'Pantomim' || p.category === 'Seni Tari') {
      const key = `${p.school}-${p.category}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(p);
      }
    } else {
      uniqueList.push(p);
    }
  }
  return uniqueList;
};

const NomorTampilanView = ({ 
  pesertaList, 
  onUpdateDisplayNumber,
  categoryFilter,
  onCategoryFilterChange,
  cabangLomba,
  darkMode
}: { 
  pesertaList: Peserta[], 
  onUpdateDisplayNumber: (id: string, value: string) => void,
  categoryFilter: string,
  onCategoryFilterChange: (category: string) => void,
  cabangLomba: string[],
  darkMode?: boolean
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-medium"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check size={14} />
            </div>
            Nomor tampilan berhasil disimpan!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Urutan Tampilan & Jadwal</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative min-w-[200px]">
            <select 
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none pr-8 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
              }`}
            >
              <option value="">Semua Cabang Lomba</option>
              {cabangLomba.map(lomba => (
                <option key={lomba} value={lomba}>{lomba}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={showSuccess}
            className={`${
              showSuccess 
                ? (darkMode ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-teal-50 text-teal-600 border-teal-200') 
                : 'bg-teal-600 text-white border-transparent'
            } border px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap shadow-sm active:scale-95 disabled:cursor-default`}
          >
            {showSuccess ? (
              <>
                <Check size={16} /> Tersimpan
              </>
            ) : (
              <>
                <Save size={16} /> Simpan
              </>
            )}
          </button>
        </div>
      </div>
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-20">No. Urut</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cabang Lomba</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-40">Nomor Tampilan</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {[...uniquePesertaList].sort((a, b) => a.school.localeCompare(b.school)).map((peserta, index) => (
              <tr key={peserta.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{index + 1}</td>
                <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.school}</td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.category}</td>
                <td className="px-6 py-4">
                  <input 
                    type="number" 
                    value={peserta.displayNumber || ''}
                    onChange={(e) => onUpdateDisplayNumber(peserta.id, e.target.value)}
                    placeholder="Input No."
                    className={`w-full px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'
                    }`}
                  />
                </td>
              </tr>
            ))}
            {uniquePesertaList.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                  Tidak ada data peserta untuk kategori ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PenilaianView = ({ 
  pesertaList, 
  onUpdateScore,
  categoryFilter,
  onCategoryFilterChange,
  cabangLomba,
  darkMode
}: { 
  pesertaList: Peserta[], 
  onUpdateScore: (id: string, index: number, value: string) => void,
  categoryFilter: string,
  onCategoryFilterChange: (category: string) => void,
  cabangLomba: string[],
  darkMode?: boolean
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.getElementById(`score-input-${rowIndex + 1}-${colIndex}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Calculate totals and ranks
  const dataWithTotal = uniquePesertaList.map(p => {
    const s1 = Number(p.scores?.[0]) || 0;
    const s2 = Number(p.scores?.[1]) || 0;
    const s3 = Number(p.scores?.[2]) || 0;
    return { ...p, total: s1 + s2 + s3 };
  });

  const sortedByTotal = [...dataWithTotal].sort((a, b) => b.total - a.total);
  
  const finalData = dataWithTotal.map(p => {
    const rank = p.total > 0 ? sortedByTotal.findIndex(s => s.total === p.total) + 1 : '-';
    return { ...p, rank };
  }).sort((a, b) => {
    const valA = a.displayNumber ? parseInt(a.displayNumber) : Infinity;
    const valB = b.displayNumber ? parseInt(b.displayNumber) : Infinity;
    return valA - valB;
  });

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-medium"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check size={14} />
            </div>
            Data penilaian berhasil disimpan!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Input Penilaian Peserta</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative min-w-[200px]">
            <select 
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none pr-8 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
              }`}
            >
              <option value="">Semua Cabang Lomba</option>
              {cabangLomba.map(lomba => (
                <option key={lomba} value={lomba}>{lomba}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={showSuccess}
            className={`${
              showSuccess 
                ? (darkMode ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-teal-50 text-teal-600 border-teal-200') 
                : 'bg-teal-600 text-white border-transparent'
            } border px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap shadow-sm active:scale-95 disabled:cursor-default`}
          >
            {showSuccess ? (
              <>
                <Check size={16} /> Tersimpan
              </>
            ) : (
              <>
                <Save size={16} /> Simpan
              </>
            )}
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">No. Tampilan</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cabang Lomba</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">Penilaian 1</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">Penilaian 2</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">Penilaian 3</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-20 text-center">Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {finalData.map((peserta, rowIndex) => (
                <tr key={peserta.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className={`px-4 py-4 text-sm font-bold text-center ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    {peserta.displayNumber || '-'}
                  </td>
                  <td className={`px-4 py-4 text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.school}</td>
                  <td className={`px-4 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.category}</td>
                  <td className="px-4 py-4">
                    <input 
                      id={`score-input-${rowIndex}-0`}
                      type="number" 
                      value={peserta.scores?.[0] || ''}
                      onChange={(e) => onUpdateScore(peserta.id, 0, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                      className={`w-full px-2 py-1 border rounded text-center text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                      }`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input 
                      id={`score-input-${rowIndex}-1`}
                      type="number" 
                      value={peserta.scores?.[1] || ''}
                      onChange={(e) => onUpdateScore(peserta.id, 1, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                      className={`w-full px-2 py-1 border rounded text-center text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                      }`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input 
                      id={`score-input-${rowIndex}-2`}
                      type="number" 
                      value={peserta.scores?.[2] || ''}
                      onChange={(e) => onUpdateScore(peserta.id, 2, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 2)}
                      className={`w-full px-2 py-1 border rounded text-center text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                      }`}
                    />
                  </td>
                  <td className={`px-4 py-4 text-sm font-bold text-center ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {peserta.total}
                  </td>
                </tr>
              ))}
              {finalData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Tidak ada data peserta untuk kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RekapNilaiView = ({ pesertaList, cabangLomba, settings, darkMode }: { pesertaList: Peserta[], cabangLomba: string[], settings: AppSettings, darkMode?: boolean }) => {
  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);
  const sortedPeserta = [...uniquePesertaList].sort((a, b) => a.school.localeCompare(b.school));

  // Pre-calculate rankings for each category
  const categoryRankings = cabangLomba.reduce((acc, cat) => {
    const sorted = uniquePesertaList
      .filter(p => p.category === cat)
      .map(p => ({ 
        id: p.id, 
        total: (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0) 
      }))
      .sort((a, b) => b.total - a.total);
    
    acc[cat] = sorted.reduce((rankAcc, p, idx) => {
      rankAcc[p.id] = p.total > 0 ? idx + 1 : '-';
      return rankAcc;
    }, {} as Record<string, number | string>);
    
    return acc;
  }, {} as Record<string, Record<string, number | string>>);

  const downloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("REKAPITULASI NILAI", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    const today = new Date(settings.date);
    doc.text(`FLS3N-SD KECAMATAN ${settings.place.toUpperCase()} TAHUN ${today.getFullYear()}`, pageWidth / 2, 22, { align: "center" });
    
    const headRow1: any[] = [
      { content: 'No.\nUrut', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Nama Sekolah', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
    ];
    
    const headRow2: any[] = [];
    
    cabangLomba.forEach(cat => {
      headRow1.push({ content: cat, colSpan: 2, styles: { halign: 'center' } });
      headRow2.push({ content: 'Total', styles: { halign: 'center' } }, { content: 'Peringkat', styles: { halign: 'center' } });
    });

    const schoolNames = Array.from(new Set(uniquePesertaList.map(p => p.school))).sort();

    const tableData = schoolNames.map((school, i) => {
      const rowData: any = [i + 1, school];
      cabangLomba.forEach(cat => {
        const p = uniquePesertaList.find(p => p.school === school && p.category === cat);
        if (p) {
          const total = (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0);
          rowData.push(
            { content: total > 0 ? total : '', styles: { halign: 'center' } },
            { content: categoryRankings[cat][p.id] !== '-' ? categoryRankings[cat][p.id] : '', styles: { halign: 'center' } }
          );
        } else {
          rowData.push('', '');
        }
      });
      return rowData;
    });

    autoTable(doc, {
      head: [headRow1, headRow2],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 40 }
      }
    });

    doc.save("Rekap_Nilai_Keseluruhan_FLS3N_Beji.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Rekapitulasi Nilai Keseluruhan</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {}} // Placeholder for Excel
            className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
            title="Download Excel"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button 
            onClick={downloadPDF}
            className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm hover:bg-rose-700 transition-all active:scale-95"
            title="Download PDF"
          >
            <FileDown size={18} />
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
                <th rowSpan={2} className={`px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16 text-center border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>No. Urut</th>
                <th rowSpan={2} className={`px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>Nama Sekolah</th>
                {cabangLomba.map(cat => (
                  <th key={cat} colSpan={2} className={`px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    {cat}
                  </th>
                ))}
              </tr>
              <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
                {cabangLomba.map(cat => (
                  <React.Fragment key={cat}>
                    <th className={`px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      Total
                    </th>
                    <th className={`px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      Peringkat
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {Array.from(new Set(uniquePesertaList.map(p => p.school))).sort().map((school, index) => {
                return (
                  <tr key={school} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className={`px-4 py-4 text-sm text-slate-500 text-center border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>{index + 1}</td>
                    <td className={`px-4 py-4 text-sm font-medium border-r ${darkMode ? 'text-slate-200 border-slate-800' : 'text-slate-900 border-slate-100'}`}>{school}</td>
                    {cabangLomba.map(cat => {
                      const p = uniquePesertaList.find(p => p.school === school && p.category === cat);
                      const total = p ? (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0) : 0;
                      const rank = p ? categoryRankings[cat][p.id] : '-';
                      return (
                        <React.Fragment key={cat}>
                          <td className={`px-4 py-4 text-sm text-center border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            {p && total > 0 ? (
                              <span className={`font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{total}</span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className={`px-4 py-4 text-sm text-center border-r ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            {p && rank !== '-' ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                                rank === 1 ? (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600') :
                                rank === 2 ? (darkMode ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600') :
                                rank === 3 ? (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600') :
                                'text-slate-500'
                              }`}>
                                {rank}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
              {Array.from(new Set(uniquePesertaList.map(p => p.school))).length === 0 && (
                <tr>
                  <td colSpan={(cabangLomba.length * 2) + 2} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Belum ada data peserta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RekapPerCabangView = ({ pesertaList, schoolList, cabangLomba, settings, darkMode }: { pesertaList: Peserta[], schoolList: string[], cabangLomba: string[], settings: AppSettings, darkMode?: boolean }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Cabang Lomba');
  const [selectedSchool, setSelectedSchool] = useState<string>('Semua Nama Sekolah');
  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);

  // 1. Filter by category first
  const categoryData = selectedCategory === 'Semua Cabang Lomba' 
    ? uniquePesertaList 
    : uniquePesertaList.filter(p => p.category === selectedCategory);

  // 2. Calculate ranks within the category (or overall if "Semua Cabang Lomba")
  // Group by category to rank properly if "Semua Cabang Lomba" is selected
  const rankedData = (selectedCategory === 'Semua Cabang Lomba' ? cabangLomba : [selectedCategory]).flatMap(cat => {
    const catPeserta = uniquePesertaList
      .filter(p => p.category === cat)
      .map(p => ({
        ...p,
        totalScore: (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return catPeserta.map((p, index) => ({
      ...p,
      rank: p.totalScore > 0 ? index + 1 : '-'
    }));
  });

  // 3. Filter by school
  const finalData = selectedSchool === 'Semua Nama Sekolah'
    ? rankedData
    : rankedData.filter(p => p.school === selectedSchool);

  // 4. Sort for display (by rank)
  const displayData = [...finalData].sort((a, b) => {
    if (a.rank === '-' && b.rank === '-') return a.school.localeCompare(b.school);
    if (a.rank === '-') return 1;
    if (b.rank === '-') return -1;
    return (a.rank as number) - (b.rank as number);
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("REKAP NILAI", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    const today = new Date(settings.date);
    doc.text(`FLS3N-SD KECAMATAN ${settings.place.toUpperCase()} TAHUN ${today.getFullYear()}`, pageWidth / 2, 22, { align: "center" });
    doc.text(selectedCategory.toUpperCase(), pageWidth / 2, 29, { align: "center" });
    
    const tableData = displayData.map((p) => [
      p.rank,
      p.displayNumber || '-',
      p.school,
      p.category,
      (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0)
    ]);

    autoTable(doc, {
      head: [['Peringkat', 'No.\nTampilan', 'Nama Sekolah', 'Cabang Lomba', 'Total Nilai']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1,
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold'
      },
      styles: { 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        fontSize: 10
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'left' },
        3: { halign: 'left', cellWidth: 40 },
        4: { halign: 'center', cellWidth: 30 }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dateStr = `${settings.place}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const rightColX = pageWidth - 80;

    // Right side date
    doc.text(dateStr, rightColX, finalY);
    
    // Signatures
    const sigY = finalY + 10;
    doc.text("Mengetahui", 20, sigY);
    doc.text("Ketua FLS2N-SD Kec. Beji", 20, sigY + 5);
    
    const catJudgeName = selectedCategory === 'Semua Cabang Lomba' ? 'Juri' : `Juri (${selectedCategory})`;
    doc.text(catJudgeName, rightColX, sigY + 5);
    
    const nameY = sigY + 30;
    doc.setFont("helvetica", "bold");
    
    // Left side: Ketua FLS3N (General Judge from settings)
    doc.text(settings.judgeName, 20, nameY);
    const nameWidth = doc.getTextWidth(settings.judgeName);
    doc.line(20, nameY + 1, 20 + nameWidth, nameY + 1);
    
    // Right side: Specific Category Judge
    const catJudge = settings.categoryJudges[selectedCategory] || { name: '..........................', nip: '..........................' };
    doc.text(catJudge.name, rightColX, nameY);
    const catJudgeWidth = doc.getTextWidth(catJudge.name);
    if (catJudge.name && catJudge.name !== '..........................') {
      doc.line(rightColX, nameY + 1, rightColX + catJudgeWidth, nameY + 1);
    }
    
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${settings.judgeNip}`, 20, nameY + 5);
    doc.text(`NIP. ${catJudge.nip || '..........................'}`, rightColX, nameY + 5);

    doc.save(`Rekap_${selectedCategory.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Rekap Per-Cabang Lomba</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lihat rekapitulasi nilai berdasarkan cabang lomba</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className={`px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
            }`}
          >
            <option value="Semua Nama Sekolah">Semua Nama Sekolah</option>
            {schoolList.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
            }`}
          >
            <option value="Semua Cabang Lomba">Semua Cabang Lomba</option>
            {cabangLomba.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => {}} // Placeholder for Excel
            className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
            title="Download Excel"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button 
            onClick={downloadPDF}
            className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm hover:bg-rose-700 transition-all active:scale-95"
            title="Download PDF"
          >
            <FileDown size={18} />
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">Peringkat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-center">No. Tampilan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cabang Lomba</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-center">Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {displayData.map((peserta) => {
                const total = (Number(peserta.scores?.[0]) || 0) + (Number(peserta.scores?.[1]) || 0) + (Number(peserta.scores?.[2]) || 0);
                return (
                  <tr key={peserta.id} className={`transition-colors ${
                    peserta.rank === 1 ? (darkMode ? 'bg-amber-500/10 hover:bg-amber-500/20' : 'bg-amber-50/50 hover:bg-amber-50') :
                    peserta.rank === 2 ? (darkMode ? 'bg-slate-500/10 hover:bg-slate-500/20' : 'bg-slate-50/50 hover:bg-slate-50') :
                    peserta.rank === 3 ? (darkMode ? 'bg-orange-500/10 hover:bg-orange-500/20' : 'bg-orange-50/50 hover:bg-orange-50') :
                    (darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50')
                  }`}>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        peserta.rank === 1 ? (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600') :
                        peserta.rank === 2 ? (darkMode ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600') :
                        peserta.rank === 3 ? (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600') :
                        'text-slate-500'
                      }`}>
                        {peserta.rank}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-center ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                      {peserta.displayNumber || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.school}</td>
                    <td className={`px-6 py-4 text-sm italic ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.category}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-center ${darkMode ? 'text-emerald-400 bg-slate-800/50' : 'text-emerald-600 bg-slate-50/30'}`}>
                      {total}
                    </td>
                  </tr>
                );
              })}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Tidak ada data peserta untuk kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DaftarHadirView = ({ pesertaList, cabangLomba, settings, darkMode }: { pesertaList: Peserta[], cabangLomba: string[], settings: AppSettings, darkMode?: boolean }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Cabang Lomba');

  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);

  const filteredData = selectedCategory === 'Semua Cabang Lomba' 
    ? pesertaList 
    : pesertaList.filter(p => p.category === selectedCategory);

  const dataWithDisplayNumber = filteredData.map(p => {
    const uniqueP = uniquePesertaList.find(up => up.school === p.school && up.category === p.category);
    return {
      ...p,
      displayNumber: uniqueP?.displayNumber || p.displayNumber || '-'
    };
  });

  const sortedData = [...dataWithDisplayNumber].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.school.localeCompare(b.school);
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("DAFTAR HADIR", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    const today = new Date(settings.date);
    doc.text(`FLS3N-SD KECAMATAN ${settings.place.toUpperCase()} TAHUN ${today.getFullYear()}`, pageWidth / 2, 22, { align: "center" });
    doc.text(selectedCategory.toUpperCase(), pageWidth / 2, 29, { align: "center" });
    
    const tableData = sortedData.map((p, index) => [
      index + 1,
      '', // Empty for No. Tampilan
      p.category,
      p.school,
      p.name,
      p.birthInfo || '-',
      '' // Empty for signature
    ]);

    autoTable(doc, {
      head: [['No.\nUrut', 'No.\nTampilan', 'Cabang Lomba', 'Nama Sekolah', 'Nama Peserta', 'Tempat Tgl Lahir', 'Tanda Tangan']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1,
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold'
      },
      styles: { 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        fontSize: 9,
        minCellHeight: 12,
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 15 },
        2: { halign: 'left', cellWidth: 25 },
        3: { halign: 'left', cellWidth: 35 },
        4: { halign: 'left', cellWidth: 35 },
        5: { halign: 'left', cellWidth: 35 },
        6: { halign: 'center', cellWidth: 25 }
      },
      didDrawCell: function(data) {
        // Add alternating row numbers in signature column
        if (data.section === 'body' && data.column.index === 6) {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          if (data.row.index % 2 === 0) {
            doc.text(`${data.row.index + 1}.`, data.cell.x + 2, data.cell.y + 5);
          } else {
            doc.text(`${data.row.index + 1}.`, data.cell.x + 12, data.cell.y + 10);
          }
        }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const rightColX = pageWidth - 80;
    
    // Signatures
    const sigY = finalY + 10;
    doc.text("Ketua FLS2N-SD Kec. Beji", rightColX, sigY + 5);
    
    const nameY = sigY + 30;
    doc.setFont("helvetica", "bold");
    
    // Right side: Ketua FLS3N (General Judge from settings)
    doc.text(settings.judgeName, rightColX, nameY);
    const nameWidth = doc.getTextWidth(settings.judgeName);
    doc.line(rightColX, nameY + 1, rightColX + nameWidth, nameY + 1);
    
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${settings.judgeNip}`, rightColX, nameY + 5);

    doc.save(`Daftar_Hadir_${selectedCategory.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daftar Hadir</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cetak daftar hadir peserta per cabang lomba</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
            }`}
          >
            <option value="Semua Cabang Lomba">Semua Cabang Lomba</option>
            {cabangLomba.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => {}} // Placeholder for Excel
            className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
            title="Download Excel"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button 
            onClick={downloadPDF}
            className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm hover:bg-rose-700 transition-all active:scale-95"
            title="Download PDF"
          >
            <FileDown size={18} />
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16 text-center">No. Urut</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">No. Tampilan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cabang Lomba</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Peserta</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tempat Tgl Lahir</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-center">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {sortedData.map((peserta, index) => (
                <tr key={peserta.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4 text-sm text-slate-500 text-center">{index + 1}</td>
                  <td className={`px-6 py-4 text-sm font-bold text-center ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    
                  </td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.category}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.school}</td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.name}</td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.birthInfo || '-'}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className={`w-full h-8 border-b border-dashed ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}></div>
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Tidak ada data peserta untuk kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PengumumanView = ({ pesertaList, schoolList, cabangLomba, settings, darkMode }: { pesertaList: Peserta[], schoolList: string[], cabangLomba: string[], settings: AppSettings, darkMode?: boolean }) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('Semua Nama Sekolah');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Cabang Lomba');
  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);

  // Calculate rankings for each category
  const rankedData = cabangLomba.flatMap(category => {
    const categoryPeserta = uniquePesertaList
      .filter(p => p.category === category)
      .map(p => ({
        ...p,
        totalScore: (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return categoryPeserta.map((p, index) => {
      const allParticipantsFromSchool = pesertaList.filter(
        ap => ap.school === p.school && ap.category === category
      );
      const combinedNames = allParticipantsFromSchool.map(ap => ap.name).join(', ');

      return {
        ...p,
        name: combinedNames,
        rank: p.totalScore > 0 ? index + 1 : '-'
      };
    });
  });

  const filteredData = rankedData.filter(p => {
    const matchSchool = selectedSchool === 'Semua Nama Sekolah' || p.school === selectedSchool;
    const matchCategory = selectedCategory === 'Semua Cabang Lomba' || p.category === selectedCategory;
    return matchSchool && matchCategory;
  });

  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    // Header with Logos
    // Left Logo
    if (settings.logoKabupaten) {
      doc.addImage(settings.logoKabupaten, 'PNG', 15, 10, 25, 20);
    }
    
    // Right Logo
    if (settings.logoFLS3N) {
      doc.addImage(settings.logoFLS3N, 'PNG', pageWidth - 40, 10, 25, 20);
    }

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PANITIA FESTIVAL DAN LOMBA", pageWidth / 2, 15, { align: "center" });
    doc.text("SENI DAN SASTRA SISWA NASIONAL SEKOLAH DASAR", pageWidth / 2, 21, { align: "center" });
    doc.text("KECAMATAN BEJI TAHUN 2026", pageWidth / 2, 27, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(15, 32, pageWidth - 15, 32);
    doc.setLineWidth(0.2);
    doc.line(15, 33, pageWidth - 15, 33);

    // Letter Info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let currentY = 40;
    doc.text("Nomor", 15, currentY);
    doc.text(": ....../KKKS-SD/III/2026", 45, currentY);
    currentY += 6;
    doc.text("Lampiran", 15, currentY);
    doc.text(": -", 45, currentY);
    currentY += 6;
    doc.text("Perihal", 15, currentY);
    doc.text(": Pengumuman Juara Seleksi FLS3N-SD Kecamatan Beji", 45, currentY);

    // Title
    currentY += 12;
    doc.setFont("helvetica", "bold");
    doc.text("KEPUTUSAN DEWAN JURI", pageWidth / 2, currentY, { align: "center" });
    currentY += 6;
    doc.text("SELEKSI FLS3N-SD KECAMATAN BEJI TAHUN 2026", pageWidth / 2, currentY, { align: "center" });

    // Opening Statement
    currentY += 10;
    doc.setFont("helvetica", "normal");
    const eventDate = new Date(settings.date);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayName = dayNames[eventDate.getDay()];
    const dateStrLong = `${dayName}, tanggal ${eventDate.getDate()} ${months[eventDate.getMonth()]} ${eventDate.getFullYear()}`;
    
    const openingText = `Pada hari ini, ${dateStrLong} bertempat di ${settings.place}, telah dilaksanakan penjurian terhadap ${cabangLomba.length} cabang lomba pada seleksi FLS3N-SD Kecamatan Beji Tahun ${eventDate.getFullYear()}.`;
    const splitText = doc.splitTextToSize(openingText, pageWidth - 30);
    doc.text(splitText, 15, currentY);
    currentY += (splitText.length * 5) + 5;
    
    doc.text("Setelah melakukan pengamatan dan penilaian berdasarkan kriteria setiap cabang lomba,", 15, currentY);
    currentY += 5;
    doc.text("maka Dewan Juri memutuskan dan menetapkan :", 15, currentY);

    // Table Data Preparation
    const juaraLabels = ["I", "II", "III", "Harapan I", "Harapan II", "Harapan III"];
    const tableRows: any[] = [];
    
    const categoriesToProcess = selectedCategory === 'Semua Cabang Lomba' ? cabangLomba : [selectedCategory];
    
    categoriesToProcess.forEach((cat, catIdx) => {
      const catParticipants = rankedData
        .filter(p => p.category === cat)
        .sort((a, b) => (a.rank as number) - (b.rank as number));

      juaraLabels.forEach((label, idx) => {
        const p = catParticipants[idx];
        tableRows.push([
          idx === 0 ? catIdx + 1 : "", // No. Urut (only for first row of category)
          idx === 0 ? cat : "", // Cabang Lomba (only for first row of category)
          label,
          p?.displayNumber || "",
          p?.name || "",
          p?.school || "",
          p?.totalScore || ""
        ]);
      });
    });

    autoTable(doc, {
      head: [['No.\nUrut', 'Cabang Lomba', 'Juara', 'No.\nTampilan', 'Nama Peserta', 'Nama Sekolah', 'Total Nilai']],
      body: tableRows,
      startY: currentY + 5,
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1,
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold'
      },
      styles: { 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        fontSize: 10,
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 35 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'left' },
        5: { halign: 'left', cellWidth: 35 },
        6: { halign: 'center', cellWidth: 18 }
      },
      didParseCell: function(data) {
        // Handle row spanning for No. Urut and Cabang Lomba
        if (data.section === 'body' && (data.column.index === 0 || data.column.index === 1)) {
          if (data.row.index % 6 === 0) {
            data.cell.rowSpan = 6;
          } else {
            data.cell.styles.textColor = [255, 255, 255]; // Hide text for spanned cells
          }
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;
    
    // Check if we need a new page for signatures
    if (currentY > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(10);
    doc.text("Keputusan ini bersifat mutlak dan dapat dipertanggungjawabkan.", 15, currentY);
    currentY += 6;
    doc.text("Catatan:", 15, currentY);
    currentY += 5;
    doc.text("*Juara 1 tiap cabang lomba akan mewakili sebagai peserta lomba FLS3N-SD Tingkat Kabupaten Pasuruan.", 15, currentY);

    // Signatures
    currentY += 10;
    const today = new Date(settings.date);
    const dateStr = `Beji, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    
    doc.text(dateStr, pageWidth - 15, currentY, { align: "right" });
    currentY += 8;
    
    doc.text("Ketua KKKSD", 45, currentY, { align: "center" });
    doc.text("Ketua FLS3N-SD", pageWidth - 45, currentY, { align: "center" });
    currentY += 5;
    doc.text("Kecamatan Beji", 45, currentY, { align: "center" });
    doc.text("Kecamatan Beji", pageWidth - 45, currentY, { align: "center" });

    const sigNameY = currentY + 20;
    doc.setFont("helvetica", "bold");
    
    // Left Signature
    doc.text(settings.kkksChairmanName, 45, sigNameY, { align: "center" });
    const kkksNameWidth = doc.getTextWidth(settings.kkksChairmanName);
    doc.line(45 - kkksNameWidth/2, sigNameY + 1, 45 + kkksNameWidth/2, sigNameY + 1);
    
    // Right Signature
    const displayJudgeName = (selectedCategory !== 'Semua Cabang Lomba' && settings.categoryJudges[selectedCategory]?.name) 
      ? settings.categoryJudges[selectedCategory].name 
      : settings.judgeName;
    const displayJudgeNip = (selectedCategory !== 'Semua Cabang Lomba' && settings.categoryJudges[selectedCategory]?.nip) 
      ? settings.categoryJudges[selectedCategory].nip 
      : settings.judgeNip;

    doc.text(displayJudgeName, pageWidth - 45, sigNameY, { align: "center" });
    const judgeNameWidth = doc.getTextWidth(displayJudgeName);
    doc.line(pageWidth - 45 - judgeNameWidth/2, sigNameY + 1, pageWidth - 45 + judgeNameWidth/2, sigNameY + 1);

    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${settings.kkksChairmanNip}`, 45, sigNameY + 5, { align: "center" });
    doc.text(`NIP. ${displayJudgeNip}`, pageWidth - 45, sigNameY + 5, { align: "center" });

    currentY = sigNameY + 10;
    doc.text("Mengetahui,", pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    doc.text("Koordinator Wilayah Kecamatan Beji", pageWidth / 2, currentY, { align: "center" });

    currentY += 20;
    doc.setFont("helvetica", "bold");
    doc.text(settings.coordinatorName, pageWidth / 2, currentY, { align: "center" });
    const coordNameWidth = doc.getTextWidth(settings.coordinatorName);
    doc.line(pageWidth / 2 - coordNameWidth/2, currentY + 1, pageWidth / 2 + coordNameWidth/2, currentY + 1);
    
    doc.setFont("helvetica", "normal");
    doc.text("Pembina Utama Muda", pageWidth / 2, currentY + 5, { align: "center" });
    doc.text(`NIP. ${settings.coordinatorNip}`, pageWidth / 2, currentY + 10, { align: "center" });

    doc.save(`Pengumuman_Juara_${selectedCategory.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Pengumuman Pemenang</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Daftar peringkat peserta berdasarkan cabang lomba</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className={`px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
            }`}
          >
            <option value="Semua Nama Sekolah">Semua Nama Sekolah</option>
            {schoolList.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black hover:border-teal-400'
            }`}
          >
            <option value="Semua Cabang Lomba">Semua Cabang Lomba</option>
            {cabangLomba.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => {}} // Placeholder for Excel
            className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
            title="Download Excel"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button 
            onClick={downloadPDF}
            className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm hover:bg-rose-700 transition-all active:scale-95"
            title="Download PDF"
          >
            <FileDown size={18} />
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-800/50 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-100'}`}>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-20 text-center">No. Urut</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cabang Lomba</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24 text-center">Peringkat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-center">No. Tampilan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Peserta</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 text-center">Total Nilai</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filteredData.map((peserta, index) => (
                <tr key={peserta.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4 text-sm text-slate-500 text-center">{index + 1}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.category}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      peserta.rank === 1 ? 'bg-amber-100 text-amber-600' :
                      peserta.rank === 2 ? 'bg-slate-100 text-slate-600' :
                      peserta.rank === 3 ? 'bg-orange-100 text-orange-600' :
                      'text-slate-400'
                    }`}>
                      {peserta.rank}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-center ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    {peserta.displayNumber || '-'}
                  </td>
                  <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{peserta.name}</td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{peserta.school}</td>
                  <td className={`px-6 py-4 text-sm font-bold text-center ${darkMode ? 'text-emerald-400 bg-slate-800/20' : 'text-emerald-600 bg-slate-50/30'}`}>
                    {peserta.totalScore}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    Belum ada data penilaian yang tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SertifikatJuaraView = ({ pesertaList, cabangLomba, settings, darkMode }: { pesertaList: Peserta[], cabangLomba: string[], settings: AppSettings, darkMode?: boolean }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Cabang Lomba');
  const [selectedCertType, setSelectedCertType] = useState<string>('Sertifikat Juara');

  const uniquePesertaList = getUniqueSchoolParticipants(pesertaList);

  const rankedData = cabangLomba.flatMap(category => {
    const categoryPeserta = uniquePesertaList
      .filter(p => p.category === category)
      .map(p => ({
        ...p,
        totalScore: (Number(p.scores?.[0]) || 0) + (Number(p.scores?.[1]) || 0) + (Number(p.scores?.[2]) || 0)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return categoryPeserta.flatMap((p, index) => {
      const rank = p.totalScore > 0 ? index + 1 : '-';
      const allParticipantsFromSchool = pesertaList.filter(
        ap => ap.school === p.school && ap.category === category
      );
      
      return allParticipantsFromSchool.map(ap => ({
        ...ap,
        rank,
        totalScore: p.totalScore
      }));
    });
  });

  const filteredByType = rankedData.filter(p => {
    if (selectedCertType === 'Sertifikat Juara') {
      return typeof p.rank === 'number' && p.rank >= 1 && p.rank <= 3;
    } else if (selectedCertType === 'Sertifikat Harapan') {
      return typeof p.rank === 'number' && p.rank >= 4 && p.rank <= 6;
    } else {
      return p.rank === '-' || (typeof p.rank === 'number' && p.rank > 6);
    }
  });

  const filteredData = selectedCategory === 'Semua Cabang Lomba' 
    ? filteredByType 
    : filteredByType.filter(p => p.category === selectedCategory);

  const downloadCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data sertifikat untuk diunduh.");
      return;
    }

    const headers = ['Cabang Lomba', 'Juara', 'Nama Sekolah', 'Nama Peserta', 'Tempat Tgl Lahir', 'Total'];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(p => {
        const rankRoman = selectedCertType === 'Sertifikat Juara' ? (p.rank === 1 ? 'I' : p.rank === 2 ? 'II' : p.rank === 3 ? 'III' : p.rank) : selectedCertType === 'Sertifikat Harapan' ? (p.rank === 4 ? 'Harapan I' : p.rank === 5 ? 'Harapan II' : p.rank === 6 ? 'Harapan III' : p.rank) : 'Peserta';
        return [
          `"${p.category}"`,
          `"${rankRoman}"`,
          `"${p.school}"`,
          `"${p.name}"`,
          `"${p.birthInfo || '-'}"`,
          `"${p.totalScore}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCertType.replace(/\s+/g, '_')}_${selectedCategory.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Cetak Sertifikat</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pilih jenis sertifikat dan cabang lomba untuk dicetak</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap justify-end">
          <select 
            value={selectedCertType}
            onChange={(e) => setSelectedCertType(e.target.value)}
            className={`px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="Sertifikat Juara">Sertifikat Juara</option>
            <option value="Sertifikat Harapan">Sertifikat Harapan</option>
            <option value="Sertifikat Peserta">Sertifikat Peserta</option>
          </select>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="Semua Cabang Lomba">Semua Cabang Lomba</option>
            {cabangLomba.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={downloadCSV}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            <FileSpreadsheet size={16} /> CSV
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase ${darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              <tr>
                <th className="px-6 py-4 font-bold">No</th>
                <th className="px-6 py-4 font-bold">Cabang Lomba</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold">Nama Sekolah</th>
                <th className="px-6 py-4 font-bold">Nama Peserta</th>
                <th className="px-6 py-4 font-bold">Tempat Tgl Lahir</th>
                <th className="px-6 py-4 font-bold text-center">Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filteredData.map((p, index) => (
                <tr key={`${p.id}-${index}`} className={`hover:bg-slate-50/50 transition-colors ${darkMode ? 'hover:bg-slate-800/50' : ''}`}>
                  <td className={`px-6 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{index + 1}</td>
                  <td className={`px-6 py-4 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{p.category}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.rank === 1 || p.rank === 4 ? 'bg-amber-100 text-amber-700' :
                      p.rank === 2 || p.rank === 5 ? 'bg-slate-200 text-slate-700' :
                      p.rank === 3 || p.rank === 6 ? 'bg-orange-100 text-orange-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {selectedCertType === 'Sertifikat Juara' ? `Juara ${p.rank}` : selectedCertType === 'Sertifikat Harapan' ? `Harapan ${typeof p.rank === 'number' ? p.rank - 3 : p.rank}` : 'Peserta'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{p.school}</td>
                  <td className={`px-6 py-4 font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{p.name}</td>
                  <td className={`px-6 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{p.birthInfo || '-'}</td>
                  <td className={`px-6 py-4 text-center font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{p.totalScore}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className={`px-6 py-8 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Belum ada data sertifikat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PengaturanView = ({ 
  schoolList, 
  setSchoolList, 
  cabangLomba, 
  setCabangLomba, 
  settings, 
  setSettings,
  onSaveSettings,
  darkMode
}: { 
  schoolList: string[], 
  setSchoolList: (list: string[]) => void, 
  cabangLomba: string[], 
  setCabangLomba: (list: string[]) => void, 
  settings: AppSettings, 
  setSettings: (settings: AppSettings) => void,
  onSaveSettings: () => void,
  darkMode?: boolean
}) => {
  const [newSchool, setNewSchool] = useState('');
  const [newCabang, setNewCabang] = useState('');
  const [editingSchool, setEditingSchool] = useState<{ index: number, value: string } | null>(null);
  const [editingCabang, setEditingCabang] = useState<{ index: number, value: string } | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const schoolInputRef = React.useRef<HTMLInputElement>(null);
  const categoryInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportSchoolsCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const importedSchools = data
        .flat()
        .map(s => String(s).trim())
        .filter(s => s && s !== 'undefined' && !schoolList.includes(s));
      
      if (importedSchools.length > 0) {
        const { error } = await supabase.from('master_schools').insert(
          importedSchools.map(name => ({ name }))
        );
        
        if (!error) {
          setSchoolList([...schoolList, ...importedSchools]);
          alert(`Berhasil mengimpor ${importedSchools.length} sekolah.`);
        } else {
          alert('Gagal mengimpor sekolah ke database.');
        }
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImportCategoriesCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const importedCategories = data
        .flat()
        .map(c => String(c).trim())
        .filter(c => c && c !== 'undefined' && !cabangLomba.includes(c));
      
      if (importedCategories.length > 0) {
        const { error } = await supabase.from('master_categories').insert(
          importedCategories.map(name => ({ name }))
        );
        
        if (!error) {
          setCabangLomba([...cabangLomba, ...importedCategories]);
          alert(`Berhasil mengimpor ${importedCategories.length} cabang lomba.`);
        } else {
          alert('Gagal mengimpor cabang lomba ke database.');
        }
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleAddSchool = () => {
    if (newSchool && !schoolList.includes(newSchool)) {
      setSchoolList([...schoolList, newSchool]);
      setNewSchool('');
    }
  };

  const handleUpdateSchool = () => {
    if (editingSchool && editingSchool.value) {
      const newList = [...schoolList];
      newList[editingSchool.index] = editingSchool.value;
      setSchoolList(newList);
      setEditingSchool(null);
    }
  };

  const handleRemoveSchool = (school: string) => {
    setSchoolList(schoolList.filter(s => s !== school));
  };

  const handleAddCabang = () => {
    if (newCabang && !cabangLomba.includes(newCabang)) {
      setCabangLomba([...cabangLomba, newCabang]);
      setNewCabang('');
    }
  };

  const handleUpdateCabang = () => {
    if (editingCabang && editingCabang.value) {
      const newList = [...cabangLomba];
      newList[editingCabang.index] = editingCabang.value;
      setCabangLomba(newList);
      setEditingCabang(null);
    }
  };

  const handleRemoveCabang = (cabang: string) => {
    setCabangLomba(cabangLomba.filter(c => c !== cabang));
  };

  const handleSaveSettings = () => {
    onSaveSettings();
  };

  const updateCategoryJudge = (category: string, field: 'name' | 'nip', value: string) => {
    const newCategoryJudges = { ...settings.categoryJudges };
    if (!newCategoryJudges[category]) {
      newCategoryJudges[category] = { name: '', nip: '' };
    }
    newCategoryJudges[category][field] = value;
    setSettings({ ...settings, categoryJudges: newCategoryJudges });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logoKabupaten' | 'logoFLS3N') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setSettings({ ...settings, [type]: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 pb-10 relative">
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-medium"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check size={14} />
            </div>
            Pengaturan berhasil disimpan!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Pengaturan Sistem</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Konfigurasi data master dan informasi laporan</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Save size={18} /> Simpan Pengaturan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sekolah Section */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <School size={20} />
              <h4>Daftar Sekolah</h4>
            </div>
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={schoolInputRef} 
                onChange={handleImportSchoolsCSV} 
                accept=".csv" 
                className="hidden" 
              />
              <button 
                onClick={() => schoolInputRef.current?.click()}
                className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded transition-all ${
                  darkMode ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700' : 'bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                }`}
              >
                <FileDown size={14} /> Import CSV
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newSchool}
              onChange={(e) => setNewSchool(e.target.value)}
              placeholder="Tambah sekolah baru..."
              className={`flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
              }`}
            />
            <button 
              onClick={handleAddSchool}
              className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className={`max-h-[300px] overflow-y-auto border rounded-lg divide-y ${
            darkMode ? 'border-slate-800 divide-slate-800' : 'border-slate-50 divide-slate-50'
          }`}>
            {schoolList.map((school, index) => (
              <div key={index} className={`flex justify-between items-center p-3 group transition-colors ${
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
              }`}>
                {editingSchool?.index === index ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text"
                      value={editingSchool.value}
                      onChange={(e) => setEditingSchool({ ...editingSchool, value: e.target.value })}
                      className={`flex-1 px-2 py-1 border rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-black'
                      }`}
                      autoFocus
                    />
                    <button onClick={handleUpdateSchool} className="text-emerald-600"><Check size={16} /></button>
                    <button onClick={() => setEditingSchool(null)} className="text-slate-400"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{school}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingSchool({ index, value: school })}
                        className="text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleRemoveSchool(school)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cabang Lomba Section */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-600 font-semibold">
              <Trophy size={20} />
              <h4>Cabang Lomba</h4>
            </div>
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={categoryInputRef} 
                onChange={handleImportCategoriesCSV} 
                accept=".csv" 
                className="hidden" 
              />
              <button 
                onClick={() => categoryInputRef.current?.click()}
                className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded transition-all ${
                  darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-amber-50 text-amber-600 hover:text-amber-700'
                }`}
              >
                <FileDown size={14} /> Import CSV
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newCabang}
              onChange={(e) => setNewCabang(e.target.value)}
              placeholder="Tambah cabang lomba..."
              className={`flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
              }`}
            />
            <button 
              onClick={handleAddCabang}
              className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className={`max-h-[300px] overflow-y-auto border rounded-lg divide-y ${
            darkMode ? 'border-slate-800 divide-slate-800' : 'border-slate-50 divide-slate-50'
          }`}>
            {cabangLomba.map((cabang, index) => (
              <div key={index} className={`flex justify-between items-center p-3 group transition-colors ${
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
              }`}>
                {editingCabang?.index === index ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text"
                      value={editingCabang.value}
                      onChange={(e) => setEditingCabang({ ...editingCabang, value: e.target.value })}
                      className={`flex-1 px-2 py-1 border rounded text-sm outline-none focus:ring-2 focus:ring-amber-500 ${
                        darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-black'
                      }`}
                      autoFocus
                    />
                    <button onClick={handleUpdateCabang} className="text-amber-600"><Check size={16} /></button>
                    <button onClick={() => setEditingCabang(null)} className="text-slate-400"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{cabang}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingCabang({ index, value: cabang })}
                        className="text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleRemoveCabang(cabang)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Juri per Cabang Lomba Section */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-6 lg:col-span-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2 text-rose-600 font-semibold mb-2">
            <UserRound size={20} />
            <h4>Juri per Cabang Lomba</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cabangLomba.map(cat => (
              <div key={cat} className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <h5 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{cat}</h5>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Juri</label>
                    <input 
                      type="text" 
                      value={settings.categoryJudges[cat]?.name || ''}
                      onChange={(e) => updateCategoryJudge(cat, 'name', e.target.value)}
                      placeholder="Nama Juri..."
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-rose-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">NIP Juri</label>
                    <input 
                      type="text" 
                      value={settings.categoryJudges[cat]?.nip || ''}
                      onChange={(e) => updateCategoryJudge(cat, 'nip', e.target.value)}
                      placeholder="NIP Juri..."
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-rose-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-black'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informasi Laporan Section */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-6 lg:col-span-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
            <BarChart3 size={20} />
            <h4>Informasi Laporan & Tanda Tangan</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Logo Laporan</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-xs font-medium block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Logo Kabupaten (Kiri)</label>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 border rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {settings.logoKabupaten ? (
                        <img src={settings.logoKabupaten} alt="Logo Kabupaten" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center px-1">Belum ada logo</span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'logoKabupaten')}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-medium block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Logo FLS3N (Kanan)</label>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 border rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}>
                      {settings.logoFLS3N ? (
                        <img src={settings.logoFLS3N} alt="Logo FLS3N" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center px-1">Belum ada logo</span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'logoFLS3N')}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lokasi & Waktu</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tempat Cetak</label>
                  <input 
                    type="text" 
                    value={settings.place}
                    onChange={(e) => setSettings({...settings, place: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tanggal Cetak</label>
                  <input 
                    type="date" 
                    value={settings.date}
                    onChange={(e) => setSettings({...settings, date: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ketua FLS3N-SD (Juri)</h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    value={settings.judgeName}
                    onChange={(e) => setSettings({...settings, judgeName: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>NIP</label>
                  <input 
                    type="text" 
                    value={settings.judgeNip}
                    onChange={(e) => setSettings({...settings, judgeNip: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ketua KKKS-SD</h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    value={settings.kkksChairmanName}
                    onChange={(e) => setSettings({...settings, kkksChairmanName: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>NIP</label>
                  <input 
                    type="text" 
                    value={settings.kkksChairmanNip}
                    onChange={(e) => setSettings({...settings, kkksChairmanNip: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Koordinator Wilayah</h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    value={settings.coordinatorName}
                    onChange={(e) => setSettings({...settings, coordinatorName: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>NIP</label>
                  <input 
                    type="text" 
                    value={settings.coordinatorNip}
                    onChange={(e) => setSettings({...settings, coordinatorNip: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Kepala Dinas</h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    value={settings.headOfDepartmentName}
                    onChange={(e) => setSettings({...settings, headOfDepartmentName: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>NIP</label>
                  <input 
                    type="text" 
                    value={settings.headOfDepartmentNip}
                    onChange={(e) => setSettings({...settings, headOfDepartmentNip: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaceholderView = ({ title, darkMode }: { title: string, darkMode: boolean }) => (
  <div className={`flex flex-col items-center justify-center h-[60vh] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
      <BarChart3 size={40} />
    </div>
    <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Halaman {title}</h3>
    <p className="text-sm">Modul ini sedang dalam tahap pengembangan.</p>
  </div>
);

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPeserta, setEditingPeserta] = useState<Peserta | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [newSchool, setNewSchool] = useState('');
  const [newCabang, setNewCabang] = useState('');
  
  const [schoolList, setSchoolList] = useState<string[]>([]);
  const [cabangLomba, setCabangLomba] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    judgeName: "",
    judgeNip: "",
    place: "",
    date: "",
    kkksChairmanName: "",
    kkksChairmanNip: "",
    coordinatorName: "",
    coordinatorNip: "",
    headOfDepartmentName: "TRI KRISNI ASTUTI, S.Sos, MM.",
    headOfDepartmentNip: "197004241997032007",
    categoryJudges: {},
    logoKabupaten: "",
    logoFLS3N: ""
  });

  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Supabase Sync ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Settings
        const { data: settingsData } = await supabase.from('settings').select('*').single();
        if (settingsData) {
          setSettings({
            judgeName: settingsData.judge_name,
            judgeNip: settingsData.judge_nip,
            place: settingsData.place,
            date: settingsData.date,
            kkksChairmanName: settingsData.kkks_chairman_name,
            kkksChairmanNip: settingsData.kkks_chairman_nip,
            coordinatorName: settingsData.coordinator_name,
            coordinatorNip: settingsData.coordinator_nip,
            headOfDepartmentName: settingsData.head_of_department_name || "TRI KRISNI ASTUTI, S.Sos, MM.",
            headOfDepartmentNip: settingsData.head_of_department_nip || "197004241997032007",
            categoryJudges: settingsData.category_judges || {},
            logoKabupaten: settingsData.logo_kabupaten || "",
            logoFLS3N: settingsData.logo_fls3n || ""
          });
        }

        // Fetch Schools
        const { data: schoolsData } = await supabase.from('master_schools').select('name');
        if (schoolsData) setSchoolList(schoolsData.map(s => s.name));

        // Fetch Categories
        const { data: categoriesData } = await supabase.from('master_categories').select('name');
        if (categoriesData) setCabangLomba(categoriesData.map(c => c.name));

        // Fetch Peserta
        const { data: pesertaData } = await supabase.from('peserta').select('*');
        if (pesertaData) {
          setPesertaList(pesertaData.map(p => ({
            id: p.id,
            name: p.name,
            school: p.school,
            birthInfo: p.birth_info,
            category: p.category,
            status: p.status,
            displayNumber: p.display_number,
            scores: p.scores
          })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // --- Realtime Subscriptions ---
    const pesertaSubscription = supabase
      .channel('peserta_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'peserta' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newP = payload.new;
          setPesertaList(prev => {
            if (prev.find(p => p.id === newP.id)) return prev;
            return [...prev, {
              id: newP.id,
              name: newP.name,
              school: newP.school,
              birthInfo: newP.birth_info,
              category: newP.category,
              status: newP.status,
              displayNumber: newP.display_number,
              scores: newP.scores
            }];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedP = payload.new;
          setPesertaList(prev => prev.map(p => p.id === updatedP.id ? {
            id: updatedP.id,
            name: updatedP.name,
            school: updatedP.school,
            birthInfo: updatedP.birth_info,
            category: updatedP.category,
            status: updatedP.status,
            displayNumber: updatedP.display_number,
            scores: updatedP.scores
          } : p));
        } else if (payload.eventType === 'DELETE') {
          setPesertaList(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    const settingsSubscription = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        const s = payload.new;
        setSettings({
          judgeName: s.judge_name,
          judgeNip: s.judge_nip,
          place: s.place,
          date: s.date,
          kkksChairmanName: s.kkks_chairman_name,
          kkksChairmanNip: s.kkks_chairman_nip,
          coordinatorName: s.coordinator_name,
          coordinatorNip: s.coordinator_nip,
          categoryJudges: s.category_judges || {}
        });
      })
      .subscribe();

    const schoolsSubscription = supabase
      .channel('schools_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'master_schools' }, () => {
        // Re-fetch schools list for simplicity
        supabase.from('master_schools').select('name').then(({ data }) => {
          if (data) setSchoolList(data.map(s => s.name));
        });
      })
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'master_categories' }, () => {
        // Re-fetch categories list for simplicity
        supabase.from('master_categories').select('name').then(({ data }) => {
          if (data) setCabangLomba(data.map(c => c.name));
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pesertaSubscription);
      supabase.removeChannel(settingsSubscription);
      supabase.removeChannel(schoolsSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, []);

  const handleAddPeserta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPeserta) {
      const updatedPeserta = { ...editingPeserta, ...formData };
      const { error } = await supabase
        .from('peserta')
        .update({
          name: formData.name,
          school: formData.school,
          birth_info: formData.birthInfo,
          category: formData.category
        })
        .eq('id', editingPeserta.id);
      
      if (!error) {
        setPesertaList(pesertaList.map(p => p.id === editingPeserta.id ? updatedPeserta : p));
      }
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const newPeserta: Peserta = {
        id: newId,
        name: formData.name,
        school: formData.school,
        birthInfo: formData.birthInfo,
        category: formData.category,
        status: 'Pending'
      };
      
      const { error } = await supabase
        .from('peserta')
        .insert([{
          id: newId,
          name: formData.name,
          school: formData.school,
          birth_info: formData.birthInfo,
          category: formData.category,
          status: 'Pending'
        }]);

      if (!error) {
        setPesertaList([...pesertaList, newPeserta]);
      }
    }
    closeModal();
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const { error } = await supabase.from('peserta').delete().eq('id', deletingId);
      if (!error) {
        setPesertaList(pesertaList.filter(p => p.id !== deletingId));
      }
      setDeletingId(null);
    }
  };

  const handleUpdateDisplayNumber = async (id: string, value: string) => {
    const { error } = await supabase.from('peserta').update({ display_number: value }).eq('id', id);
    if (!error) {
      setPesertaList(pesertaList.map(p => p.id === id ? { ...p, displayNumber: value } : p));
    }
  };

  const handleUpdateScore = async (id: string, index: number, value: string) => {
    const p = pesertaList.find(pes => pes.id === id);
    if (!p) return;

    const newScores = [...(p.scores || ['', '', ''])] as [number | string, number | string, number | string];
    newScores[index] = value;

    const { error } = await supabase.from('peserta').update({ scores: newScores }).eq('id', id);
    if (!error) {
      setPesertaList(pesertaList.map(pes => pes.id === id ? { ...pes, scores: newScores } : pes));
    }
  };

  const handleSaveSettings = async () => {
    const { error } = await supabase.from('settings').upsert({
      id: 1,
      judge_name: settings.judgeName,
      judge_nip: settings.judgeNip,
      place: settings.place,
      date: settings.date,
      kkks_chairman_name: settings.kkksChairmanName,
      kkks_chairman_nip: settings.kkksChairmanNip,
      coordinator_name: settings.coordinatorName,
      coordinator_nip: settings.coordinatorNip,
      head_of_department_name: settings.headOfDepartmentName,
      head_of_department_nip: settings.headOfDepartmentNip,
      category_judges: settings.categoryJudges,
      logo_kabupaten: settings.logoKabupaten,
      logo_fls3n: settings.logoFLS3N
    });

    if (!error) {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const handleAddSchool = async () => {
    if (newSchool && !schoolList.includes(newSchool)) {
      const { error } = await supabase.from('master_schools').insert([{ name: newSchool }]);
      if (!error) {
        setSchoolList([...schoolList, newSchool]);
        setNewSchool('');
      }
    }
  };

  const handleRemoveSchool = async (school: string) => {
    const { error } = await supabase.from('master_schools').delete().eq('name', school);
    if (!error) {
      setSchoolList(schoolList.filter(s => s !== school));
    }
  };

  const handleAddCabang = async () => {
    if (newCabang && !cabangLomba.includes(newCabang)) {
      const { error } = await supabase.from('master_categories').insert([{ name: newCabang }]);
      if (!error) {
        setCabangLomba([...cabangLomba, newCabang]);
        setNewCabang('');
      }
    }
  };

  const handleRemoveCabang = async (cabang: string) => {
    const { error } = await supabase.from('master_categories').delete().eq('name', cabang);
    if (!error) {
      setCabangLomba(cabangLomba.filter(c => c !== cabang));
    }
  };

  const handleDeletePeserta = (id: string) => {
    setDeletingId(id);
  };

  const openEditModal = (peserta: Peserta) => {
    setEditingPeserta(peserta);
    setFormData({
      school: peserta.school,
      name: peserta.name,
      birthInfo: peserta.birthInfo,
      category: peserta.category
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPeserta(null);
    setFormData({ school: schoolList[0] || '', name: '', birthInfo: '', category: cabangLomba[0] || '' });
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const importedPeserta: Peserta[] = data.map((item) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item['Nama Peserta'] || item['Nama'] || '',
        school: item['Nama Sekolah'] || item['Sekolah'] || '',
        birthInfo: item['Tempat Tgl Lahir'] || item['TTL'] || '',
        category: item['Cabang Lomba'] || item['Kategori'] || cabangLomba[0],
        status: 'Pending' as const
      })).filter(p => p.name && p.school);

      if (importedPeserta.length > 0) {
        const { error } = await supabase.from('peserta').insert(importedPeserta.map(p => ({
          id: p.id,
          name: p.name,
          school: p.school,
          birth_info: p.birthInfo,
          category: p.category,
          status: p.status
        })));

        if (!error) {
          setPesertaList([...pesertaList, ...importedPeserta]);
          alert(`Berhasil mengimpor ${importedPeserta.length} peserta.`);
        } else {
          alert('Gagal mengimpor data ke database.');
        }
      } else {
        alert('Tidak ada data valid yang ditemukan. Pastikan header kolom sesuai (Nama Peserta, Nama Sekolah, Tempat Tgl Lahir, Cabang Lomba).');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const [formData, setFormData] = useState({
    school: '',
    name: '',
    birthInfo: '',
    category: ''
  });

  useEffect(() => {
    if (!editingPeserta && schoolList.length > 0 && cabangLomba.length > 0) {
      setFormData(prev => ({
        ...prev,
        school: prev.school || schoolList[0],
        category: prev.category || cabangLomba[0]
      }));
    }
  }, [schoolList, cabangLomba, editingPeserta]);

  const filteredPeserta = pesertaList.filter(p => {
    const matchesSchool = schoolFilter ? p.school === schoolFilter : true;
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSchool && matchesCategory;
  });

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard': return (
        <DashboardView 
          pesertaList={pesertaList} 
          cabangLomba={cabangLomba} 
          schoolList={schoolList} 
          settings={settings} 
          darkMode={darkMode}
          onNavigate={setActiveView}
        />
      );
      case 'Data Peserta': return (
        <DataPesertaView 
          pesertaList={filteredPeserta} 
          onAddClick={() => setIsModalOpen(true)} 
          onEditClick={openEditModal}
          onDeleteClick={handleDeletePeserta}
          onImportCSV={handleImportCSV}
          schoolFilter={schoolFilter}
          onSchoolFilterChange={setSchoolFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onResetFilters={() => {
            setSchoolFilter('');
            setCategoryFilter('');
          }}
          schoolList={schoolList}
          cabangLomba={cabangLomba}
          darkMode={darkMode}
        />
      );
      case 'Nomor Tampilan': return (
        <NomorTampilanView 
          pesertaList={filteredPeserta}
          onUpdateDisplayNumber={handleUpdateDisplayNumber}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          cabangLomba={cabangLomba}
          darkMode={darkMode}
        />
      );
      case 'Penilaian': return (
        <PenilaianView 
          pesertaList={filteredPeserta}
          onUpdateScore={handleUpdateScore}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          cabangLomba={cabangLomba}
          darkMode={darkMode}
        />
      );
      case 'Rekap Nilai': return (
        <RekapNilaiView pesertaList={pesertaList} cabangLomba={cabangLomba} settings={settings} darkMode={darkMode} />
      );
      case 'Rekap Per-Cabang Lomba': return (
        <RekapPerCabangView pesertaList={pesertaList} schoolList={schoolList} cabangLomba={cabangLomba} settings={settings} darkMode={darkMode} />
      );
      case 'Pengumuman': return (
        <PengumumanView pesertaList={pesertaList} schoolList={schoolList} cabangLomba={cabangLomba} settings={settings} darkMode={darkMode} />
      );
      case 'Pengaturan': return (
        <PengaturanView 
          schoolList={schoolList}
          setSchoolList={setSchoolList}
          cabangLomba={cabangLomba}
          setCabangLomba={setCabangLomba}
          settings={settings}
          setSettings={setSettings}
          onSaveSettings={handleSaveSettings}
          darkMode={darkMode}
        />
      );
      case 'Daftar Hadir': return (
        <DaftarHadirView pesertaList={pesertaList} cabangLomba={cabangLomba} settings={settings} darkMode={darkMode} />
      );
      case 'Sertifikat': return (
        <SertifikatJuaraView pesertaList={pesertaList} cabangLomba={cabangLomba} settings={settings} darkMode={darkMode} />
      );
      default: return <PlaceholderView title={activeView} darkMode={darkMode} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${darkMode ? 'bg-[#0f1117] text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingPeserta ? 'Edit Peserta' : 'Tambah Peserta Baru'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddPeserta} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sekolah</label>
                  <select 
                    required
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-400 transition-all"
                  >
                    {schoolList.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Peserta</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nama Lengkap Siswa"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempat Tanggal Lahir</label>
                  <input 
                    required
                    type="text" 
                    value={formData.birthInfo}
                    onChange={(e) => setFormData({...formData, birthInfo: e.target.value})}
                    placeholder="Contoh: Depok, 12-05-2014"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cabang Lomba</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-400 transition-all"
                  >
                    {cabangLomba.map(lomba => (
                      <option key={lomba} value={lomba}>{lomba}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all active:scale-[0.98]"
                  >
                    {editingPeserta ? 'Simpan Perubahan' : 'Simpan Peserta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Peserta?</h3>
              <p className="text-slate-500 text-sm mb-8">
                Tindakan ini tidak dapat dibatalkan. Data peserta akan dihapus secara permanen dari sistem.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-700 transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-500 ease-in-out border-r ${
          darkMode 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-100 shadow-xl'
        } ${
          sidebarOpen ? 'w-72' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section with distinct background */}
          <div className="p-6">
            <div className={`flex items-center gap-4 p-4 rounded-3xl border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700 shadow-lg' 
                : 'bg-indigo-50 border-indigo-100 shadow-sm'
            }`}>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-2xl shadow-indigo-500/20 shrink-0 overflow-hidden border border-white/20">
                <img src="https://pusatprestasinasional.kemendikdasmen.go.id/uploads/event/cOKxdgS0KQhv9FlzGXeJin7A4hX8T6JaIwK3Evy1.png" alt="Logo Aplikasi" className="w-full h-full object-contain p-1.5" />
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden whitespace-nowrap">
                  <h1 className={`font-black text-xl tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>FLS3N-SD</h1>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Kecamatan Beji</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => setActiveView('Dashboard')} darkMode={darkMode} />
            <NavItem icon={UserRound} label="Data Peserta" active={activeView === 'Data Peserta'} onClick={() => setActiveView('Data Peserta')} darkMode={darkMode} />
            <NavItem icon={FileText} label="Daftar Hadir" active={activeView === 'Daftar Hadir'} onClick={() => setActiveView('Daftar Hadir')} darkMode={darkMode} />
            <NavItem icon={Binary} label="Nomor Tampilan" active={activeView === 'Nomor Tampilan'} onClick={() => setActiveView('Nomor Tampilan')} darkMode={darkMode} />
            <NavItem icon={Award} label="Penilaian" active={activeView === 'Penilaian'} onClick={() => setActiveView('Penilaian')} darkMode={darkMode} />
            <NavItem icon={BarChart3} label="Laporan" active={activeView === 'Rekap Nilai' || activeView === 'Rekap Per-Cabang Lomba' || activeView === 'Pengumuman'} onClick={() => setActiveView('Rekap Nilai')} darkMode={darkMode} />
            <AnimatePresence>
              {(activeView === 'Rekap Nilai' || activeView === 'Rekap Per-Cabang Lomba' || activeView === 'Pengumuman') && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 mb-2 space-y-1">
                    <SubNavItem label="Rekap Nilai" active={activeView === 'Rekap Nilai'} onClick={() => setActiveView('Rekap Nilai')} darkMode={darkMode} />
                    <SubNavItem label="Rekap Per-Cabang Lomba" active={activeView === 'Rekap Per-Cabang Lomba'} onClick={() => setActiveView('Rekap Per-Cabang Lomba')} darkMode={darkMode} />
                    <SubNavItem label="Pengumuman" active={activeView === 'Pengumuman'} onClick={() => setActiveView('Pengumuman')} darkMode={darkMode} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <NavItem icon={Printer} label="Cetak" active={activeView === 'Sertifikat'} onClick={() => setActiveView('Sertifikat')} darkMode={darkMode} />
            <AnimatePresence>
              {(activeView === 'Sertifikat') && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 mb-2 space-y-1">
                    <SubNavItem label="Sertifikat" active={activeView === 'Sertifikat'} onClick={() => setActiveView('Sertifikat')} darkMode={darkMode} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="pt-6 mt-6 border-t border-white/10">
              <NavItem icon={Settings2} label="Pengaturan" active={activeView === 'Pengaturan'} onClick={() => setActiveView('Pengaturan')} darkMode={darkMode} />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 px-8 py-4 flex items-center justify-between ${
          darkMode ? 'bg-[#1e222d]/80' : 'bg-white/80 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <Menu size={20} />
            </button>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{activeView}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`h-8 w-[1px] mx-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-semibold leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Beji</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Koordinator</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-slate-50/50 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Memuat Data...</p>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
