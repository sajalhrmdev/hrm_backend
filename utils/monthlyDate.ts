import getStartEndOfDay from "./getStartEndOfDay.js";

const getStartEndOfMonth = (
  timeZone = "Asia/Kolkata",
  year: number,
  month: number
) => {
  // 1️⃣ First day
  const firstDay = new Date(year, month - 1, 1);

  // 2️⃣ Last day
  const lastDay = new Date(year, month, 0);

  // 3️⃣ Reuse your function 🔥
  const { start } = getStartEndOfDay(timeZone, firstDay);
  const { end } = getStartEndOfDay(timeZone, lastDay);

  return { start, end };
};
export default getStartEndOfMonth