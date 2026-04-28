


// const getStartEndOfDay = (timeZone = "UTC", inputDate?: Date) => {
//   const base = inputDate ? new Date(inputDate) : new Date();

//   // 1️⃣ Convert to user timezone
//   const localStr = base.toLocaleString("en-US", { timeZone });
//   const localDate = new Date(localStr);

//   // 2️⃣ Start of day
//   const startLocal = new Date(localDate);
//   startLocal.setHours(0, 0, 0, 0);

//   // 3️⃣ End of day
//   const endLocal = new Date(localDate);
//   endLocal.setHours(23, 59, 59, 999);

//   // 4️⃣ Convert back to UTC
//   const startUTC = new Date(
//     startLocal.toLocaleString("en-US", { timeZone: "UTC" })
//   );

//   const endUTC = new Date(
//     endLocal.toLocaleString("en-US", { timeZone: "UTC" })
//   );

//   return { start: startUTC, end: endUTC };
// };


const getStartEndOfDay = (timeZone = "UTC", inputDate?: Date) => {
  const base = inputDate ? new Date(inputDate) : new Date();

  // 1️⃣ Get date parts in target timezone (safe way)
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(base);
  const map: any = {};

  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = p.value;
    }
  }

  // 2️⃣ Build UTC timestamp from timezone date
  const localAsUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );

  // 3️⃣ Calculate offset
  const offset = localAsUTC - base.getTime();

  // 4️⃣ Start of day (timezone)
  const startLocalUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    0, 0, 0, 0
  );

  // 5️⃣ End of day (timezone)
  const endLocalUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    23, 59, 59, 999
  );

  // 6️⃣ Convert to real UTC
  const start = new Date(startLocalUTC - offset);
  const end = new Date(endLocalUTC - offset);

  // 7️⃣ Clean milliseconds
  start.setMilliseconds(0);
  end.setMilliseconds(999);

  return { start, end };
};

export default getStartEndOfDay;



