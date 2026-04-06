// Auto-updating career metrics — recalculated on every page load.
// Rules:
//   yearsExp  → +1 every year  since Jan 2023
//   appCount  → base 5 at Jan 2023, +1 every 2 months
//   userCount → base 1,000 at Jan 2023, +100 every 2 months

const EXP_START  = new Date("2023-01-01");
const APPS_BASE  = 5;
const USERS_BASE = 1000;

const now = new Date();

const monthsSinceBase =
  (now.getFullYear() - EXP_START.getFullYear()) * 12 +
  (now.getMonth()    - EXP_START.getMonth());

export const yearsExp  = Math.floor((now - EXP_START) / (365.25 * 24 * 60 * 60 * 1000));
export const appCount  = APPS_BASE + Math.floor(monthsSinceBase / 2);
export const userCount = USERS_BASE + Math.floor(monthsSinceBase / 2) * 100;

/** e.g. "3+" */
export const yearsExpLabel = `${yearsExp}+`;
/** e.g. "24+" */
export const appCountLabel = `${appCount}+`;
/** e.g. "2,900+" */
export const userCountLabel = `${userCount.toLocaleString()}+`;
