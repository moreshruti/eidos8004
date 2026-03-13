'use client';

import { useEffect, useRef, useState } from 'react';
import { Calligraph } from 'calligraph';

// ---------------------------------------------------------------------------
// Layer descriptions (bottom to top, matching visual order)
// ---------------------------------------------------------------------------

const LAYERS = [
  {
    left: 'CHAIN',
    right: 'VAULT',
    title: 'Base Layer',
    desc: 'Immutable storage and settlement. Every design asset anchored on-chain with cryptographic proof of ownership.',
  },
  {
    left: 'AGENTS',
    right: 'TRUST',
    title: 'Agent Registry',
    desc: 'AI agents register with verified identities and trust scores. The protocol tracks who uses what and why.',
  },
  {
    left: 'ATTRIB',
    right: 'VERIFY',
    title: 'Attribution Engine',
    desc: 'Every usage is recorded, timestamped, and publicly verifiable. Provenance that can\'t be forged or revoked.',
  },
  {
    left: 'ROYALTY',
    right: 'SETTLE',
    title: 'Settlement',
    desc: 'Instant royalty payments triggered by attribution events. No invoices. No 60-day terms. Real-time ETH.',
  },
];

// ---------------------------------------------------------------------------
// Color tokens
// ---------------------------------------------------------------------------

const BRIGHT = 'text-c3';
const DIM = 'text-c4';
const BRACKET = 'text-c5';
const LABEL_TEXT = 'text-c11';

// ---------------------------------------------------------------------------
// Segment type
// ---------------------------------------------------------------------------

type Seg = { t: string; c: string };

function seg(t: string, c: string): Seg {
  return { t, c };
}

// ---------------------------------------------------------------------------
// Line builders
// ---------------------------------------------------------------------------

function capLine1(): Seg[] {
  return [
    seg('+', DIM),
    seg('------------', DIM),
    seg('+', DIM),
    seg('.', DIM),
    seg('-----------', DIM),
    seg('+', DIM),
    seg('.', DIM),
  ];
}

function capLine2(): Seg[] {
  return [
    seg('|', DIM),
    seg('`', DIM),
    seg('.', DIM),
    seg('          ', ''),
    seg('|', DIM),
    seg(' ', ''),
    seg('`', DIM),
    seg('.', DIM),
    seg('         ', ''),
    seg('|', DIM),
    seg(' ', ''),
    seg('`', DIM),
    seg('.', DIM),
  ];
}

function capLine3(): Seg[] {
  return [
    seg('|', DIM),
    seg('  ', ''),
    seg('`', DIM),
    seg('+', BRIGHT),
    seg('------------', BRIGHT),
    seg('+', BRIGHT),
    seg('------------', BRIGHT),
    seg('+', BRIGHT),
  ];
}

function bodyRow(): Seg[] {
  return [
    seg('|', DIM),
    seg('   ', ''),
    seg('|', BRIGHT),
    seg('        ', ''),
    seg('|', DIM),
    seg('   ', ''),
    seg('|', BRIGHT),
    seg('        ', ''),
    seg('|', DIM),
    seg('   ', ''),
    seg('|', BRIGHT),
  ];
}

function seamBorder(): Seg[] {
  return [
    seg('+', BRIGHT),
    seg('---', DIM),
    seg('|', BRIGHT),
    seg('--------', DIM),
    seg('+', DIM),
    seg('.', DIM),
    seg('--', DIM),
    seg('|', BRIGHT),
    seg('--------', DIM),
    seg('+', DIM),
    seg('.', DIM),
    seg('  ', ''),
    seg('|', BRIGHT),
  ];
}

function seamLabelLine(
  left: string,
  right: string,
  isBottom: boolean,
): Seg[] {
  const leftPad = 11 - (left.length + 2);
  const rightPad = 9 - (right.length + 2);
  const segments: Seg[] = [];

  segments.push(isBottom ? seg(' ', '') : seg('|', DIM));
  segments.push(seg('`.', DIM));
  segments.push(seg(' ', ''));
  segments.push(seg('|', BRIGHT));
  segments.push(seg('[', BRACKET));
  segments.push(seg(left, LABEL_TEXT));
  segments.push(seg(']', BRACKET));
  if (leftPad > 0) segments.push(seg(' '.repeat(leftPad), ''));
  segments.push(seg('`.', DIM));
  segments.push(seg('|', BRIGHT));
  segments.push(seg('[', BRACKET));
  segments.push(seg(right, LABEL_TEXT));
  segments.push(seg(']', BRACKET));
  if (rightPad > 0) segments.push(seg(' '.repeat(rightPad), ''));
  segments.push(seg('`.', DIM));
  segments.push(seg('|', DIM));

  return segments;
}

function seamBottomLine(isBottom: boolean): Seg[] {
  if (isBottom) {
    return [
      seg('   ', ''),
      seg('`', DIM),
      seg('+', BRIGHT),
      seg('------------', BRIGHT),
      seg('+', BRIGHT),
      seg('------------', BRIGHT),
      seg('+', BRIGHT),
    ];
  }
  return [
    seg('|', DIM),
    seg('  ', ''),
    seg('`', DIM),
    seg('+', BRIGHT),
    seg('------------', BRIGHT),
    seg('+', BRIGHT),
    seg('------------', BRIGHT),
    seg('+', BRIGHT),
  ];
}

// ---------------------------------------------------------------------------
// Render segments as spans
// ---------------------------------------------------------------------------

function renderLine(segments: Seg[], key: string) {
  return segments.map((s, i) => {
    if (!s.c) return <span key={`${key}-${i}`}>{s.t}</span>;
    return (
      <span key={`${key}-${i}`} className={s.c}>
        {s.t}
      </span>
    );
  });
}

// ---------------------------------------------------------------------------
// Build groups (bottom to top: group0 = CHAIN, group3 = ROYALTY)
// ---------------------------------------------------------------------------

function buildGroup3(): Seg[][] {
  const lines: Seg[][] = [];
  lines.push(capLine1());
  lines.push(capLine2());
  lines.push(capLine3());
  for (let i = 0; i < 4; i++) lines.push(bodyRow());
  lines.push(seamBorder());
  lines.push(seamLabelLine(LAYERS[3].left, LAYERS[3].right, false));
  lines.push(seamBottomLine(false));
  return lines;
}

function buildGroup2(): Seg[][] {
  const lines: Seg[][] = [];
  for (let i = 0; i < 4; i++) lines.push(bodyRow());
  lines.push(seamBorder());
  lines.push(seamLabelLine(LAYERS[2].left, LAYERS[2].right, false));
  lines.push(seamBottomLine(false));
  return lines;
}

function buildGroup1(): Seg[][] {
  const lines: Seg[][] = [];
  for (let i = 0; i < 4; i++) lines.push(bodyRow());
  lines.push(seamBorder());
  lines.push(seamLabelLine(LAYERS[1].left, LAYERS[1].right, false));
  lines.push(seamBottomLine(false));
  return lines;
}

function buildGroup0(): Seg[][] {
  const lines: Seg[][] = [];
  lines.push(seamBorder());
  lines.push(seamLabelLine(LAYERS[0].left, LAYERS[0].right, true));
  lines.push(seamBottomLine(true));
  return lines;
}

// ---------------------------------------------------------------------------
// Stack group component
// ---------------------------------------------------------------------------

function StackGroup({
  lines,
  delay,
}: {
  lines: Seg[][];
  delay: number;
}) {
  return (
    <div
      className="stack-layer"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <pre className="font-mono text-[11px] sm:text-xs leading-[1.5] select-none m-0">
        {lines.map((segs, lineIdx) => (
          <span key={lineIdx}>
            {renderLine(segs, `l${lineIdx}`)}
            {lineIdx < lines.length - 1 ? '\n' : ''}
          </span>
        ))}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layer description with Calligraph text animation
// ---------------------------------------------------------------------------

function LayerDesc({
  layer,
  index,
  visible,
  delay,
}: {
  layer: (typeof LAYERS)[number];
  index: number;
  visible: boolean;
  delay: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

  return (
    <div>
      <p className="text-[10px] font-mono text-c5 tracking-[0.2em] uppercase mb-1">
        <Calligraph>{show ? `0${index + 1}` : '\u00A0'}</Calligraph>
      </p>
      <h3 className="text-sm font-medium text-c11 mb-1">
        <Calligraph>{show ? layer.title : '\u00A0'}</Calligraph>
      </h3>
      <p className="text-[13px] text-c7 leading-relaxed">
        <Calligraph>{show ? layer.desc : '\u00A0'}</Calligraph>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProtocolStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        section
          .querySelectorAll<HTMLElement>('.stack-layer')
          .forEach((el) => el.classList.add('is-visible'));

        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const group0 = buildGroup0();
  const group1 = buildGroup1();
  const group2 = buildGroup2();
  const group3 = buildGroup3();

  // Reversed so visual order is top=Settlement, bottom=Base Layer
  // Delays: bottom-to-top (index 0 = Base Layer fires first)
  const reversedLayers = [...LAYERS].reverse();

  return (
    <section ref={sectionRef} className="border-t border-c2 flow-line">
      <div className="px-8 pt-10 pb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
          Protocol Stack
        </p>
        <h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
          The system under the hood
        </h2>
      </div>

      <div className="border-t border-c2 px-6 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-12 items-center max-w-4xl mx-auto">

          {/* Left — ASCII illustration */}
          <div>
            <div className="flex flex-col-reverse">
              <StackGroup lines={group0} delay={0} />
              <StackGroup lines={group1} delay={300} />
              <StackGroup lines={group2} delay={600} />
              <StackGroup lines={group3} delay={900} />
            </div>
            <p className="text-[10px] font-mono text-c5 tracking-[0.2em] uppercase mt-4">
              Fig 1. Protocol Stack
            </p>
          </div>

          {/* Right — Layer descriptions with Calligraph */}
          <div className="flex flex-col gap-6">
            {reversedLayers.map((layer, i) => (
              <LayerDesc
                key={layer.title}
                layer={layer}
                index={3 - i}
                visible={visible}
                delay={(3 - i) * 250}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
