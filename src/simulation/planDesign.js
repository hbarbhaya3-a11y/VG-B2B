export function computeOutcomes(config) {
  return { medianBalance: 0, participationRate: 0, avgDeferral: 0 }
}

export function computeEffectiveMatch(matchConfig) {
  return 0
}

export function findParetoFrontier(scenarios) {
  return scenarios || []
}

export function gridCardinality(grid) {
  return grid ? Object.values(grid).reduce((a, v) => a * (Array.isArray(v) ? v.length : 1), 1) : 0
}
