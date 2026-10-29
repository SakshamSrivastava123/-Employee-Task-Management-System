const DAY_MS = 24 * 60 * 60 * 1000;

// "Today" as a UTC-midnight Date, shifted by TIMEZONE_OFFSET_MINUTES so
// overdue checks follow the business's local calendar day.
function todayStart() {
  const offset = Number(process.env.TIMEZONE_OFFSET_MINUTES || 0);
  const now = new Date(Date.now() + offset * 60 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);
const toDateString = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);

module.exports = { todayStart, addDays, toDateString };
