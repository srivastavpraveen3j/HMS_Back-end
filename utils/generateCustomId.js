import Counter from "../models/counter.js";

/**
 * 🔹 Legacy (non-persistent) ID generator using in-memory counter.
 * @param {string} prefix - Identifier like 'IPD', 'UHID'
 * @param {number} currentCounter - Current in-memory count
 */
function generateCustomId(prefix, currentCounter) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const mmYY = `${mm}${yy}`;

  if (yy) {
    const counter = String(currentCounter).padStart(4, "0");
    currentCounter += 1;
    return `${prefix}/${mmYY}/${counter}`;
  } else {
    currentCounter = 1;
    return `${prefix}/${mmYY}/0001`;
  }
}


export function generateMonthlyMaterialRequestId(prefix, currentCounter) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0"); // Month: "07"
  const yy = String(now.getFullYear()).slice(-2);         // Year: "24"
  const mmYY = `${mm}${yy}`;                              // "0724"
  const counter = String(currentCounter).padStart(4, "0"); // "0003"

  return `${prefix}/${mmYY}/${counter}`; // e.g. INVENTORY/0724/0003
}


/**
 * 🔒 Persistent, MongoDB-backed ID generator using transaction-safe counters.
 * @param {string} prefix - Identifier like 'IPD', 'UHID'
 * @param {mongoose.ClientSession} session - Mongoose transaction session
 */
async function generatePersistentCustomId(prefix, session) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const mmYY = `${mm}${yy}`;

  const existing = await Counter.findOne({ module: prefix, year: mmYY }).session(session);
  const currentValue = existing ? existing.value + 1 : 1;

  const counterStr = String(currentValue).padStart(4, "0");
  const formattedId = `${prefix}/${mmYY}/${counterStr}`;

  await Counter.findOneAndUpdate(
    { module: prefix, year: mmYY },
    {
      $set: { lastBillNo: formattedId },
      $inc: { value: 1 }
    },
    {
      new: true,
      upsert: true,
      session
    }
  );

  return formattedId;
}

export { generateCustomId, generatePersistentCustomId };
