'use client';

import { useEffect } from 'react';

function FlowPulse() {
  useEffect(() => {
    const hLines = Array.from(document.querySelectorAll('.flow-line'));
    const vLines = Array.from(document.querySelectorAll('.flow-line-v'));

    if (!hLines.length && !vLines.length) return;

    // ── Speed variation ──
    // Horizontal = faster (current through short traces)
    // Vertical = slower (current through long guides)
    const hSpeed = 1.0;
    const vSpeed = 2.0;
    const branchOverlap = 0.3; // H/V overlap for branching feel

    // Total cycle time
    const hTotal = hLines.length * hSpeed;
    const vTotal = vLines.length * vSpeed;
    const totalTime = hTotal + vTotal - (vLines.length > 0 ? branchOverlap : 0);

    // Keyframe window percentages (each type's visible fraction)
    const hPct = (hSpeed / totalTime) * 100;
    const vPct = (vSpeed / totalTime) * 100;

    // ── Dynamic keyframes ──
    const style = document.createElement('style');
    style.id = 'flow-pulse-keyframes';
    style.textContent = `
      @keyframes flow-h {
        0% { left: -70px; opacity: 0; }
        0.5% { opacity: 1; }
        ${(hPct - 0.5).toFixed(2)}% { left: 100%; opacity: 1; }
        ${hPct.toFixed(2)}% { opacity: 0; }
        100% { opacity: 0; }
      }
      @keyframes flow-v {
        0% { top: -70px; opacity: 0; }
        0.5% { opacity: 1; }
        ${(vPct - 0.5).toFixed(2)}% { top: 100%; opacity: 1; }
        ${vPct.toFixed(2)}% { opacity: 0; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // ── Color shift — c5 (top) → c9 (bottom) ──
    const pageHeight = document.documentElement.scrollHeight || 1;

    // Assign timing + color to horizontal lines
    let delay = 0;

    hLines.forEach((el) => {
      const html = el as HTMLElement;
      html.style.setProperty('--flow-total', `${totalTime}s`);
      html.style.setProperty('--flow-delay', `${delay.toFixed(2)}s`);

      // Position-based color: oklch lightness from c5(0.348) to c9(0.649)
      const rect = html.getBoundingClientRect();
      const elY = rect.top + window.scrollY;
      const progress = Math.min(elY / pageHeight, 1);
      const lightness = 0.348 + progress * (0.649 - 0.348);
      html.style.setProperty('--flow-color', `oklch(${lightness.toFixed(3)} 0 0)`);

      delay += hSpeed;
    });

    // ── Branching — V pulses start with overlap ──
    if (vLines.length > 0) delay -= branchOverlap;

    vLines.forEach((el) => {
      const html = el as HTMLElement;
      html.style.setProperty('--flow-total', `${totalTime}s`);
      html.style.setProperty('--flow-delay', `${delay.toFixed(2)}s`);
      // V lines span full height — use mid brightness
      html.style.setProperty('--flow-color', `oklch(0.500 0 0)`);
      delay += vSpeed;
    });

    return () => {
      document.getElementById('flow-pulse-keyframes')?.remove();
    };
  }, []);

  return null;
}

export { FlowPulse };
