export const GLOSSARY = {}

export const VESTING_CURVES = {
  immediate: [1, 1, 1, 1, 1, 1],
  graded3: [0, 0.33, 0.67, 1, 1, 1],
  graded6: [0, 0, 0.2, 0.4, 0.6, 0.8, 1],
  cliff3: [0, 0, 0, 1, 1, 1],
}

export const VESTING_LABELS = {
  immediate: 'Immediate',
  graded3: '3-Year Graded',
  graded6: '6-Year Graded',
  cliff3: '3-Year Cliff',
}
