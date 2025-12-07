// utils/triageEngine.js

const priorityBands = [
  { min: 8, max: 12, level: "Critical", icon: "🚨" },
  { min: 5, max: 7, level: "High", icon: "⚠️" },
  { min: 2, max: 4, level: "Medium", icon: "⏳" },
  { min: 0, max: 1, level: "Low", icon: "🙂" },
];

/**
 * Calculate score based on vitals + modifiers
 */
function calculateScore(vitals = {}, modifiers = {}) {
  let score = 0;
  const reasons = [];

  // Respiratory rate
  if (vitals.rr) {
    if (vitals.rr < 10 || vitals.rr > 24) {
      score += 2;
      reasons.push(`RR ${vitals.rr}/min (+2)`);
    }
  }

  // SpO2
  if (vitals.spo2) {
    if (vitals.spo2 < 94) {
      score += 2;
      reasons.push(`SpO₂ ${vitals.spo2}% (+2)`);
    }
  }

  // Systolic BP
  if (vitals.sbp) {
    if (vitals.sbp < 100) {
      score += 2;
      reasons.push(`SBP ${vitals.sbp} mmHg (+2)`);
    }
  }

  // HR
  if (vitals.hr) {
    if (vitals.hr < 50 || vitals.hr > 110) {
      score += 1;
      reasons.push(`HR ${vitals.hr}/min (+1)`);
    }
  }

  // Temp
  if (vitals.tempC) {
    if (vitals.tempC < 36 || vitals.tempC > 38) {
      score += 1;
      reasons.push(`Temp ${vitals.tempC}°C (+1)`);
    }
  }

  // Modifiers
  if (modifiers.ageYears && modifiers.ageYears > 65) {
    score += 1;
    reasons.push(`Age ${modifiers.ageYears} (+1)`);
  }
  if (modifiers.comorbidities && modifiers.comorbidities.length > 0) {
    score += 1;
    reasons.push(`Comorbidities present (+1)`);
  }
  if (modifiers.infectionRedFlags) {
    score += 1;
    reasons.push(`Infection red flags (+1)`);
  }

  return { score, reasons };
}

/**
 * Check for life-threatening hard overrides
 */
function checkOverrides(vitals = {}, modifiers = {}) {
  if (vitals.spo2 && vitals.spo2 < 90) return true;
  if (vitals.sbp && vitals.sbp < 90) return true;
  if (vitals.hr && (vitals.hr < 40 || vitals.hr > 130)) return true;
  if (modifiers.activeSeizure || modifiers.massiveBleeding || modifiers.severeDyspnea) return true;
  return false;
}

/**
 * Final triage computation
 */
function computePriority(vitals, modifiers) {
  const { score, reasons } = calculateScore(vitals, modifiers);
  const override = checkOverrides(vitals, modifiers);

  let priority = "Low";
  let icon = "🙂";

  for (const band of priorityBands) {
    if (score >= band.min && score <= band.max) {
      priority = band.level;
      icon = band.icon;
      break;
    }
  }

  if (override || score >= 12) {
    priority = "Critical";
    icon = "🚨";
  }

  return { score, priority, icon, reasons, override };
}

module.exports = {
  computePriority,
  calculateScore,
  checkOverrides,
};
