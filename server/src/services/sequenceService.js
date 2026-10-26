import { Counter } from '../models/Counter.js';

/**
 * Atomically generates the next unique Case ID for the current year.
 * Example output: AICTE-2026-00001
 */
export async function getNextCaseId() {
  const currentYear = new Date().getFullYear();
  const counterName = `complaint_case_id_${currentYear}`;

  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(5, '0');
  return `AICTE-${currentYear}-${paddedSeq}`;
}
