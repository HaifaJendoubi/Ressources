'use client';

// src/components/ResourcesClient.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { Resource } from '@/lib/supabase';

// ─── Types locaux ─────────────────────────────────────────────────────────────
type Tab = 'ALL' | 'VIDEO' | 'PDF';
type Level = 'Tous niveaux' | 'Débutant' | 'Intermédiaire' | 'Avancé';

const LEVEL_COLORS: Record<string, string> = {
  'Débutant': '#4CAF50',
  'Intermédiaire': '#FF6B00',
  'Avancé': '#E63000',
};

// ─── Utilitaire : valide l'URL avant navigation ───────────────────────────────
function isValidUrl(url: string): boolean {
  return !!url && !url.includes('TON_ID') && (url.startsWith('http://') || url.startsWith('https://'));
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlayIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const PDFIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const BoltIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const PageIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ─── Thumbnail YouTube ────────────────────────────────────────────────────────
function getYoutubeThumbnail(url: string, stored: string | null): string {
  if (stored) return stored;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  return 'https://placehold.co/640x360/1A1A1A/FF6B00?text=Vidéo';
}

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ r, index }: { r: Resource; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const thumb = getYoutubeThumbnail(r.url, r.thumbnail);

  const valid = isValidUrl(r.url);

  return (
    <a
      href={valid ? r.url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="video-card"
      style={{ '--i': index } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={!valid ? (e) => { e.preventDefault(); alert('⚠️ URL non configurée dans Supabase.'); } : undefined}
      aria-label={`Regarder la vidéo : ${r.title}`}
    >
      {/* Thumbnail */}
      <div className="video-thumb">
        {!imgError ? (
          <img
            src={thumb}
            alt={r.title}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="thumb-fallback">
            <PlayIcon size={40} />
          </div>
        )}
        <div className={`thumb-overlay ${hovered ? 'thumb-overlay--hover' : ''}`}>
          <div className={`play-btn ${hovered ? 'play-btn--active' : ''}`}>
            <PlayIcon />
          </div>
        </div>
        {r.duration && (
          <span className="video-duration">
            <ClockIcon /> {r.duration}
          </span>
        )}
        {r.is_new && <span className="badge-new">NOUVEAU</span>}
      </div>

      {/* Info */}
      <div className="card-body">
        <div className="card-meta">
          {r.subject && <span className="subject-tag">{r.subject}</span>}
          {r.level && (
            <>
              <span className="level-dot" style={{ background: LEVEL_COLORS[r.level] }} />
              <span className="level-label" style={{ color: LEVEL_COLORS[r.level] }}>{r.level}</span>
            </>
          )}
        </div>
        <h3 className="card-title">{r.title}</h3>
        {r.description && <p className="card-desc">{r.description}</p>}
        {r.tags && r.tags.length > 0 && (
          <div className="tags-row">
            {r.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        <div className="card-footer">
          <span className="xp-pill"><BoltIcon /> +{r.xp} XP</span>
          <span className={`watch-cta ${hovered ? 'watch-cta--active' : ''}`}>REGARDER →</span>
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
      href={valid ? r.url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="pdf-card"
      style={{ '--i': index } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={!valid ? (e) => { e.preventDefault(); alert('⚠️ URL non configurée dans Supabase.'); } : undefined}
      aria-label={`Ouvrir le PDF : ${r.title}`}
    >
      {/* Icon bloc */}
      <div className="pdf-icon-col">
        <div className={`pdf-icon-wrap ${hovered ? 'pdf-icon-wrap--hover' : ''}`}>
          <PDFIcon />
        </div>
        <span className="pdf-ext">PDF</span>
      </div>

      {/* Content */}
      <div className="pdf-content">
        <div className="card-meta">
          {r.subject && <span className="subject-tag">{r.subject}</span>}
          {r.level && (
            <>
              <span className="level-dot" style={{ background: LEVEL_COLORS[r.level] }} />
              <span className="level-label" style={{ color: LEVEL_COLORS[r.level] }}>{r.level}</span>
            </>
          )}
          {r.is_new && <span className="badge-new badge-new--sm">NOUVEAU</span>}
        </div>
        <h3 className={`pdf-title ${hovered ? 'pdf-title--hover' : ''}`}>{r.title}</h3>
        {r.description && <p className="card-desc">{r.description}</p>}
        {r.tags && r.tags.length > 0 && (
          <div className="tags-row">
            {r.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="pdf-right">
        {r.pages && (
          <span className="pdf-pages"><PageIcon /> {r.pages}p</span>
        )}
        <span className="xp-pill"><BoltIcon /> +{r.xp} XP</span>
        <div className={`pdf-dl-btn ${hovered ? 'pdf-dl-btn--hover' : ''}`}>
          <DownloadIcon />
        </div>
      </div>
    </a>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, count, color }: {
  icon: React.ReactNode; label: string; count: number; color: string;
}) {
  return (
    <div className="section-header">
      <div className="section-icon" style={{ color, borderColor: color + '44', background: color + '12' }}>
        {icon}
      </div>
      <h2 className="section-title" style={{ color }}>{label}</h2>
      <span className="section-badge">{count}</span>
      <div className="section-line" style={{ background: `linear-gradient(to right, ${color}55, transparent)` }} />
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonVideoCard() {
  return (
    <div className="skeleton-video">
      <div className="sk sk-thumb" />
      <div className="skeleton-body">
        <div className="sk sk-meta" />
        <div className="sk sk-title" />
        <div className="sk sk-desc" />
        <div className="sk sk-desc sk-desc-short" />
      </div>
    </div>
  );
}

function SkeletonPdfCard() {
  return (
    <div className="skeleton-pdf">
      <div className="sk sk-pdf-icon" />
      <div className="skeleton-body">
        <div className="sk sk-meta" />
        <div className="sk sk-title" />
        <div className="sk sk-desc" />
      </div>
      <div className="sk sk-pdf-right" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  initialResources: Resource[];
}

export default function ResourcesClient({ initialResources }: Props) {
  const [tab, setTab] = useState<Tab>('ALL');
  const [level, setLevel] = useState<string>('Tous niveaux');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('Tous');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Sujets dynamiques depuis les données
  const subjects = ['Tous', ...Array.from(new Set(initialResources.map(r => r.subject).filter(Boolean)))];

  // Filtrage côté client
  const filtered = initialResources.filter(r => {
    if (tab !== 'ALL' && r.type !== tab) return false;
    if (subject !== 'Tous' && r.subject !== subject) return false;
    if (level !== 'Tous niveaux' && r.level !== level) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.subject || '').toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const videos = filtered.filter(r => r.type === 'VIDEO');
  const pdfs = filtered.filter(r => r.type === 'PDF');

  const totalXP = initialResources.reduce((s, r) => s + r.xp, 0);
  const videoCount = initialResources.filter(r => r.type === 'VIDEO').length;
  const pdfCount = initialResources.filter(r => r.type === 'PDF').length;

  const handleReset = useCallback(() => {
    setSearch(''); setSubject('Tous'); setLevel('Tous niveaux'); setTab('ALL');
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Black+Han+Sans&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:     #0D0D0D;
          --bg2:    #141414;
          --bg3:    #1C1C1C;
          --orange: #FF6B00;
          --red:    #E63000;
          --gold:   #FFD700;
          --blue:   #00BFFF;
          --white:  #FFFFFF;
          --gray:   #A0A0A0;
        }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg); color: var(--white);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── BG ── */
        .bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,107,0,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,0,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .bg-orb {
          position: absolute; top: -30vh; left: 50%; transform: translateX(-50%);
          width: 900px; height: 600px;
          background: radial-gradient(ellipse, rgba(255,107,0,0.055) 0%, transparent 70%);
          animation: breathe 7s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        /* ── Layout ── */
        .page {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 0 24px 100px;
          opacity: 0; transition: opacity 0.35s ease;
        }
        .page.ready { opacity: 1; }

        /* ── Hero ── */
        .hero { padding: 72px 0 52px; text-align: center; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Black Han Sans', sans-serif;
          font-size: 11px; letter-spacing: 0.22em; color: var(--orange);
          text-transform: uppercase; margin-bottom: 22px;
          padding: 5px 16px;
          border: 1px solid rgba(255,107,0,0.3); border-radius: 100px;
          background: rgba(255,107,0,0.06);
          animation: up 0.5s ease both;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 8.5vw, 116px);
          line-height: 0.9; letter-spacing: -0.01em;
          transform: skewX(-2deg);
          animation: up 0.5s 0.08s ease both;
        }
        .hero-title em {
          font-style: normal; display: block; color: var(--orange);
          text-shadow: 0 0 50px rgba(255,107,0,0.45), 0 0 100px rgba(255,107,0,0.15);
        }
        .hero-sub {
          margin: 18px auto 0; font-size: 16px; color: var(--gray);
          max-width: 460px; line-height: 1.65;
          animation: up 0.5s 0.16s ease both;
        }
        .hero-sub strong { color: var(--white); }

        /* ── Stats ── */
        .stats {
          display: flex; align-items: center; justify-content: center;
          margin: 44px auto 0; width: fit-content;
          background: var(--bg2);
          border: 1px solid rgba(255,107,0,0.12); border-radius: 14px;
          animation: up 0.5s 0.22s ease both;
        }
        .stat { display: flex; flex-direction: column; align-items: center; padding: 18px 36px; }
        .stat + .stat { border-left: 1px solid rgba(255,255,255,0.06); }
        .stat-n {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 38px; color: var(--orange); line-height: 1;
          text-shadow: 0 0 16px rgba(255,107,0,0.35);
        }
        .stat-l {
          font-family: 'Black Han Sans', sans-serif;
          font-size: 10px; letter-spacing: 0.16em;
          color: var(--gray); text-transform: uppercase; margin-top: 3px;
        }

        /* ── Controls ── */
        .controls { margin: 52px 0 0; display: flex; flex-direction: column; gap: 14px; animation: up 0.5s 0.28s ease both; }
        .tabs {
          display: flex; gap: 5px;
          background: var(--bg2); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 5px; width: fit-content;
        }
        .tab {
          font-family: 'Black Han Sans', sans-serif;
          font-size: 13px; letter-spacing: 0.08em;
          padding: 8px 20px; border-radius: 8px; border: none;
          background: transparent; color: var(--gray);
          cursor: pointer; transition: all 0.2s; text-transform: uppercase;
          display: flex; align-items: center; gap: 7px;
        }
        .tab:hover { color: var(--white); }
        .tab.t-all  { background: var(--orange); color: var(--white); box-shadow: 0 0 14px rgba(255,107,0,0.4); }
        .tab.t-vid  { background: var(--red); color: var(--white); box-shadow: 0 0 14px rgba(230,48,0,0.4); }
        .tab.t-pdf  { background: linear-gradient(135deg,#1a6ef5,var(--blue)); color: var(--white); box-shadow: 0 0 14px rgba(0,191,255,0.3); }
        .tab-n { font-size: 10px; background: rgba(255,255,255,0.18); border-radius: 100px; padding: 1px 7px; }

        .filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 380px; }
        .search-ico { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--gray); pointer-events: none; }
        .search-input {
          width: 100%; padding: 11px 13px 11px 40px;
          background: var(--bg2); border: 1px solid rgba(255,107,0,0.18);
          border-radius: 10px; color: var(--white);
          font-family: 'Inter', sans-serif; font-size: 14px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: var(--gray); }
        .search-input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
        .ctrl-select {
          padding: 10px 32px 10px 13px;
          background: var(--bg2); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: var(--white);
          font-family: 'Black Han Sans', sans-serif; font-size: 12px;
          letter-spacing: 0.06em; cursor: pointer; outline: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23A0A0A0' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
          transition: border-color 0.2s;
        }
        .ctrl-select:focus { border-color: var(--orange); }

        /* ── Section ── */
        .section-header { display: flex; align-items: center; gap: 12px; margin: 56px 0 22px; }
        .section-icon {
          width: 38px; height: 38px; border-radius: 9px; border: 1px solid;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 30px; letter-spacing: 0.04em; }
        .section-badge {
          font-family: 'Black Han Sans', sans-serif; font-size: 11px; color: var(--gray);
          background: var(--bg3); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px; padding: 2px 11px; letter-spacing: 0.05em;
        }
        .section-line { flex: 1; height: 1px; }

        /* ── Video Grid ── */
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 18px; }

        .video-card {
          background: var(--bg2); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; overflow: hidden;
          display: flex; flex-direction: column;
          cursor: pointer; outline: none; text-decoration: none; color: var(--white);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s, box-shadow 0.25s;
          animation: cardIn 0.42s calc(var(--i,0) * 0.065s) ease both;
        }
        .video-card:hover, .video-card:focus-visible {
          transform: translateY(-5px);
          border-color: rgba(230,48,0,0.45);
          box-shadow: 0 0 26px rgba(230,48,0,0.12), 0 18px 48px rgba(0,0,0,0.5);
        }

        .video-thumb {
          position: relative; aspect-ratio: 16/9; overflow: hidden; background: var(--bg3);
        }
        .video-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .video-card:hover .video-thumb img, .video-card:focus-visible .video-thumb img { transform: scale(1.04); }

        .thumb-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,107,0,0.3);
          background: linear-gradient(135deg, var(--bg3), #0d0d0d);
        }

        .thumb-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.25s;
        }
        .thumb-overlay--hover { background: rgba(230,48,0,0.18); }

        .play-btn {
          width: 50px; height: 50px; border-radius: 50%;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          border: 2px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center; color: white;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.25s;
        }
        .play-btn--active {
          transform: scale(1.14); background: var(--red); border-color: var(--red);
          box-shadow: 0 0 18px rgba(230,48,0,0.6);
        }

        .video-duration {
          position: absolute; bottom: 8px; right: 10px;
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-family: 'Black Han Sans', sans-serif;
          background: rgba(0,0,0,0.72); backdrop-filter: blur(4px);
          padding: 2px 8px; border-radius: 6px; color: var(--white); letter-spacing: 0.04em;
        }

        .badge-new {
          position: absolute; top: 9px; left: 9px;
          font-family: 'Black Han Sans', sans-serif; font-size: 9px; letter-spacing: 0.12em;
          background: var(--orange); color: white; padding: 3px 8px; border-radius: 4px;
          box-shadow: 0 0 10px rgba(255,107,0,0.55);
          animation: newPulse 2.5s ease infinite;
        }
        .badge-new--sm {
          position: static; display: inline-block;
          font-size: 9px; padding: 2px 7px;
        }
        @keyframes newPulse {
          0%,100% { box-shadow: 0 0 8px rgba(255,107,0,0.55); }
          50% { box-shadow: 0 0 18px rgba(255,107,0,0.85); }
        }

        /* ── Card body ── */
        .card-body { padding: 16px; display: flex; flex-direction: column; gap: 9px; flex: 1; }
        .card-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .subject-tag {
          font-family: 'Black Han Sans', sans-serif; font-size: 10px; letter-spacing: 0.08em;
          padding: 2px 8px; border-radius: 4px;
          background: rgba(255,107,0,0.1); color: var(--orange);
          border: 1px solid rgba(255,107,0,0.2); text-transform: uppercase;
        }
        .level-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .level-label { font-family: 'Black Han Sans', sans-serif; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; }
        .card-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; line-height: 1.1; }
        .card-desc { font-size: 13px; line-height: 1.6; color: var(--gray); }
        .tags-row { display: flex; flex-wrap: wrap; gap: 5px; }
        .tag { font-size: 10px; font-family: 'Black Han Sans', sans-serif; letter-spacing: 0.04em; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.04); color: var(--gray); border: 1px solid rgba(255,255,255,0.07); text-transform: uppercase; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 11px; border-top: 1px solid rgba(255,255,255,0.06); }
        .xp-pill { display: flex; align-items: center; gap: 4px; font-family: 'Black Han Sans', sans-serif; font-size: 12px; letter-spacing: 0.05em; color: var(--gold); }
        .watch-cta { font-family: 'Black Han Sans', sans-serif; font-size: 11px; letter-spacing: 0.1em; color: var(--gray); transition: color 0.2s, letter-spacing 0.2s; }
        .watch-cta--active { color: var(--red); letter-spacing: 0.16em; }

        /* ── PDF List ── */
        .pdf-list { display: flex; flex-direction: column; gap: 10px; }

        .pdf-card {
          display: flex; align-items: center; gap: 18px;
          background: var(--bg2); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 13px; padding: 18px 22px;
          cursor: pointer; outline: none; position: relative; overflow: hidden;
          text-decoration: none; color: var(--white);
          transition: transform 0.22s ease, border-color 0.22s, box-shadow 0.22s;
          animation: cardIn 0.42s calc(var(--i,0) * 0.055s) ease both;
        }
        .pdf-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, #1a6ef5, var(--blue));
          border-radius: 13px 0 0 13px; opacity: 0.5; transition: opacity 0.22s, width 0.22s;
        }
        .pdf-card:hover::before, .pdf-card:focus-visible::before { opacity: 1; width: 4px; }
        .pdf-card:hover, .pdf-card:focus-visible {
          transform: translateX(5px);
          border-color: rgba(0,191,255,0.3);
          box-shadow: 0 0 22px rgba(0,191,255,0.07), 0 8px 28px rgba(0,0,0,0.4);
        }

        .pdf-icon-col { display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--blue); flex-shrink: 0; width: 42px; }
        .pdf-icon-wrap { transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .pdf-icon-wrap--hover { transform: scale(1.15); }
        .pdf-ext { font-family: 'Black Han Sans', sans-serif; font-size: 9px; letter-spacing: 0.12em; color: var(--blue); }

        .pdf-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px; }
        .pdf-title { font-family: 'Bebas Neue', sans-serif; font-size: 19px; letter-spacing: 0.02em; line-height: 1.1; transition: color 0.2s; }
        .pdf-title--hover { color: var(--blue); }

        .pdf-right { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; flex-shrink: 0; }
        .pdf-pages { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--gray); font-family: 'Black Han Sans', sans-serif; letter-spacing: 0.04em; }
        .pdf-dl-btn {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(0,191,255,0.07); border: 1px solid rgba(0,191,255,0.2);
          display: flex; align-items: center; justify-content: center; color: var(--blue);
          transition: all 0.2s;
        }
        .pdf-dl-btn--hover { background: var(--blue); color: var(--bg); border-color: var(--blue); }

        /* ── Empty ── */
        .empty { text-align: center; padding: 80px 20px; }
        .empty-emoji { font-size: 44px; margin-bottom: 14px; }
        .empty-title { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: var(--gray); }
        .empty-sub { color: var(--gray); font-size: 15px; margin-top: 8px; }
        .empty-btn {
          margin-top: 20px; font-family: 'Black Han Sans', sans-serif;
          font-size: 13px; letter-spacing: 0.08em;
          padding: 10px 24px; border-radius: 8px;
          background: var(--orange); color: white; border: none; cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .empty-btn:hover { box-shadow: 0 0 18px rgba(255,107,0,0.5); }

        /* ── Skeletons ── */
        .sk { background: linear-gradient(90deg, var(--bg3) 25%, #242424 50%, var(--bg3) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        @keyframes shimmer { to { background-position: -200% 0; } }
        .skeleton-video { background: var(--bg2); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; overflow: hidden; }
        .sk-thumb { height: 180px; border-radius: 0; }
        .skeleton-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .sk-meta { height: 16px; width: 40%; }
        .sk-title { height: 22px; width: 85%; }
        .sk-desc { height: 14px; width: 100%; }
        .sk-desc-short { width: 65%; }
        .skeleton-pdf { display: flex; align-items: center; gap: 18px; background: var(--bg2); border: 1px solid rgba(255,255,255,0.05); border-radius: 13px; padding: 18px 22px; }
        .sk-pdf-icon { width: 42px; height: 56px; flex-shrink: 0; border-radius: 8px; }
        .sk-pdf-right { width: 60px; height: 56px; flex-shrink: 0; border-radius: 8px; }

        /* ── Animations ── */
        @keyframes up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .page { padding: 0 16px 72px; }
          .hero { padding: 48px 0 36px; }
          .hero-title { transform: none; }
          .stat { padding: 14px 20px; }
          .stat-n { font-size: 30px; }
          .video-grid { grid-template-columns: 1fr; }
          .pdf-card { flex-direction: column; align-items: flex-start; gap: 12px; }
          .pdf-right { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
          .tabs { width: 100%; }
          .tab { flex: 1; justify-content: center; font-size: 11px; padding: 8px 12px; }
          .controls-top { flex-direction: column; }
          .search-wrap { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .stats { flex-direction: column; }
          .stat + .stat { border-left: none; border-top: 1px solid rgba(255,255,255,0.06); }
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: rgba(255,107,0,0.35); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--orange); }
      `}</style>

      {/* BG */}
      <div className="bg-layer">
        <div className="bg-grid" />
        <div className="bg-orb" />
      </div>

      <div className={`page ${mounted ? 'ready' : ''}`}>

        {/* ── Hero ── */}
        <header className="hero">
          <div className="hero-eyebrow">
            <StarIcon /> PLATEFORME ÉDUCATIVE <StarIcon />
          </div>
          <h1 className="hero-title">
            TOUTES LES
            <em>RESSOURCES</em>
          </h1>
          <p className="hero-sub">
            Vidéos et PDFs pour <strong>maîtriser Next.js</strong> à ton rythme.
            Choisis ton niveau, lance-toi.
          </p>

          {/* Stats */}
          <div className="stats">
            <div className="stat">
              <span className="stat-n">{videoCount}</span>
              <span className="stat-l">Vidéos</span>
            </div>
            <div className="stat">
              <span className="stat-n">{pdfCount}</span>
              <span className="stat-l">PDFs</span>
            </div>
            <div className="stat">
              <span className="stat-n">{totalXP.toLocaleString()}</span>
              <span className="stat-l">XP Total</span>
            </div>
          </div>
        </header>

        {/* ── Controls ── */}
        <div className="controls">
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${tab === 'ALL' ? 't-all' : ''}`} onClick={() => setTab('ALL')}>
              TOUT <span className="tab-n">{initialResources.length}</span>
            </button>
            <button className={`tab ${tab === 'VIDEO' ? 't-vid' : ''}`} onClick={() => setTab('VIDEO')}>
              <PlayIcon size={14} /> VIDÉOS <span className="tab-n">{videoCount}</span>
            </button>
            <button className={`tab ${tab === 'PDF' ? 't-pdf' : ''}`} onClick={() => setTab('PDF')}>
              <PDFIcon size={14} /> PDF <span className="tab-n">{pdfCount}</span>
            </button>
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="search-wrap">
              <span className="search-ico"><SearchIcon /></span>
              <input
                className="search-input"
                type="text"
                placeholder="Recherche..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="ctrl-select" value={subject} onChange={e => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
            </select>
            <select className="ctrl-select" value={level} onChange={e => setLevel(e.target.value)}>
              {(['Tous niveaux', 'Débutant', 'Intermédiaire', 'Avancé'] as const).map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Vide ── */}
        {filtered.length === 0 && (
          <div className="empty">
            <div className="empty-emoji">⚡</div>
            <div className="empty-title">AUCUNE RESSOURCE</div>
            <p className="empty-sub">Essaie d'autres filtres ou un autre mot-clé.</p>
            <button className="empty-btn" onClick={handleReset}>RÉINITIALISER</button>
          </div>
        )}

        {/* ── Section Vidéos ── */}
        {(tab === 'ALL' || tab === 'VIDEO') && videos.length > 0 && (
          <section aria-label="Vidéos">
            <SectionHeader icon={<PlayIcon />} label="VIDÉOS" count={videos.length} color="#E63000" />
            <div className="video-grid">
              {videos.map((r, i) => <VideoCard key={r.id} r={r} index={i} />)}
            </div>
          </section>
        )}

        {/* ── Section PDFs ── */}
        {(tab === 'ALL' || tab === 'PDF') && pdfs.length > 0 && (
          <section aria-label="PDFs">
            <SectionHeader icon={<PDFIcon />} label="PDFs" count={pdfs.length} color="#00BFFF" />
            <div className="pdf-list">
              {pdfs.map((r, i) => <PdfCard key={r.id} r={r} index={i} />)}
            </div>
          </section>
        )}

      </div>
    </>
  );
}