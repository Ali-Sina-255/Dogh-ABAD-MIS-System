import moment from "moment-jalaali";
moment.loadPersian({ dialect: "persian-modern" });

/* =========================
   Persian Months
========================= */
export const PERSIAN_MONTHS = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

/* =========================
   Convert Persian digits → English
========================= */
export const persianToEnglishDigits = (persian) =>
  persian.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));

/* =========================
   Current Jalali Month Index
========================= */
export const getCurrentJalaliMonthIndex = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("fa-AF-u-ca-persian", {
    month: "numeric",
  });
  const monthStr = formatter.format(now);
  const monthNum = Number(persianToEnglishDigits(monthStr));
  return (monthNum || 1) - 1;
};

/* =========================
   Current Jalali Month Name
========================= */
export const getCurrentJalaliMonth = () =>
  PERSIAN_MONTHS[getCurrentJalaliMonthIndex()];

/* =========================
   Get Jalali month from any date
========================= */
export const getJalaliMonthFromDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("fa-AF-u-ca-persian", {
    month: "numeric",
  });
  const monthStr = formatter.format(date);
  const monthIndex = Number(persianToEnglishDigits(monthStr)) - 1;
  return PERSIAN_MONTHS[monthIndex] || "";
};

/* =========================
   Full Jalali date (e.g., 01 جدی 1404)
========================= */
export const getFullJalaliDate = (dateStr) => {
  if (!dateStr) return "-";
  return moment(dateStr).format("jYYYY/jMM/jDD");
};

 

/* =========================
   Get start date (YYYY-MM-DD) from Jalali month name
========================= */
export const getStartDateFromJalaliMonth = (
  monthName,
  year = new Date().getFullYear()
) => {
  const monthIndex = PERSIAN_MONTHS.indexOf(monthName);
  if (monthIndex === -1) return null;
  const gregorianMonth = monthIndex + 1;
  const monthStr = gregorianMonth.toString().padStart(2, "0");
  return `${year}-${monthStr}-01`;
};

/* =========================
   Get next Jalali month
========================= */
export const getNextJalaliMonth = (currentMonth) => {
  const index = PERSIAN_MONTHS.indexOf(currentMonth);
  if (index === -1) return PERSIAN_MONTHS[0];
  return PERSIAN_MONTHS[(index + 1) % PERSIAN_MONTHS.length];
};

/* =========================
   Format time with period (MORNING/AFTERNOON)
========================= */
export const formatTimeWithPeriod = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours < 12 ? "MORNING" : "AFTERNOON";
  const displayHour = hours % 12 || 12;
  return `${period}: ${displayHour}:${minutes}`;
};
