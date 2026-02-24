'use client';

// src/app/page.tsx
import React, { useState, useEffect, useCallback } from 'react';

// ─── Supabase — import sécurisé ───────────────────────────────────────────────
// Si les variables .env.local sont absentes, on affiche un message clair
let supabaseClient: ReturnType<typeof import('@supabase/supabase-js').createClient> | null = null;

if (
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  const { createClient } = require('@supabase/supabase-js');
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: 'VIDEO' | 'PDF';
  url: string;
  subject: string | null;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | null;
  xp: number;
  duration: string | null;
  pages: number | null;
  thumbnail: string | null;
  is_new: boolean;
  tags: string[] | null;
}

type Tab = 'ALL' | 'VIDEO' | 'PDF';

const LEVEL_COLORS: Record<string, string> = {
  Débutant: '#4CAF50',
  Intermédiaire: '#FF6B00',
  Avancé: '#E63000',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isValidUrl(url: string): boolean {
  return !!url && !url.includes('TON_ID') && url.startsWith('http');
}

function getThumb(url: string, stored: string | null): string {
  if (stored) return stored;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` : '';
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlayIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const PdfIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const BoltIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const PageIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ r, index }: { r: Resource; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const thumb = getThumb(r.url, r.thumbnail);
  const valid = isValidUrl(r.url);

  return (
    <a
      href={valid ? r.url : '#'}
      target={valid ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="video-card"
      style={{ '--i': index } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={
        !valid
          ? (e) => {
              e.preventDefault();
              alert('⚠️ URL non configurée. Mets le vrai lien dans Supabase.');
            }
          : undefined
      }
    >
      <div className="video-thumb">
        {thumb && !imgError ? (
          <img src={thumb} alt={r.title} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="thumb-fallback">
            <PlayIcon size={40} />
          </div>
        )}
        <div className={`thumb-overlay ${hovered ? 'hov' : ''}`}>
          <div className={`play-btn ${hovered ? 'play-active' : ''}`}>
            <PlayIcon size={22} />
          </div>
        </div>
        {r.duration && (
          <span className="duration">
            <ClockIcon /> {r.duration}
          </span>
        )}
        {r.is_new && <span className="badge-new">NOUVEAU</span>}
      </div>

      <div className="card-body">
        <div className="meta-row">
          {r.subject && <span className="subject-tag">{r.subject}</span>}
          {r.level && (
            <>
              <span className="lvl-dot" style={{ background: LEVEL_COLORS[r.level] }} />
              <span className="lvl-label" style={{ color: LEVEL_COLORS[r.level] }}>
                {r.level}
              </span>
            </>
          )}
        </div>
        <h3 className="card-title">{r.title}</h3>
        {r.description && <p className="card-desc">{r.description}</p>}
        {r.tags && r.tags.length > 0 && (
          <div className="tags-row">
            {r.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="card-footer">
          <span className="xp-pill">
            <BoltIcon /> +{r.xp} XP
          </span>
          <span
            className="cta"
            style={{
              color: hovered ? '#E63000' : '#A0A0A0',
              letterSpacing: hovered ? '0.16em' : '0.1em',
            }}
          >
            REGARDER →
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── PDF Card ─────────────────────────────────────────────────────────────────
function PdfCard({ r, index }: { r: Resource; index: number }) {
  const [hovered, setHovered] = useState(false);
  const valid = isValidUrl(r.url);

  return (
    <a
      href={valid ? r.url : '#'}
      target={valid ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="pdf-card"
      style={{ '--i': index } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={
        !valid
          ? (e) => {
              e.preventDefault();
              alert('⚠️ URL non configurée. Mets le vrai lien dans Supabase.');
            }
          : undefined
      }
    >
      <div className="pdf-icon-col">
        <div
          style={{
            color: '#00BFFF',
            transform: hovered ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.22s',
          }}
        >
          <PdfIcon size={24} />
        </div>
        <span className="pdf-ext">PDF</span>
      </div>

      <div className="pdf-content">
        <div className="meta-row">
          {r.subject && <span className="subject-tag">{r.subject}</span>}
          {r.level && (
            <>
              <span className="lvl-dot" style={{ background: LEVEL_COLORS[r.level] }} />
              <span className="lvl-label" style={{ color: LEVEL_COLORS[r.level] }}>
                {r.level}
              </span>
            </>
          )}
          {r.is_new && (
            <span
              className="badge-new"
              style={{ position: 'static', display: 'inline-block', fontSize: '9px', padding: '2px 7px' }}
            >
              NOUVEAU
            </span>
          )}
        </div>
        <h3 className="pdf-title" style={{ color: hovered ? '#00BFFF' : '#FFFFFF' }}>
          {r.title}
        </h3>
        {r.description && <p className="card-desc">{r.description}</p>}
        {r.tags && r.tags.length > 0 && (
          <div className="tags-row">
            {r.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pdf-right">
        {r.pages && (
          <span className="pdf-pages">
            <PageIcon /> {r.pages}p
          </span>
        )}
        <span className="xp-pill">
          <BoltIcon /> +{r.xp} XP
        </span>
        <div
          className="dl-btn"
          style={{
            background: hovered ? '#00BFFF' : 'rgba(0,191,255,0.07)',
            color: hovered ? '#0D0D0D' : '#00BFFF',
            border: '1px solid rgba(0,191,255,0.2)',
          }}
        >
          <DownloadIcon />
        </div>
      </div>
    </a>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon, label, count, color,
}: {
  icon: React.ReactNode; label: string; count: number; color: string;
}) {
  return (
    <div className="sec-header">
      <div
        className="sec-icon"
        style={{ color, borderColor: color + '44', background: color + '12' }}
      >
        {icon}
      </div>
      <h2 className="sec-title" style={{ color }}>
        {label}
      </h2>
      <span className="sec-badge">{count}</span>
      <div
        className="sec-line"
        style={{ background: `linear-gradient(to right, ${color}55, transparent)` }}
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <>
      <div className="video-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="sk-video">
            <div className="sk sk-thumb" />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="sk" style={{ height: 14, width: '40%' }} />
              <div className="sk" style={{ height: 20, width: '85%' }} />
              <div className="sk" style={{ height: 12, width: '100%' }} />
              <div className="sk" style={{ height: 12, width: '65%' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 40 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="sk-pdf">
            <div className="sk" style={{ width: 42, height: 56, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="sk" style={{ height: 14, width: '35%' }} />
              <div className="sk" style={{ height: 20, width: '70%' }} />
              <div className="sk" style={{ height: 12, width: '90%' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Env Error Screen ─────────────────────────────────────────────────────────
function EnvError() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0D', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: 40,
    }}>
      <div style={{
        background: '#1A1A1A', border: '1px solid #E63000',
        borderRadius: 16, padding: 40, maxWidth: 560, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontFamily: 'sans-serif', color: '#E63000', fontSize: 22, marginBottom: 12 }}>
          Variables Supabase manquantes
        </h1>
        <p style={{ color: '#A0A0A0', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          Crée ou complète le fichier <code style={{ color: '#FF6B00' }}>.env.local</code> à la racine du projet :
        </p>
        <pre style={{
          background: '#0D0D0D', color: '#FFD700', padding: '16px 20px',
          borderRadius: 8, fontSize: 13, textAlign: 'left', lineHeight: 1.8,
          border: '1px solid rgba(255,107,0,0.2)',
        }}>
{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...`}
        </pre>
        <p style={{ color: '#A0A0A0', fontSize: 13, marginTop: 20 }}>
          Trouve ces valeurs sur{' '}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#FF6B00' }}>
            supabase.com
          </a>{' '}
          → ton projet → <strong style={{ color: '#fff' }}>Settings → API</strong>
        </p>
        <p style={{ color: '#666', fontSize: 12, marginTop: 16 }}>
          Puis relance : <code style={{ color: '#FF6B00' }}>npm run dev</code>
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [envOk, setEnvOk] = useState(true);
  const [tab, setTab] = useState<Tab>('ALL');
  const [subject, setSubject] = useState('Tous');
  const [level, setLevel] = useState('Tous niveaux');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Vérifie les variables d'env côté client
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setEnvOk(false);
      setLoading(false);
      return;
    }

    if (!supabaseClient) {
      setEnvOk(false);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const { data, error } = await supabaseClient!
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResources((data as Resource[]) || []);
      } catch (err) {
        console.error('Erreur Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ⚠️ Tous les hooks AVANT tout return conditionnel (Règle des Hooks React)
  const subjects = [
    'Tous',
    ...Array.from(new Set(resources.map((r) => r.subject).filter(Boolean) as string[])),
  ];

  const filtered = resources.filter((r) => {
    if (tab !== 'ALL' && r.type !== tab) return false;
    if (subject !== 'Tous' && r.subject !== subject) return false;
    if (level !== 'Tous niveaux' && r.level !== level) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.subject || '').toLowerCase().includes(q) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const videos = filtered.filter((r) => r.type === 'VIDEO');
  const pdfs = filtered.filter((r) => r.type === 'PDF');
  const totalXP = resources.reduce((s, r) => s + r.xp, 0);

  const reset = useCallback(() => {
    setSearch('');
    setSubject('Tous');
    setLevel('Tous niveaux');
    setTab('ALL');
  }, []);

  // Return conditionnel APRES tous les hooks
  if (!envOk) return <EnvError />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Black+Han+Sans&family=Inter:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#0D0D0D;--bg2:#141414;--bg3:#1C1C1C;--orange:#FF6B00;--red:#E63000;--gold:#FFD700;--blue:#00BFFF;--white:#FFFFFF;--gray:#A0A0A0;}
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--white);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}

        .bg-layer{position:fixed;inset:0;pointer-events:none;z-index:0;}
        .bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,107,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.025) 1px,transparent 1px);background-size:56px 56px;}
        .bg-orb{position:absolute;top:-30vh;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(ellipse,rgba(255,107,0,.055) 0%,transparent 70%);animation:breathe 7s ease-in-out infinite;}
        @keyframes breathe{0%,100%{opacity:.8;}50%{opacity:1;}}

        .page{position:relative;z-index:1;max-width:1280px;margin:0 auto;padding:0 24px 100px;opacity:0;transition:opacity .35s ease;}
        .page.ready{opacity:1;}

        .hero{padding:72px 0 52px;text-align:center;}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:'Black Han Sans',sans-serif;font-size:11px;letter-spacing:.22em;color:var(--orange);text-transform:uppercase;margin-bottom:22px;padding:5px 16px;border:1px solid rgba(255,107,0,.3);border-radius:100px;background:rgba(255,107,0,.06);animation:up .5s ease both;}
        .hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(56px,8.5vw,116px);line-height:.9;letter-spacing:-.01em;transform:skewX(-2deg);animation:up .5s .08s ease both;}
        .hero-title em{font-style:normal;display:block;color:var(--orange);text-shadow:0 0 50px rgba(255,107,0,.45),0 0 100px rgba(255,107,0,.15);}
        .hero-sub{margin:18px auto 0;font-size:16px;color:var(--gray);max-width:460px;line-height:1.65;animation:up .5s .16s ease both;}
        .hero-sub strong{color:var(--white);}

        .stats{display:flex;align-items:center;justify-content:center;margin:44px auto 0;width:fit-content;background:var(--bg2);border:1px solid rgba(255,107,0,.12);border-radius:14px;animation:up .5s .22s ease both;}
        .stat{display:flex;flex-direction:column;align-items:center;padding:18px 36px;}
        .stat+.stat{border-left:1px solid rgba(255,255,255,.06);}
        .stat-n{font-family:'Bebas Neue',sans-serif;font-size:38px;color:var(--orange);line-height:1;text-shadow:0 0 16px rgba(255,107,0,.35);}
        .stat-l{font-family:'Black Han Sans',sans-serif;font-size:10px;letter-spacing:.16em;color:var(--gray);text-transform:uppercase;margin-top:3px;}

        .controls{margin:52px 0 0;display:flex;flex-direction:column;gap:14px;animation:up .5s .28s ease both;}
        .tabs{display:flex;gap:5px;background:var(--bg2);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:5px;width:fit-content;}
        .tab{font-family:'Black Han Sans',sans-serif;font-size:13px;letter-spacing:.08em;padding:8px 20px;border-radius:8px;border:none;background:transparent;color:var(--gray);cursor:pointer;transition:all .2s;text-transform:uppercase;display:flex;align-items:center;gap:7px;}
        .tab:hover{color:var(--white);}
        .tab.t-all{background:var(--orange);color:var(--white);box-shadow:0 0 14px rgba(255,107,0,.4);}
        .tab.t-vid{background:var(--red);color:var(--white);box-shadow:0 0 14px rgba(230,48,0,.4);}
        .tab.t-pdf{background:linear-gradient(135deg,#1a6ef5,var(--blue));color:var(--white);box-shadow:0 0 14px rgba(0,191,255,.3);}
        .tab-n{font-size:10px;background:rgba(255,255,255,.18);border-radius:100px;padding:1px 7px;}
        .filters{display:flex;gap:10px;flex-wrap:wrap;}
        .search-wrap{position:relative;flex:1;min-width:200px;max-width:380px;}
        .search-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--gray);pointer-events:none;}
        .search-input{width:100%;padding:11px 13px 11px 40px;background:var(--bg2);border:1px solid rgba(255,107,0,.18);border-radius:10px;color:var(--white);font-family:'Inter',sans-serif;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;}
        .search-input::placeholder{color:var(--gray);}
        .search-input:focus{border-color:var(--orange);box-shadow:0 0 0 3px rgba(255,107,0,.1);}
        .ctrl-sel{padding:10px 32px 10px 13px;background:var(--bg2);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:var(--white);font-family:'Black Han Sans',sans-serif;font-size:12px;letter-spacing:.06em;cursor:pointer;outline:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23A0A0A0' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;transition:border-color .2s;}
        .ctrl-sel:focus{border-color:var(--orange);}

        .sec-header{display:flex;align-items:center;gap:12px;margin:56px 0 22px;}
        .sec-icon{width:38px;height:38px;border-radius:9px;border:1px solid;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .sec-title{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:.04em;}
        .sec-badge{font-family:'Black Han Sans',sans-serif;font-size:11px;color:var(--gray);background:var(--bg3);border:1px solid rgba(255,255,255,.08);border-radius:100px;padding:2px 11px;letter-spacing:.05em;}
        .sec-line{flex:1;height:1px;}

        .video-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px;}
        .video-card{background:var(--bg2);border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:var(--white);transition:transform .3s cubic-bezier(.34,1.56,.64,1),border-color .25s,box-shadow .25s;animation:cardIn .42s calc(var(--i,0)*.065s) ease both;}
        .video-card:hover{transform:translateY(-5px);border-color:rgba(230,48,0,.45);box-shadow:0 0 26px rgba(230,48,0,.12),0 18px 48px rgba(0,0,0,.5);}
        .video-thumb{position:relative;aspect-ratio:16/9;overflow:hidden;background:var(--bg3);}
        .video-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease;}
        .video-card:hover .video-thumb img{transform:scale(1.04);}
        .thumb-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,107,0,.3);background:linear-gradient(135deg,var(--bg3),#0d0d0d);}
        .thumb-overlay{position:absolute;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;transition:background .25s;}
        .thumb-overlay.hov{background:rgba(230,48,0,.18);}
        .play-btn{width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.12);backdrop-filter:blur(8px);border:2px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;color:white;transition:transform .25s cubic-bezier(.34,1.56,.64,1),background .25s;}
        .play-active{transform:scale(1.14);background:var(--red);border-color:var(--red);box-shadow:0 0 18px rgba(230,48,0,.6);}
        .duration{position:absolute;bottom:8px;right:10px;display:flex;align-items:center;gap:4px;font-size:11px;font-family:'Black Han Sans',sans-serif;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);padding:2px 8px;border-radius:6px;color:var(--white);letter-spacing:.04em;}
        .badge-new{position:absolute;top:9px;left:9px;font-family:'Black Han Sans',sans-serif;font-size:9px;letter-spacing:.12em;background:var(--orange);color:white;padding:3px 8px;border-radius:4px;box-shadow:0 0 10px rgba(255,107,0,.55);animation:newPulse 2.5s ease infinite;}
        @keyframes newPulse{0%,100%{box-shadow:0 0 8px rgba(255,107,0,.55);}50%{box-shadow:0 0 18px rgba(255,107,0,.85);}}

        .card-body{padding:16px;display:flex;flex-direction:column;gap:9px;flex:1;}
        .meta-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
        .subject-tag{font-family:'Black Han Sans',sans-serif;font-size:10px;letter-spacing:.08em;padding:2px 8px;border-radius:4px;background:rgba(255,107,0,.1);color:var(--orange);border:1px solid rgba(255,107,0,.2);text-transform:uppercase;}
        .lvl-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .lvl-label{font-family:'Black Han Sans',sans-serif;font-size:10px;letter-spacing:.05em;text-transform:uppercase;}
        .card-title{font-family:'Bebas Neue',sans-serif;font-size:20px;line-height:1.1;}
        .card-desc{font-size:13px;line-height:1.6;color:var(--gray);}
        .tags-row{display:flex;flex-wrap:wrap;gap:5px;}
        .tag{font-size:10px;font-family:'Black Han Sans',sans-serif;letter-spacing:.04em;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.04);color:var(--gray);border:1px solid rgba(255,255,255,.07);text-transform:uppercase;}
        .card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:11px;border-top:1px solid rgba(255,255,255,.06);}
        .xp-pill{display:flex;align-items:center;gap:4px;font-family:'Black Han Sans',sans-serif;font-size:12px;letter-spacing:.05em;color:var(--gold);}
        .cta{font-family:'Black Han Sans',sans-serif;font-size:11px;transition:color .2s,letter-spacing .2s;}

        .pdf-list{display:flex;flex-direction:column;gap:10px;}
        .pdf-card{display:flex;align-items:center;gap:18px;background:var(--bg2);border:1px solid rgba(255,255,255,.06);border-radius:13px;padding:18px 22px;text-decoration:none;color:var(--white);position:relative;overflow:hidden;transition:transform .22s ease,border-color .22s,box-shadow .22s;animation:cardIn .42s calc(var(--i,0)*.055s) ease both;}
        .pdf-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#1a6ef5,var(--blue));border-radius:13px 0 0 13px;opacity:.5;transition:opacity .22s,width .22s;}
        .pdf-card:hover::before{opacity:1;width:4px;}
        .pdf-card:hover{transform:translateX(5px);border-color:rgba(0,191,255,.3);box-shadow:0 0 22px rgba(0,191,255,.07),0 8px 28px rgba(0,0,0,.4);}
        .pdf-icon-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;width:42px;}
        .pdf-ext{font-family:'Black Han Sans',sans-serif;font-size:9px;letter-spacing:.12em;color:var(--blue);}
        .pdf-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;}
        .pdf-title{font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:.02em;line-height:1.1;transition:color .2s;}
        .pdf-right{display:flex;flex-direction:column;align-items:flex-end;gap:7px;flex-shrink:0;}
        .pdf-pages{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--gray);font-family:'Black Han Sans',sans-serif;letter-spacing:.04em;}
        .dl-btn{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:all .2s;}

        .empty{text-align:center;padding:80px 20px;}
        .empty-emoji{font-size:44px;margin-bottom:14px;}
        .empty-title{font-family:'Bebas Neue',sans-serif;font-size:40px;color:var(--gray);}
        .empty-sub{color:var(--gray);font-size:15px;margin-top:8px;}
        .empty-btn{margin-top:20px;font-family:'Black Han Sans',sans-serif;font-size:13px;letter-spacing:.08em;padding:10px 24px;border-radius:8px;background:var(--orange);color:white;border:none;cursor:pointer;transition:box-shadow .2s;}
        .empty-btn:hover{box-shadow:0 0 18px rgba(255,107,0,.5);}

        .sk{background:linear-gradient(90deg,var(--bg3) 25%,#242424 50%,var(--bg3) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
        @keyframes shimmer{to{background-position:-200% 0;}}
        .sk-video{background:var(--bg2);border:1px solid rgba(255,255,255,.05);border-radius:14px;overflow:hidden;}
        .sk-thumb{height:170px;border-radius:0;}
        .sk-pdf{display:flex;align-items:center;gap:18px;background:var(--bg2);border:1px solid rgba(255,255,255,.05);border-radius:13px;padding:18px 22px;}

        @keyframes up{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes cardIn{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}

        @media(max-width:768px){
          .page{padding:0 16px 72px;}.hero{padding:48px 0 36px;}.hero-title{transform:none;}
          .stat{padding:14px 20px;}.stat-n{font-size:30px;}
          .video-grid{grid-template-columns:1fr;}
          .pdf-card{flex-direction:column;align-items:flex-start;gap:12px;}
          .pdf-right{flex-direction:row;align-items:center;width:100%;justify-content:space-between;}
          .tabs{width:100%;}.tab{flex:1;justify-content:center;font-size:11px;padding:8px 10px;}
          .filters{flex-direction:column;}.search-wrap{max-width:100%;}
        }
        @media(max-width:480px){
          .stats{flex-direction:column;}.stat+.stat{border-left:none;border-top:1px solid rgba(255,255,255,.06);}
        }
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:var(--bg);}::-webkit-scrollbar-thumb{background:rgba(255,107,0,.35);border-radius:3px;}::-webkit-scrollbar-thumb:hover{background:var(--orange);}
      `}</style>

      <div className="bg-layer">
        <div className="bg-grid" />
        <div className="bg-orb" />
      </div>

      <div className={`page ${mounted ? 'ready' : ''}`}>

        {/* Hero */}
        <header className="hero">
          <div className="eyebrow"><StarIcon /> PLATEFORME ÉDUCATIVE <StarIcon /></div>
          <h1 className="hero-title">TOUTES LES<em>RESSOURCES</em></h1>
          <p className="hero-sub">
            Vidéos et PDFs pour <strong>maîtriser Next.js</strong> à ton rythme. Lance-toi.
          </p>
          <div className="stats">
            <div className="stat">
              <span className="stat-n">{resources.filter((r) => r.type === 'VIDEO').length}</span>
              <span className="stat-l">Vidéos</span>
            </div>
            <div className="stat">
              <span className="stat-n">{resources.filter((r) => r.type === 'PDF').length}</span>
              <span className="stat-l">PDFs</span>
            </div>
            <div className="stat">
              <span className="stat-n">{totalXP.toLocaleString()}</span>
              <span className="stat-l">XP Total</span>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="controls">
          <div className="tabs">
            <button className={`tab ${tab === 'ALL' ? 't-all' : ''}`} onClick={() => setTab('ALL')}>
              TOUT <span className="tab-n">{resources.length}</span>
            </button>
            <button className={`tab ${tab === 'VIDEO' ? 't-vid' : ''}`} onClick={() => setTab('VIDEO')}>
              <PlayIcon size={14} /> VIDÉOS{' '}
              <span className="tab-n">{resources.filter((r) => r.type === 'VIDEO').length}</span>
            </button>
            <button className={`tab ${tab === 'PDF' ? 't-pdf' : ''}`} onClick={() => setTab('PDF')}>
              <PdfIcon size={14} /> PDF{' '}
              <span className="tab-n">{resources.filter((r) => r.type === 'PDF').length}</span>
            </button>
          </div>
          <div className="filters">
            <div className="search-wrap">
              <span className="search-ico"><SearchIcon /></span>
              <input
                className="search-input"
                type="text"
                placeholder="Recherche..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="ctrl-sel" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="ctrl-sel" value={level} onChange={(e) => setLevel(e.target.value)}>
              {['Tous niveaux', 'Débutant', 'Intermédiaire', 'Avancé'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ marginTop: 56 }}>
            <Skeleton />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="empty">
            <div className="empty-emoji">⚡</div>
            <div className="empty-title">AUCUNE RESSOURCE</div>
            <p className="empty-sub">Essaie d'autres filtres ou un autre mot-clé.</p>
            <button className="empty-btn" onClick={reset}>RÉINITIALISER</button>
          </div>
        )}

        {/* Section Vidéos */}
        {!loading && (tab === 'ALL' || tab === 'VIDEO') && videos.length > 0 && (
          <section>
            <SectionHeader icon={<PlayIcon />} label="VIDÉOS" count={videos.length} color="#E63000" />
            <div className="video-grid">
              {videos.map((r, i) => <VideoCard key={r.id} r={r} index={i} />)}
            </div>
          </section>
        )}

        {/* Section PDFs */}
        {!loading && (tab === 'ALL' || tab === 'PDF') && pdfs.length > 0 && (
          <section>
            <SectionHeader icon={<PdfIcon />} label="PDFs" count={pdfs.length} color="#00BFFF" />
            <div className="pdf-list">
              {pdfs.map((r, i) => <PdfCard key={r.id} r={r} index={i} />)}
            </div>
          </section>
        )}

      </div>
    </>
  );
}