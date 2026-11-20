// NAYA: RangeSelector — video ka sirf ek hissa (timestamp range) chunne ke liye
//  - Video > maxMinutes (60): range ZAROORI (warning ke saath)
//  - Video <= maxMinutes: optional switch ("sirf is hisse se shorts banao")
//  - Range: kam se kam 2 min, zyada se zyada maxRangeMinutes (30)
import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel, TextField, Alert, Chip } from '@mui/material';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GlassCard from '../../../common/components/motion/GlassCard';

const MIN_RANGE_SEC = 120;
const DEFAULT_LIMITS = { maxMinutes: 60, maxRangeMinutes: 30 };

// "90", "1:30", "01:30", "1:02:03" => seconds (galat => null)
export const parseTime = (v) => {
  const s = String(v ?? '').trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return Number(s);
  const parts = s.split(':');
  if (parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  return parts.reduce((acc, p) => acc * 60 + Number(p), 0);
};

export const fmtTime = (sec) => {
  const t = Math.max(0, Math.round(sec || 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
};

const RangeSelector = ({ durationSec, limits, disabled, onChange }) => {
  const maxMinutes = limits?.maxMinutes ?? DEFAULT_LIMITS.maxMinutes;
  const maxRangeMinutes = limits?.maxRangeMinutes ?? DEFAULT_LIMITS.maxRangeMinutes;
  const maxRangeSec = maxRangeMinutes * 60;

  const required = durationSec > maxMinutes * 60;
  const defaultEnd = Math.min(durationSec, maxRangeSec);

  const [enabled, setEnabled] = useState(required);
  const [from, setFrom] = useState(required ? '0:00' : '');
  const [to, setTo] = useState(required ? fmtTime(defaultEnd) : '');

  const active = required || enabled;

  const result = useMemo(() => {
    if (!active) return { valid: true, start: null, end: null, error: '' };
    const start = parseTime(from);
    const end = parseTime(to);
    if (start === null || end === null) return { valid: false, start, end, error: 'Enter time like 10:00 or 1:05:30' };
    if (start >= durationSec - 1) return { valid: false, start, end, error: `Start is beyond the video length (${fmtTime(durationSec)})` };
    if (end > durationSec) return { valid: false, start, end, error: `End can't be more than ${fmtTime(durationSec)}` };
    if (end <= start) return { valid: false, start, end, error: 'End time must be after start time' };
    const len = end - start;
    if (len < MIN_RANGE_SEC) return { valid: false, start, end, error: 'Select at least 2 minutes' };
    if (len > maxRangeSec) return { valid: false, start, end, error: `Select at most ${maxRangeMinutes} minutes (you selected ${fmtTime(len)})` };
    return { valid: true, start, end, error: '' };
  }, [active, from, to, durationSec, maxRangeSec, maxRangeMinutes]);

  // parent ko batao
  useEffect(() => {
    onChange({ enabled: active, startSec: result.start, endSec: result.end, valid: result.valid, required });
  }, [active, result.start, result.end, result.valid, required, onChange]);

  const toggle = (e) => {
    const on = e.target.checked;
    setEnabled(on);
    if (on && !from && !to) {
      setFrom('0:00');
      setTo(fmtTime(defaultEnd));
    }
  };

  // lambi video: 30-30 min ke ready-made hisse (max 8)
  const windows = useMemo(() => {
    if (!required) return [];
    const list = [];
    for (let s = 0; s < durationSec && list.length < 8; s += maxRangeSec) {
      list.push([s, Math.min(s + maxRangeSec, durationSec)]);
    }
    return list.filter(([s, e]) => e - s >= MIN_RANGE_SEC);
  }, [required, durationSec, maxRangeSec]);

  return (
    <GlassCard sx={{ mb: 3, borderRadius: 3 }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ContentCutIcon sx={{ color: '#2563EB', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>Video section (timestamp range)</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', ml: 'auto' }}>
            Total {fmtTime(durationSec)}
          </Typography>
        </Box>

        {required ? (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon fontSize="inherit" />}
            sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8rem' } }}
          >
            This video is {fmtTime(durationSec)} long. Videos longer than {maxMinutes} min can&apos;t be processed directly.
            Pick a section of up to {maxRangeMinutes} min (for example 10:00 to 30:00) and we&apos;ll create 3 shorts from it.
          </Alert>
        ) : (
          <FormControlLabel
            control={<Switch checked={enabled} onChange={toggle} disabled={disabled} />}
            label={<Typography variant="body2">Create shorts only from a specific part of the video</Typography>}
            sx={{ mb: enabled ? 1.5 : 0 }}
          />
        )}

        {active && (
          <>
            {windows.length > 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {windows.map(([s, e]) => (
                  <Chip
                    key={s}
                    size="small"
                    clickable
                    disabled={disabled}
                    label={`${fmtTime(s)} – ${fmtTime(e)}`}
                    color={parseTime(from) === s && parseTime(to) === e ? 'primary' : 'default'}
                    onClick={() => { setFrom(fmtTime(s)); setTo(fmtTime(e)); }}
                  />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                size="small"
                label="From"
                placeholder="10:00"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={disabled}
                error={!result.valid}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                size="small"
                label="To"
                placeholder="30:00"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={disabled}
                error={!result.valid}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 0.75, color: result.valid ? 'text.secondary' : 'error.main' }}
            >
              {result.valid
                ? `Selected ${fmtTime(result.end - result.start)} (max ${maxRangeMinutes} min). Format: mm:ss or h:mm:ss`
                : result.error}
            </Typography>
          </>
        )}
      </Box>
    </GlassCard>
  );
};

export default RangeSelector;
