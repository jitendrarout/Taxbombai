/**
 * IRS Uniform Lifetime Table (Table III), Treasury Reg. §1.401(a)(9)-9,
 * reproduced in IRS Publication 590-B, Appendix B.
 *
 * Divisors below took effect January 1, 2022 and remain in force as of
 * this writing. Treasury periodically updates mortality-based tables
 * (roughly once a decade) — verify against the current Pub 590-B before
 * relying on this for a real filing or client recommendation.
 *
 * Applies to: account owners who have reached their Required Beginning
 * Date and whose sole beneficiary is not a spouse more than 10 years
 * younger (use the Joint Life table in that case — not included here).
 */
const UNIFORM_LIFETIME_TABLE = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5,  95: 8.9,  96: 8.4,  97: 7.8,  98: 7.3,  99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
  107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0,
};

/**
 * Current SECURE 2.0 RMD required-beginning age.
 * Age 73 applies to those born 1951-1959; rises to 75 for those born
 * 1960 or later. This module defaults to 73 — pass a different value
 * explicitly for clients born 1960+.
 */
const DEFAULT_RMD_START_AGE = 73;

function getDivisor(age) {
  if (age < 72) return null;
  const cappedAge = Math.min(age, 120);
  return UNIFORM_LIFETIME_TABLE[cappedAge] ?? UNIFORM_LIFETIME_TABLE[120];
}

module.exports = { UNIFORM_LIFETIME_TABLE, DEFAULT_RMD_START_AGE, getDivisor };
