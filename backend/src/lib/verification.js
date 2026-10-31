/** Certificates within this many days of expiry are flagged as "expiring". */
const EXPIRING_WINDOW_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

/**
 * verified  — certificate current for more than 30 days
 * expiring  — current, but within 30 days of expiry
 * expired   — past its expiry date
 * unverified — no certificate on record
 */
function verificationStatus(expiresOn, now = new Date()) {
  if (!expiresOn) return { status: 'unverified', daysRemaining: null };
  const endOfExpiryDay = Date.parse(`${expiresOn}T23:59:59Z`);
  const daysRemaining = Math.floor((endOfExpiryDay - now.getTime()) / DAY);
  if (daysRemaining < 0) return { status: 'expired', daysRemaining };
  if (daysRemaining <= EXPIRING_WINDOW_DAYS) return { status: 'expiring', daysRemaining };
  return { status: 'verified', daysRemaining };
}

/** Builds the certification block shared by restaurants and products. */
function certificationFromRow(row, now) {
  const { status, daysRemaining } = verificationStatus(row.cert_expires, now);
  return {
    status,
    daysRemaining,
    number: row.cert_number || null,
    expiresOn: row.cert_expires || null,
    lastVerified: row.last_verified || null,
    certifier: row.certifier_id
      ? { id: row.certifier_id, name: row.certifier_name, shortName: row.certifier_short_name }
      : null,
  };
}

const isCurrent = (status) => status === 'verified' || status === 'expiring';

module.exports = { verificationStatus, certificationFromRow, isCurrent, EXPIRING_WINDOW_DAYS };
