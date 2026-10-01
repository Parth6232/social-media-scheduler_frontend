import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useInView } from 'framer-motion';

const STEP = 120; // ms between digit flips

const Half = ({ digit, part, sx = {} }) => {
  const top = part === 'top';
  return (
    <Box sx={{ position: 'absolute', left: 0, right: 0, [top ? 'top' : 'bottom']: 0, height: '50%', overflow: 'hidden', backfaceVisibility: 'hidden',
      bgcolor: top ? 'var(--flap-top)' : 'var(--flap-bottom)', borderRadius: top ? '0.14em 0.14em 0 0' : '0 0 0.14em 0.14em', ...sx }}>
      <Box sx={{ position: 'absolute', left: 0, right: 0, [top ? 'top' : 'bottom']: 0, height: '200%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{digit}</Box>
    </Box>
  );
};

/** One mechanical split-flap digit: counts up from 0 to `target`, flipping through each value. */
const FlapDigit = ({ target, delay, animate }) => {
  const [shown, setShown] = useState(animate ? 0 : target);
  const [prev, setPrev] = useState(animate ? 0 : target);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!animate) return undefined;
    let n = 0;
    let timer;
    const next = () => {
      if (n >= target) return;
      n += 1;
      setPrev(n - 1); setShown(n); setTick((t) => t + 1);
      timer = setTimeout(next, STEP);
    };
    timer = setTimeout(next, delay);
    return () => clearTimeout(timer);
  }, [animate, target, delay]);

  return (
    <Box sx={{ position: 'relative', width: '0.74em', height: '1.18em', perspective: '0.9em', borderRadius: '0.14em', boxShadow: 'var(--flap-shadow)', fontWeight: 600, lineHeight: 1 }}>
      <Half part="top" digit={shown} />
      <Half part="bottom" digit={prev} />
      {tick > 0 && (
        <>
          <Half key={`t${tick}`} part="top" digit={prev} sx={{ transformOrigin: 'bottom', animation: `pp-flap-top ${STEP / 2}ms ease-in forwards`, zIndex: 2 }} />
          <Half key={`b${tick}`} part="bottom" digit={shown} sx={{ transformOrigin: 'top', transform: 'rotateX(90deg)', animation: `pp-flap-bottom ${STEP / 2}ms ${STEP / 2}ms ease-out forwards`, zIndex: 2 }} />
        </>
      )}
      {/* hinge */}
      <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '0.04em', mt: '-0.02em', bgcolor: 'var(--flap-hinge)', zIndex: 3 }} />
      <Box sx={{ position: 'absolute', left: '-0.03em', top: '50%', width: '0.07em', height: '0.12em', mt: '-0.06em', borderRadius: '0.04em', bgcolor: 'var(--flap-hinge)', zIndex: 3 }} />
      <Box sx={{ position: 'absolute', right: '-0.03em', top: '50%', width: '0.07em', height: '0.12em', mt: '-0.06em', borderRadius: '0.04em', bgcolor: 'var(--flap-hinge)', zIndex: 3 }} />
    </Box>
  );
};

/** Split-flap (departure board) number. Digits flip once when scrolled into view. */
const FlapNumber = ({ value = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const chars = String(Math.round(Number(value) || 0).toLocaleString()).split('');

  return (
    <Box ref={ref} aria-label={String(value)} role="img"
      sx={{ display: 'inline-flex', gap: '0.08em', verticalAlign: 'top',
        '--flap-top': (t) => (t.palette.mode === 'dark' ? '#1C2027' : '#FFFFFF'),
        '--flap-bottom': (t) => (t.palette.mode === 'dark' ? '#161A20' : '#F1F3F6'),
        '--flap-hinge': (t) => (t.palette.mode === 'dark' ? '#0A0B0E' : '#D0D5DD'),
        '--flap-shadow': (t) => (t.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.07), 0 4px 10px rgba(0,0,0,0.4)' : '0 0 0 1px #E4E7EC, 0 3px 8px rgba(16,24,40,0.08)') }}>
      {chars.map((c, i) => (/\d/.test(c)
        ? <FlapDigit key={`${chars.length - i}`} target={Number(c)} delay={i * 90} animate={!reduced && inView} />
        : <Box key={`${chars.length - i}`} component="span" sx={{ alignSelf: 'flex-end', px: '0.02em', color: 'text.secondary' }}>{c}</Box>))}
    </Box>
  );
};

export default FlapNumber;
