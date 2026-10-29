import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LayoutGrid,
  MessageSquare,
  ExternalLink,
  X,
  MoveRight,
  Sparkles,
  Database,
  ZoomIn,
} from 'lucide-react';
import {
  PORTFOLIO_STATIC,
  BOOK_PAGES,
  pageToSpread,
  spreadToPrimaryPage,
  getVisiblePagesForSpread,
} from './data/portfolioData';
import { fetchPortfolioData } from './lib/api';
import { detectWebGLSupport } from './utils/webgl';
import LoadingScreen from './components/LoadingScreen';
import WebGLErrorBoundary from './components/WebGLErrorBoundary';
import Book3DScene from './components/Book3DScene';
import FallbackBookReader from './components/FallbackBookReader';
import ContactPanel from './components/ContactPanel';

export default function App() {
  const [portfolioData, setPortfolioData] = useState(PORTFOLIO_STATIC);
  const [apiConnected, setApiConnected] = useState(false);

  const [webglSupported, setWebglSupported] = useState(() => detectWebGLSupport());
  const [viewMode, setViewMode] = useState(() => (detectWebGLSupport() ? '3d' : 'reader'));

  // Loading orchestration
  const [sceneReady, setSceneReady] = useState(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Book navigation state (1..10 logical pages & 0..5 physical spreads)
  const [activePage, setActivePage] = useState(1);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [mobileFocusMode, setMobileFocusMode] = useState('spread'); // 'spread' | 'single'

  // Interactive Contact Drawer & Drag Hint feedback
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [contactAutoFocus, setContactAutoFocus] = useState(null);
  const [nudgeRightPulse, setNudgeRightPulse] = useState(false);

  // Minimum smooth entrance timer so loader never flashes abruptly or hangs
  useEffect(() => {
    const t1 = setTimeout(() => setMinDelayPassed(true), 650);
    const fallbackReady = setTimeout(() => setSceneReady(true), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(fallbackReady);
    };
  }, []);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleLoaderExited = useCallback(() => setShowLoader(false), []);

  const loaderVisible = !(minDelayPassed && (sceneReady || viewMode === 'reader' || !webglSupported));

  // Hydrate canonical projects from FastAPI + PostgreSQL when backend is reachable
  useEffect(() => {
    let cancelled = false;
    fetchPortfolioData()
      .then((remote) => {
        if (cancelled || !remote) return;
        setApiConnected(true);
        if (Array.isArray(remote.projects) && remote.projects.length > 0) {
          // Enforce strict rule: only MoneyFlow and SHERDOOR AKFA
          const allowed = remote.projects.filter(
            (p) =>
              p.slug === 'moneyflow' ||
              p.slug === 'sherdoor-akfa' ||
              p.title === 'MoneyFlow' ||
              p.title === 'SHERDOOR AKFA'
          );
          if (allowed.length > 0) {
            setPortfolioData((prev) => ({
              ...prev,
              projects: allowed,
            }));
          }
        }
      })
      .catch(() => {
        // Standalone mode (e.g. static Netlify preview before backend URL is set) — zero console noise
        if (!cancelled) setApiConnected(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync navigation helpers
  const goToLogicalPage = useCallback(
    (pageNum, options = {}) => {
      const clamped = Math.max(1, Math.min(10, Number(pageNum) || 1));
      const nextSpread = pageToSpread(clamped);
      setActivePage(clamped);
      setCurrentSpread(nextSpread);

      if (clamped === 9 || options.openContact) {
        setContactDrawerOpen(true);
        setContactAutoFocus(options.focusField || null);
      } else if (nextSpread !== 4) {
        setContactDrawerOpen(false);
      }
    },
    []
  );

  const handleSpreadChangeFrom3D = useCallback((nextSpread) => {
    const clampedSpread = Math.max(0, Math.min(5, nextSpread));
    setCurrentSpread(clampedSpread);
    const primary = spreadToPrimaryPage(clampedSpread);
    setActivePage(primary);
    if (clampedSpread === 4) {
      setContactDrawerOpen(true);
    } else {
      setContactDrawerOpen(false);
    }
  }, []);

  const handleStepPrev = useCallback(() => {
    if (viewMode === 'reader' || (window.innerWidth < 720 && mobileFocusMode === 'single')) {
      if (activePage > 1) {
        goToLogicalPage(activePage - 1);
      }
    } else if (currentSpread > 0) {
      handleSpreadChangeFrom3D(currentSpread - 1);
    }
  }, [activePage, currentSpread, goToLogicalPage, handleSpreadChangeFrom3D, mobileFocusMode, viewMode]);

  const handleStepNext = useCallback(() => {
    if (viewMode === 'reader' || (window.innerWidth < 720 && mobileFocusMode === 'single')) {
      if (activePage < 10) {
        goToLogicalPage(activePage + 1);
      }
    } else if (currentSpread < 5) {
      handleSpreadChangeFrom3D(currentSpread + 1);
    }
  }, [activePage, currentSpread, goToLogicalPage, handleSpreadChangeFrom3D, mobileFocusMode, viewMode]);

  // Keyboard left/right arrow navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleStepNext();
      } else if (e.key === 'ArrowLeft') {
        handleStepPrev();
      } else if (e.key === 'Escape' && contactDrawerOpen) {
        setContactDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleStepNext, handleStepPrev, contactDrawerOpen]);

  const handleSelectHotspot = useCallback(
    (spot) => {
      if (!spot) return;
      if (spot.type === 'external' && spot.url) {
        window.open(spot.url, '_blank', 'noopener,noreferrer');
      } else if (spot.type === 'gotoPage' && spot.page) {
        goToLogicalPage(spot.page);
      } else if (spot.type === 'openContact') {
        setContactDrawerOpen(true);
        setContactAutoFocus(spot.focus || 'form');
      }
    },
    [goToLogicalPage]
  );

  const triggerWrongDirNudge = useCallback(() => {
    setNudgeRightPulse(true);
    setTimeout(() => setNudgeRightPulse(false), 1100);
  }, []);

  const visiblePages = useMemo(() => {
    if (viewMode === 'reader') return [activePage];
    return getVisiblePagesForSpread(currentSpread);
  }, [activePage, currentSpread, viewMode]);

  const isAtStart = viewMode === 'reader' ? activePage <= 1 : currentSpread <= 0;
  const isAtEnd = viewMode === 'reader' ? activePage >= 10 : currentSpread >= 5;

  return (
    <div className="portfolio-shell">
      {/* Ambient Futuristic Neon Backdrop */}
      <div className="ambient-aurora ambient-aurora--purple" aria-hidden="true" />
      <div className="ambient-aurora ambient-aurora--cyan" aria-hidden="true" />
      <div className="ambient-grid" aria-hidden="true" />

      {showLoader && (
        <LoadingScreen
          visible={loaderVisible}
          onExited={handleLoaderExited}
        />
      )}

      {/* Top Glassmorphic Header */}
      <header className="top-nav glass-panel">
        <button
          type="button"
          className="brand-cluster"
          onClick={() => goToLogicalPage(1)}
          title="Return to Cover (Page 1)"
        >
          <span className="brand-monogram">EB</span>
          <span className="brand-copy">
            <strong>{portfolioData.brand}</strong>
            <small>{portfolioData.owner}</small>
          </span>
        </button>

        <nav className="quick-jump-links" aria-label="Quick section jump">
          <button
            type="button"
            className={visiblePages.includes(1) ? 'active' : ''}
            onClick={() => goToLogicalPage(1)}
          >
            Cover
          </button>
          <button
            type="button"
            className={visiblePages.includes(2) ? 'active' : ''}
            onClick={() => goToLogicalPage(2)}
          >
            About
          </button>
          <button
            type="button"
            className={visiblePages.includes(3) ? 'active' : ''}
            onClick={() => goToLogicalPage(3)}
          >
            Skills
          </button>
          <button
            type="button"
            className={
              visiblePages.includes(5) || visiblePages.includes(6) || visiblePages.includes(8)
                ? 'active'
                : ''
            }
            onClick={() => goToLogicalPage(8)}
          >
            Projects
          </button>
          <button
            type="button"
            className={visiblePages.includes(9) ? 'active' : ''}
            onClick={() => goToLogicalPage(9, { openContact: true, focusField: 'form' })}
          >
            Contact
          </button>
        </nav>

        <div className="header-actions">
          <span
            className={`api-status-badge ${apiConnected ? 'api-status-badge--live' : ''}`}
            title={
              apiConnected
                ? 'Connected to FastAPI + PostgreSQL backend'
                : 'Displaying standalone portfolio data'
            }
          >
            <Database size={13} />
            <span>{apiConnected ? 'DB Live' : 'Standalone'}</span>
          </span>

          {webglSupported && (
            <button
              type="button"
              className="btn-mode-toggle"
              onClick={() => setViewMode((m) => (m === '3d' ? 'reader' : '3d'))}
              title={viewMode === '3d' ? 'Switch to Flat Reader View' : 'Switch to Interactive 3D Book'}
            >
              {viewMode === '3d' ? (
                <>
                  <LayoutGrid size={15} />
                  <span>Reader</span>
                </>
              ) : (
                <>
                  <BookOpen size={15} />
                  <span>3D Book</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            className="btn-contact-cta"
            onClick={() => goToLogicalPage(9, { openContact: true, focusField: 'form' })}
          >
            <MessageSquare size={15} />
            <span>Contact</span>
          </button>
        </div>
      </header>

      {/* Main Centerpiece Viewport */}
      <main className="stage-main">
        {viewMode === '3d' && webglSupported ? (
          <WebGLErrorBoundary
            onWebGLFailure={() => {
              setWebglSupported(false);
              setViewMode('reader');
            }}
            fallback={
              <FallbackBookReader
                portfolioData={portfolioData}
                activePage={activePage}
                onSelectPage={goToLogicalPage}
                webglUnavailable
              />
            }
          >
            <div className="stage-3d-wrapper">
              {/* Contextual Gesture Banner above Book */}
              <div className="gesture-hud-row">
                {currentSpread === 0 && (
                  <div
                    className={`gesture-banner glass-panel ${
                      nudgeRightPulse ? 'gesture-banner--pulse' : ''
                    }`}
                  >
                    <Sparkles size={15} className="text-cyan" />
                    <span>
                      Drag Front Cover <strong>RIGHT</strong> to Open
                    </span>
                    <MoveRight size={17} className="arrow-slide-right text-cyan" />
                  </div>
                )}

                {currentSpread >= 1 && currentSpread <= 4 && (
                  <div className="gesture-banner gesture-banner--subtle glass-panel">
                    <span>
                      Spread {currentSpread}/4 • Pages{' '}
                      <strong>
                        0{visiblePages[0]} &amp; 0{visiblePages[1]}
                      </strong>{' '}
                      — Drag Right to Advance, Left to Flip Back
                    </span>
                  </div>
                )}

                {currentSpread === 5 && (
                  <div className="gesture-banner glass-panel">
                    <span>Back Cover — “DREAM BIG. BUILD DIFFERENT.” • Drag Left to Reopen</span>
                  </div>
                )}

                {/* Mobile Single-Page Zoom Toggle when open */}
                {currentSpread >= 1 && currentSpread <= 4 && (
                  <div className="mobile-only-zoom glass-panel">
                    <ZoomIn size={14} className="text-cyan" />
                    <button
                      type="button"
                      className={
                        mobileFocusMode === 'single' && activePage === visiblePages[0]
                          ? 'active'
                          : ''
                      }
                      onClick={() => {
                        setMobileFocusMode('single');
                        setActivePage(visiblePages[0]);
                      }}
                    >
                      P0{visiblePages[0]}
                    </button>
                    <button
                      type="button"
                      className={mobileFocusMode === 'spread' ? 'active' : ''}
                      onClick={() => setMobileFocusMode('spread')}
                    >
                      Both
                    </button>
                    <button
                      type="button"
                      className={
                        mobileFocusMode === 'single' && activePage === visiblePages[1]
                          ? 'active'
                          : ''
                      }
                      onClick={() => {
                        setMobileFocusMode('single');
                        setActivePage(visiblePages[1]);
                      }}
                    >
                      P0{visiblePages[1]}
                    </button>
                  </div>
                )}
              </div>

              {/* 3D WebGL Book Scene */}
              <Book3DScene
                portfolioData={portfolioData}
                currentSpread={currentSpread}
                focusedPage={activePage}
                mobileFocusMode={mobileFocusMode}
                onSpreadChange={handleSpreadChangeFrom3D}
                onSelectHotspot={handleSelectHotspot}
                onWrongDirectionNudge={triggerWrongDirNudge}
                onSceneReady={handleSceneReady}
              />

              {/* Contextual Action Chips for Active Project / Contact Spreads */}
              <div className="contextual-floating-bar">
                {(currentSpread === 2 || currentSpread === 4) && (
                  <a
                    href="https://moneyflow-website.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="floating-action-chip floating-action-chip--cyan glass-panel"
                  >
                    <span>MoneyFlow Live Site</span>
                    <ExternalLink size={15} />
                  </a>
                )}

                {currentSpread === 4 && !contactDrawerOpen && (
                  <button
                    type="button"
                    className="floating-action-chip floating-action-chip--purple glass-panel"
                    onClick={() => setContactDrawerOpen(true)}
                  >
                    <MessageSquare size={15} />
                    <span>Open Working Contact Form</span>
                  </button>
                )}

                {currentSpread === 0 && (
                  <button
                    type="button"
                    className="floating-action-chip floating-action-chip--cyan glass-panel"
                    onClick={() => handleSpreadChangeFrom3D(1)}
                  >
                    <span>Open Hardcover Book</span>
                    <MoveRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </WebGLErrorBoundary>
        ) : (
          <FallbackBookReader
            portfolioData={portfolioData}
            activePage={activePage}
            onSelectPage={goToLogicalPage}
            webglUnavailable={!webglSupported}
          />
        )}

        {/* Live Docked Contact Form & Channels Drawer (auto-opens on Page 9 in 3D mode) */}
        {contactDrawerOpen && viewMode === '3d' && (
          <aside
            className="contact-drawer glass-panel"
            aria-label="Live Contact Form & Verified Social Channels"
          >
            <div className="contact-drawer-header">
              <div>
                <span className="drawer-kicker">PAGE 09 / 10 • LIVE TERMINAL</span>
                <h2>Contact Erkinov Boburjon</h2>
              </div>
              <button
                type="button"
                className="btn-icon-close"
                onClick={() => setContactDrawerOpen(false)}
                aria-label="Minimize Contact Form to view full 3D page"
              >
                <X size={18} />
              </button>
            </div>
            <ContactPanel
              socials={portfolioData.socials}
              compact
              autoFocusField={contactAutoFocus}
            />
          </aside>
        )}
      </main>

      {/* Secondary 10-Page Navigation Bar */}
      <footer className="bottom-nav glass-panel" aria-label="Book page navigation">
        <button
          type="button"
          className="nav-step-btn"
          onClick={handleStepPrev}
          disabled={isAtStart}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
          <span className="hide-xs">Prev</span>
        </button>

        <div className="page-dots-rail" role="tablist" aria-label="10 Book Pages">
          {BOOK_PAGES.map((item) => {
            const isVisible = visiblePages.includes(item.page);
            return (
              <button
                key={item.page}
                type="button"
                role="tab"
                aria-selected={isVisible}
                className={`page-pill-btn ${isVisible ? 'page-pill-btn--active' : ''}`}
                onClick={() => goToLogicalPage(item.page)}
                title={`Page ${item.page}: ${item.title}`}
              >
                <span className="page-pill-num">{String(item.page).padStart(2, '0')}</span>
                <span className="page-pill-label">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="nav-step-btn"
          onClick={handleStepNext}
          disabled={isAtEnd}
          aria-label="Next page"
        >
          <span className="hide-xs">Next</span>
          <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}
