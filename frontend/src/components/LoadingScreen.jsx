import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LoadingScreen({ visible, onExited }) {
  const overlayRef = useRef(null);
  const barRef = useRef(null);
  const crestRef = useRef(null);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  useEffect(() => {
    if (!overlayRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        crestRef.current,
        { scale: 0.88, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
      gsap.fromTo(
        barRef.current,
        { scaleX: 0.1 },
        { scaleX: 0.92, duration: 0.7, ease: 'power2.out' }
      );
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (visible || !overlayRef.current) return undefined;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onExitedRef.current?.();
    };

    const safetyTimer = setTimeout(finish, 750);
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(barRef.current, { scaleX: 1, duration: 0.18, ease: 'power2.out' }).to(
      overlayRef.current,
      {
        opacity: 0,
        y: -12,
        duration: 0.38,
        ease: 'power3.inOut',
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      tl.kill();
    };
  }, [visible]);

  return (
    <div
      ref={overlayRef}
      className="loader-overlay"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      role="status"
      aria-live="polite"
    >
      <div className="loader-card glass-panel" ref={crestRef}>
        <div className="loader-emblem">
          <span>EB</span>
        </div>
        <p className="loader-kicker">INITIALIZING 3D CODEX ENGINE</p>
        <h1 className="loader-title">ERKINOV LOYIHASI</h1>
        <p className="loader-sub">ERKINOV BOBURJON — Interactive 3D Portfolio</p>
        <div className="loader-track">
          <div ref={barRef} className="loader-bar" />
        </div>
      </div>
    </div>
  );
}
