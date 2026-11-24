import React, { useMemo, useState } from 'react'
import {
  LayoutDashboard, ClipboardList, WalletCards, ShieldCheck, Users, Search, Bell,
  Plus, ChevronDown, TrendingUp, Clock3, CheckCircle2, Building2, MoreHorizontal,
  Download, SlidersHorizontal, X, ArrowUpRight, Menu, LogOut, House
} from 'lucide-react'

const rupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const initialPlans = [
  { id: 'PNC-2026-001', title: 'Renovasi Rumah Dinas Golongan IV', location: 'Jakarta Selatan', category: 'Renovasi', amount: 285000000, year: 2026, status: 'Menunggu', date: '20 Nov 2026' },
  { id: 'PNC-2026-002', title: 'Pemeliharaan Gedung Rumah Dinas', location: 'Bandung', category: 'Pemeliharaan', amount: 120500000, year: 2026, status: 'Disetujui', date: '18 Nov 2026' },
  { id: 'PNC-2026-003', title: 'Pengadaan Perabot Rumah Dinas', location: 'Surabaya', category: 'Pengadaan', amount: 95800000, year: 2026, status: 'Ditinjau', date: '15 Nov 2026' },
  { id: 'PNC-2026-004', title: 'Perbaikan Listrik dan Sanitasi', location: 'Yogyakarta', category: 'Pemeliharaan', amount: 74200000, year: 2026, status: 'Disetujui', date: '12 Nov 2026' },
]

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'planning', label: 'Perencanaan', icon: ClipboardList },
  { key: 'budget', label: 'Penganggaran', icon: WalletCards },
  { key: 'supervisor', label: 'Verifikasi Atasan', icon: ShieldCheck },
  { key: 'admin', label: 'Manajemen Admin', icon: Users },
]

function Status({ value }) {
  const cls = value === 'Disetujui' ? 'approved' : value === 'Ditinjau' ? 'review' : 'pending'
  return <span className={`status ${cls}`}><i />{value}</span>
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [plans, setPlans] = useState(() => JSON.parse(localStorage.getItem('spid-plans') || 'null') || initialPlans)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [modal, setModal] = useState(false)
  const [sidebar, setSidebar] = useState(false)

  const savePlans = (next) => { setPlans(next); localStorage.setItem('spid-plans', JSON.stringify(next)) }
  const visiblePlans = useMemo(() => plans.filter(p => (filter === 'Semua' || p.status === filter) && (`${p.title} ${p.location} ${p.id}`.toLowerCase().includes(search.toLowerCase()))), [plans, filter, search])
  const approved = plans.filter(p => p.status === 'Disetujui').reduce((s, p) => s + p.amount, 0)
  const pending = plans.filter(p => p.status === 'Menunggu').reduce((s, p) => s + p.amount, 0)

  const verify = (id, status) => savePlans(plans.map(p => p.id === id ? { ...p, status } : p))

  const submitPlan = (e) => {
    e.preventEvent?.();
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><House size={20} /></div><div><b>SPID</b><span>Sistem Perencanaan & Anggaran</span></div></div>
        <nav>
          <p className="nav-label">MENU UTAMA</p>
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} className={page === key ? 'active' : ''} onClick={() => { setPage(key); setSidebar(false) }}>
              <Icon size={19} /><span>{label}</span>{key === 'supervisor' && <em>{plans.filter(p => p.status === 'Menunggu').length}</em>}
            </button>
          ))}
        </nav>
        <div className="profile">
          <div className="avatar">AR</div><div><b>Arif Rahman</b><span>Administrator</span></div><LogOut size={17} />
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebar(!sidebar)}><Menu size={21} /></button>
          <div className="search"><Search size={18} /><input placeholder="Cari perencanaan, lokasi..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="top-actions"><button className="icon-btn"><Bell size={19} /><i /></button><div className="top-profile"><div className="avatar small">AR</div><ChevronDown size={16} /></div></div>
        </header>

        <div className="content">
          {page === 'dashboard' && <Dashboard plans={plans} approved={approved} pending={pending} setModal={setModal} setPage={setPage} />}
          {page === 'planning' && <PlanPage plans={visiblePlans} setModal={setModal} filter={filter} setFilter={setFilter} />}
          {page === 'budget' && <BudgetPage plans={plans} />}
          {page === 'supervisor' && <VerificationPage plans={plans} verify={verify} />}
          {page === 'admin' && <AdminPage plans={plans} />}
        </div>
      </main>

      {modal && <PlanModal onClose={() => setModal(false)} onSubmit={(plan) => { savePlans([{ ...plan, id: `PNC-2026-${String(plans.length + 1).padStart(3, '0')}`, date: '24 Nov 2026', status: 'Menunggu' }, ...plans]); setModal(false); setPage('planning') }} />}
    </div>
  )
}

function Dashboard({ plans, approved, pending, setModal, setPage }) {
  const total = plans.reduce((s, p) => s + p.amount, 0)
  return <>
    <div className="page-heading"><div><p>RABUN DESK / 24 NOVEMBER 2026</p><h1>Ringkasan Anggaran</h1></div><button className="primary" onClick={() => setModal(true)}><Plus size={18} />Tambah Perencanaan</button></div>
    <div className="stats-grid">
      <Stat title="Total Anggaran" value={rupiah(total)} note="Sepanjang tahun 2026" icon={WalletCards} color="green" />
      <Stat title="Sudah Disetujui" value={rupiah(approved)} note={`${plans.filter(p => p.status === 'Disetujui').length} perencanaan`} icon={CheckCircle2} color="blue" />
      <Stat title="Menunggu Verifikasi" value={rupiah(pending)} note={`${plans.filter(p => p.status === 'Menunggu').length} perlu ditinjau`} icon={Clock3} color="gold" />
      <Stat title="Jumlah Perencanaan" value={plans.length} note="3 lokasi aktif" icon={Building2} color="purple" />
    </div>
    <div className="dashboard-grid">
      <section className="card chart-card"><div className="card-head"><div><h2>Realisasi Anggaran</h2><p>Pencapaian per triwulan</p></div><button className="ghost">2026 <ChevronDown size={14} /></button></div>
        <div className="chart"><div className="axis"><span>300 jt</span><span>200 jt</span><span>100 jt</span><span>0</span></div><div className="bars">
          {[42,62,38,76].map((h,i)=><div className="bar-group" key={i}><div className="bar-bg"><div className="bar" style={{height:`${h}%`}} /></div><b>TW {i+1}</b></div>)}
        </div></div>
      </section>
      <section className="card distribution"><div className="card-head"><div><h2>Distribusi Kategori</h2><p>Proporsi anggaran</p></div><MoreHorizontal size={19}/></div>
        <div className="donut-wrap"><div className="donut"><div><b>100%</b><span>Total</span></div></div><div className="legend"><Legend color="green" label="Renovasi" value="44%"/><Legend color="blue" label="Pemeliharaan" value="31%"/><Legend color="gold" label="Pengadaan" value="25%"/></div></div>
      </section>
    </div>
    <RecentPlans plans={plans.slice(0,4)} setPage={setPage} />
  </>
}

function Stat({ title, value, note, icon: Icon, color }) { return <section className="stat-card"><div className={`stat-icon ${color}`}><Icon size={20}/></div><div><p>{title}</p><h3>{value}</h3><span>{note}</span></div><TrendingUp size={16} className="trend"/></section> }
function Legend({color,label,value}) { return <div className="legend-row"><i className={color}/><span>{label}</span><b>{value}</b></div> }

function RecentPlans({ plans, setPage }) { return <section className="card table-card"><div className="card-head"><div><h2>Perencanaan Terbaru</h2><p>Pengajuan terakhir yang masuk</p></div><button className="text-btn" onClick={() => setPage('planning')}>Lihat Semua <ArrowUpRight size={15}/></button></div>
  <Table plans={plans}/></section> }

function Table({ plans, onVerify }) { return <div className="table-wrap"><table><thead><tr><th>ID PERENCANAAN</th><th>NAMA KEGIATAN</th><th>LOKASI</th><th>NILAI ANGGARAN</th><th>STATUS</th>{onVerify && <th>AKSI</th>}</tr></thead><tbody>{plans.map(p => <tr key={p.id}><td><b className="id">{p.id}</b></td><td><b>{p.title}</b><small>{p.category} • {p.date}</small></td><td>{p.location}</td><td className="amount">{rupiah(p.amount)}</td><td><Status value={p.status}/></td>{onVerify && <td><div className="verify-actions"><button onClick={() => onVerify(p.id,'Disetujui')}>Setujui</button><button onClick={() => onVerify(p.id,'Ditinjau')}>Tinjau</button></div></td>}</tr>)}</tbody></table>{plans.length === 0 && <div className="empty">Tidak ada data ditemukan</div>}</div> }

function PlanPage({ plans, setModal, filter, setFilter }) { return <><div className="page-heading"><div><p>RABUN DESK / PERENCANAAN</p><h1>Perencanaan Rumah Dinas</h1></div><button className="primary" onClick={() => setModal(true)}><Plus size={18}/>Tambah Perencanaan</button></div>
  <section className="card table-card"><div className="toolbar"><div className="tabs">{['Semua','Menunggu','Ditinjau','Disetujui'].map(t => <button key={t} className={filter===t?'active':''} onClick={() => setFilter(t)}>{t}</button>)}</div><button className="outline"><SlidersHorizontal size={16}/>Filter</button></div><Table plans={plans}/></section></> }

function BudgetPage({ plans }) { const total = plans.reduce((s,p)=>s+p.amount,0); return <><div className="page-heading"><div><p>RABUN DESK / PENGANGGARAN</p><h1>Penganggaran</h1></div><button className="outline"><Download size={17}/>Ekspor Laporan</button></div>
  <div className="budget-summary"><div><span>Alokasi Anggaran 2026</span><h2>{rupiah(total)}</h2></div><div><span>Terpakai</span><h2>{rupiah(plans.filter(p=>p.status==='Disetujui').reduce((s,p)=>s+p.amount,0))}</h2></div><div><span>Sisa</span><h2>{rupiah(total-plans.filter(p=>p.status==='Disetujui').reduce((s,p)=>s+p.amount,0))}</h2></div></div>
  <section className="card table-card"><div className="card-head"><div><h2>Rincian Anggaran</h2><p>Rekap berdasarkan kegiatan</p></div></div><Table plans={plans}/></section></> }

function VerificationPage({ plans, verify }) { const pending = plans.filter(p => p.status !== 'Disetujui'); return <><div className="page-heading"><div><p>RABUN DESK / VERIFIKASI</p><h1>Verifikasi Atasan</h1></div><span className="count-badge">{pending.length} menunggu tinjauan</span></div><section className="card table-card"><div className="card-head"><div><h2>Pengajuan Menunggu Persetujuan</h2><p>Periksa dan tindaklanjuti perencanaan</p></div></div><Table plans={pending} onVerify={verify}/></section></> }

function AdminPage({ plans }) { return <><div className="page-heading"><div><p>RABUN DESK / SISTEM</p><h1>Manajemen Admin</h1></div><button className="primary"><Plus size={18}/>Tambah Pengguna</button></div><div className="admin-grid"><section className="card"><h2>Pengguna Sistem</h2><UserRow initials="AR" name="Arif Rahman" role="Administrator"/><UserRow initials="DW" name="Dewi Wijaya" role="Atasan"/><UserRow initials="BS" name="Budi Santoso" role="Pengelola Anggaran"/></section><section className="card"><h2>Ringkasan Data</h2><div className="data-list"><div><span>Perencanaan</span><b>{plans.length}</b></div><div><span>Lokasi Rumah Dinas</span><b>3</b></div><div><span>Tahun Anggaran</span><b>2026</b></div></div></section></div></> }
function UserRow({ initials,name,role }) { return <div className="user-row"><div className="avatar">{initials}</div><div><b>{name}</b><span>{role}</span></div><button><MoreHorizontal size={18}/></button></div> }

function PlanModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title:'', location:'', category:'Renovasi', amount:'', year:'2026', description:'' })
  const set = (key, value) => setForm(v => ({...v,[key]:value}))
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onSubmit={(e)=>{e.preventDefault(); onSubmit({...form, amount:Number(form.amount)||0})}} onMouseDown={e=>e.stopPropagation()}>
    <div className="modal-head"><div><p>PERENCANAAN BARU</p><h2>Tambah Perencanaan</h2></div><button type="button" onClick={onClose}><X size={20}/></button></div>
    <label>Nama kegiatan<input required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Contoh: Renovasi Rumah Dinas" /></label>
    <div className="form-row"><label>Lokasi rumah dinas<input required value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Pilih lokasi" /></label><label>Kategori<select value={form.category} onChange={e=>set('category',e.target.value)}><option>Renovasi</option><option>Pemeliharaan</option><option>Pengadaan</option></select></label></div>
    <div className="form-row"><label>Nilai anggaran<input required type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0" /></label><label>Tahun anggaran<select value={form.year} onChange={e=>set('year',e.target.value)}><option>2026</option><option>2027</option></select></label></div>
    <label>Keterangan<textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Tambahkan rincian perencanaan..." /></label>
    <div className="modal-actions"><button type="button" className="outline" onClick={onClose}>Batal</button><button className="primary" type="submit">Simpan & Ajukan</button></div>
  </form></div>
}
