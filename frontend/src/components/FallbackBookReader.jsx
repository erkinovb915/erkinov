import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ExternalLink,
  Sparkles,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import ContactPanel from './ContactPanel';

export default function FallbackBookReader({
  portfolioData,
  activePage,
  onSelectPage,
  webglUnavailable,
}) {
  const cardRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0 });

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { rotateY: -8, opacity: 0.35, y: 8 },
      { rotateY: 0, opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' }
    );
  }, [activePage]);

  const projects = portfolioData.projects || [];
  const moneyFlow =
    projects.find((p) => p.slug === 'moneyflow' || p.title === 'MoneyFlow') || projects[0];
  const sherdoor =
    projects.find((p) => p.slug === 'sherdoor-akfa' || p.title === 'SHERDOOR AKFA') ||
    projects[1];

  const handlePointerDown = (e) => {
    if (e.target.closest('input, textarea, button, a')) return;
    dragRef.current = { active: true, startX: e.clientX };
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    // Drag RIGHT opens cover & advances forward; drag LEFT flips back
    if (dx > 50 && activePage < 10) {
      onSelectPage(activePage + 1);
    } else if (dx < -50 && activePage > 1) {
      onSelectPage(activePage - 1);
    }
  };

  const renderPageBody = () => {
    switch (activePage) {
      case 1:
        return (
          <div className="reader-cover">
            <span className="reader-pill">✦ {portfolioData.brand} ✦</span>
            <div className="reader-emblem">EB</div>
            <p className="reader-kicker">INTERACTIVE PORTFOLIO CODEX</p>
            <h2 className="reader-hero-title">{portfolioData.owner}</h2>
            <p className="reader-lead">{portfolioData.tagline}</p>
            <button
              type="button"
              className="btn-neon-primary"
              onClick={() => onSelectPage(2)}
            >
              <span>Open Book (Drag Right or Tap)</span>
              <ArrowRight size={17} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 02 / 10 • DEVELOPER PROFILE</span>
            <h2 className="reader-title">About Me</h2>
            <p className="reader-highlight">{portfolioData.about.headline}</p>
            {portfolioData.about.paragraphs.map((p, i) => (
              <p key={i} className="reader-paragraph">
                {p}
              </p>
            ))}
            <div className="reader-pillars-grid">
              {portfolioData.about.pillars.map((pil) => (
                <div key={pil.code} className="reader-mini-card">
                  <span className="reader-code">PILLAR {pil.code}</span>
                  <h3>{pil.title}</h3>
                  <p>{pil.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 03 / 10 • CORE STACK</span>
            <h2 className="reader-title">Skills</h2>
            <div className="reader-skills-grid">
              {portfolioData.skills.map((skill, idx) => (
                <div key={skill.name} className="reader-skill-row">
                  <div className="reader-skill-head">
                    <span className="reader-skill-num">0{idx + 1}</span>
                    <div>
                      <strong>{skill.name}</strong>
                      <small>{skill.category}</small>
                    </div>
                  </div>
                  <div className="reader-meter">
                    <div style={{ width: `${skill.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 04 / 10 • PROGRESSION</span>
            <h2 className="reader-title">My Journey</h2>
            <div className="reader-timeline">
              {portfolioData.journey.map((item) => (
                <div key={item.step} className="reader-timeline-item">
                  <div className="reader-timeline-badge">{item.step}</div>
                  <div className="reader-timeline-body">
                    <span className="reader-code">{item.focus}</span>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 05 / 10 • FEATURED SYSTEM 01</span>
            <div className="reader-title-row">
              <h2 className="reader-title">{moneyFlow.title}</h2>
              <span className="status-pill status-pill--cyan">Live</span>
            </div>
            <p className="reader-highlight">Personal Finance Telegram Bot</p>
            <p className="reader-paragraph">{moneyFlow.description}</p>
            <ul className="reader-feature-list">
              {(moneyFlow.features || []).map((f) => (
                <li key={f}>
                  <CheckCircle2 size={16} className="text-cyan" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="reader-chip-row">
              {(moneyFlow.technologies || []).map((t) => (
                <span key={t} className="tech-chip">
                  {t}
                </span>
              ))}
            </div>
            <a
              href="https://moneyflow-website.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-primary"
            >
              <span>Visit moneyflow-website.netlify.app</span>
              <ExternalLink size={16} />
            </a>
          </div>
        );

      case 6:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 06 / 10 • FEATURED SYSTEM 02</span>
            <div className="reader-title-row">
              <h2 className="reader-title">{sherdoor.title}</h2>
              <span className="status-pill status-pill--purple">Production</span>
            </div>
            <p className="reader-highlight">Employee Attendance Telegram Bot</p>
            <p className="reader-paragraph">{sherdoor.description}</p>
            <ul className="reader-feature-list">
              {(sherdoor.features || []).map((f) => (
                <li key={f}>
                  <CheckCircle2 size={16} className="text-purple" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="reader-chip-row">
              {(sherdoor.technologies || []).map((t) => (
                <span key={t} className="tech-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 07 / 10 • ARCHITECTURE</span>
            <h2 className="reader-title">Technologies</h2>
            <div className="reader-tech-tiers">
              {portfolioData.technologies.map((tier, idx) => (
                <div key={tier.group} className="reader-mini-card">
                  <div className="reader-tier-head">
                    {idx === 0 ? (
                      <Sparkles size={16} className="text-cyan" />
                    ) : idx === 1 ? (
                      <Code2 size={16} className="text-purple" />
                    ) : (
                      <Cpu size={16} className="text-blue" />
                    )}
                    <h3>{tier.group}</h3>
                  </div>
                  <div className="reader-chip-row">
                    {tier.items.map((item) => (
                      <span key={item} className="tech-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 08 / 10 • CANONICAL PORTFOLIO</span>
            <h2 className="reader-title">Projects</h2>
            <p className="reader-paragraph">
              Verified production Telegram bot &amp; web platforms created under ERKINOV LOYIHASI:
            </p>
            <div className="reader-projects-duo">
              {projects.slice(0, 2).map((proj) => (
                <div key={proj.slug || proj.title} className="reader-project-card">
                  <div className="reader-title-row">
                    <span className="reader-code">{proj.category}</span>
                    <span className="status-pill status-pill--cyan">{proj.status}</span>
                  </div>
                  <h3>{proj.title}</h3>
                  <p className="reader-sub">{proj.subtitle}</p>
                  <p className="reader-paragraph">{proj.summary}</p>
                  <div className="reader-card-actions">
                    <button
                      type="button"
                      className="btn-ghost-sm"
                      onClick={() => onSelectPage(proj.book_page || 5)}
                    >
                      <Layers size={14} />
                      <span>Open Page 0{proj.book_page || 5}</span>
                    </button>
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-link-sm"
                      >
                        <span>Live Website</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="reader-section">
            <span className="reader-kicker">PAGE 09 / 10 • DIRECT CHANNELS &amp; DISPATCH</span>
            <h2 className="reader-title">Contact</h2>
            <ContactPanel socials={portfolioData.socials} />
          </div>
        );

      case 10:
      default:
        return (
          <div className="reader-cover reader-back-cover">
            <span className="reader-pill">PAGE 10 / 10 • BACK COVER</span>
            <blockquote className="reader-manifesto">
              “DREAM BIG.
              <br />
              <span>BUILD DIFFERENT.”</span>
            </blockquote>
            <p className="reader-lead">
              {portfolioData.brand} — {portfolioData.owner}
            </p>
            <button
              type="button"
              className="btn-ghost-sm"
              onClick={() => onSelectPage(1)}
            >
              <ArrowLeft size={15} />
              <span>Return to Front Cover</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fallback-reader-wrap"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {webglUnavailable && (
        <div className="webgl-fallback-banner">
          WebGL hardware acceleration is unavailable in this browser — showing Interactive CSS-3D Codex Mode.
        </div>
      )}
      <div ref={cardRef} className="fallback-book-sheet glass-panel">
        <div className="fallback-spine-accent" aria-hidden="true" />
        {renderPageBody()}
      </div>
    </div>
  );
}
