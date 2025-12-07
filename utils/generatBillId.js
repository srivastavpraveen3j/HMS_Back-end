import Counter from "../models/counter.js";
export async function generateBillId(moduleName, session) {
  const now = new Date();
  const currentYY = String(now.getFullYear()).slice(-2);
  const nextYY = String(now.getFullYear() + 1).slice(-2);
  const yearKey = `${currentYY}${nextYY}`;

  // Step 1: Pre-read counter value (or set 0 if not found)
  const existing = await Counter.findOne({ module: moduleName, year: yearKey }).session(session);
  const currentValue = existing ? existing.value + 1 : 1;

  const counterStr = String(currentValue).padStart(4, "0");
  const billNumber = `${yearKey}/${counterStr}`;

  // Step 2: Atomic update with new value and lastBillNo
  await Counter.findOneAndUpdate(
    { module: moduleName, year: yearKey },
    {
      $set: { lastBillNo: billNumber },
      $inc: { value: 1 }
    },
    {
      new: true,
      upsert: true,
      session
    }
  );

  return billNumber;
}