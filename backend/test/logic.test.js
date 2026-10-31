const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openStatus } = require('../src/lib/hours');
const { verificationStatus } = require('../src/lib/verification');
const { distanceKm } = require('../src/lib/geo');
const { ean13 } = require('../src/db/seed');

// 2026-01-12 is a Monday; January is GMT so UTC == London time.
const at = (iso) => new Date(`${iso}Z`);
const lateNight = { mon: [['16:00', '02:00']], tue: [['16:00', '02:00']] };

test('open status handles normal, overnight and closed periods', () => {
  assert.deepEqual(openStatus(lateNight, 'Europe/London', at('2026-01-12T18:00:00')), { isOpen: true, closesAt: '02:00', opensAt: null, opensDay: null });
  // 01:00 Tuesday is still inside Monday's 16:00–02:00 range.
  assert.equal(openStatus(lateNight, 'Europe/London', at('2026-01-13T01:00:00')).isOpen, true);
  // 03:00 Tuesday: closed, opens at 16:00 today.
  assert.deepEqual(openStatus(lateNight, 'Europe/London', at('2026-01-13T03:00:00')), { isOpen: false, closesAt: null, opensAt: '16:00', opensDay: 'today' });
  // 03:00 Wednesday: no Wednesday hours, next opening is Monday.
  assert.equal(openStatus(lateNight, 'Europe/London', at('2026-01-14T03:00:00')).opensDay, 'mon');
});

test('open status uses the venue time zone (British Summer Time)', () => {
  const hours = { mon: [['12:00', '13:00']] };
  // 2026-07-13 11:30 UTC is 12:30 in London.
  assert.equal(openStatus(hours, 'Europe/London', new Date('2026-07-13T11:30:00Z')).isOpen, true);
});

test('certificate status buckets', () => {
  const now = new Date('2026-03-01T12:00:00Z');
  assert.equal(verificationStatus('2026-06-01', now).status, 'verified');
  assert.equal(verificationStatus('2026-03-20', now).status, 'expiring');
  assert.equal(verificationStatus('2026-03-01', now).status, 'expiring'); // valid until end of day
  assert.equal(verificationStatus('2026-02-28', now).status, 'expired');
  assert.equal(verificationStatus(null, now).status, 'unverified');
});

test('distance and barcode helpers', () => {
  const london = { lat: 51.5074, lng: -0.1278 };
  const hull = { lat: 53.7446, lng: -0.3352 };
  const km = distanceKm(london, hull);
  assert.ok(km > 245 && km < 255, `got ${km}`);
  assert.equal(ean13('400638133393'), '4006381333931'); // a known valid EAN-13
});
