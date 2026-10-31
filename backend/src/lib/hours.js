const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Day of week and minutes past midnight in the venue's own time zone. */
function zonedNow(timeZone, now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    day: DAYS.indexOf(get('weekday').toLowerCase().slice(0, 3)),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/**
 * Works out whether a venue is open now, when it closes, or when it next opens.
 * A range whose close time is at or before its open time runs past midnight.
 */
function openStatus(hours, timeZone = 'Europe/London', now = new Date()) {
  const { day, minutes } = zonedNow(timeZone, now);
  const rangesFor = (d) => hours[DAYS[(d + 7) % 7]] || [];

  for (const [open, close] of rangesFor(day)) {
    const o = toMinutes(open);
    const c = toMinutes(close);
    const overnight = c <= o;
    if (minutes >= o && (overnight || minutes < c)) return { isOpen: true, closesAt: close, opensAt: null, opensDay: null };
  }
  for (const [open, close] of rangesFor(day - 1)) {
    const o = toMinutes(open);
    const c = toMinutes(close);
    if (c <= o && minutes < c) return { isOpen: true, closesAt: close, opensAt: null, opensDay: null };
  }

  const laterToday = rangesFor(day).find(([open]) => toMinutes(open) > minutes);
  if (laterToday) return { isOpen: false, closesAt: null, opensAt: laterToday[0], opensDay: 'today' };

  for (let i = 1; i <= 7; i += 1) {
    const next = rangesFor(day + i)[0];
    if (next) {
      return { isOpen: false, closesAt: null, opensAt: next[0], opensDay: i === 1 ? 'tomorrow' : DAYS[(day + i) % 7] };
    }
  }
  return { isOpen: false, closesAt: null, opensAt: null, opensDay: null };
}

module.exports = { openStatus, DAYS };
