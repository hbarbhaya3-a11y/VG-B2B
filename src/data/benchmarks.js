// Vanguard TwinX — Industry & peer benchmark reference data
// Used in BenchmarkPanel section of PlanDesignParetoPanel (step 2)
// All peer data is illustrative — sourced from public Form 5500 filings

export const benchmarks = {
  sectors: {
    technology: {
      participationRate: { median: 0.83, q1: 0.91, q3: 0.74 },
      avgDeferralRate:    { median: 0.072, q1: 0.085, q3: 0.061 },
      matchEffectiveRate: { median: 0.045, q1: 0.060, q3: 0.035 },
      autoEnrollmentAdoption: 0.78,
      autoEscalationAdoption: 0.71,    // PSCA 2024
      avgExpenseRatio:    { median: 0.0018, q1: 0.0008, q3: 0.0031 },
    },
  },

  peers: [
    {
      id: 'peer-accenture-us',
      name: 'Accenture US 401(k) Plan',
      label: 'Illustrative — based on public Form 5500 data',
      participationRate: 0.92,
      matchEffectiveRate: 0.060,
      autoEnrollment: true,
      vestingSchedule: 'immediate',
      avgExpenseRatio: 0.0008,
      competitiveTier: 'Q1',
    },
    {
      id: 'peer-cognizant-us',
      name: 'Cognizant 401(k) Plan',
      label: 'Illustrative — based on public Form 5500 data',
      participationRate: 0.85,
      matchEffectiveRate: 0.050,
      autoEnrollment: true,
      vestingSchedule: '1-year cliff',
      avgExpenseRatio: 0.0011,
      competitiveTier: 'Q1',
    },
    {
      id: 'peer-infosys-us',
      name: 'Infosys BPO Americas 401(k)',
      label: 'Illustrative — based on public Form 5500 data',
      participationRate: 0.79,
      matchEffectiveRate: 0.040,
      autoEnrollment: true,
      vestingSchedule: '2-year cliff',
      avgExpenseRatio: 0.0014,
      competitiveTier: 'Q2',
    },
    {
      id: 'peer-wipro-us',
      name: 'Wipro Technologies US 401(k)',
      label: 'Illustrative — based on public Form 5500 data',
      participationRate: 0.74,
      matchEffectiveRate: 0.035,
      autoEnrollment: false,
      vestingSchedule: '3-year cliff',
      avgExpenseRatio: 0.0022,
      competitiveTier: 'Q3',
    },
  ],

  secure2: {
    studentLoanMatchAdoption: 0.12,
    emergencySavingsAdoption: 0.08,
  },

  attribution: {
    sources: ['DOL Form 5500 public filings (2024)', 'Vanguard How America Saves 2025', 'PSCA 67th Annual Survey'],
    note: 'Peer data is illustrative — directional estimates derived from publicly available filings. Not for fiduciary attestation.',
  },
}

// Convenience: tech-sector summary for a quick header chip
export function techSectorSummary() {
  const t = benchmarks.sectors.technology
  return {
    p50Participation: t.participationRate.median,
    p50EffectiveMatch: t.matchEffectiveRate.median,
    autoEnrollAdopt: t.autoEnrollmentAdoption,
  }
}
