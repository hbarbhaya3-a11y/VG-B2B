export function getDominantJob(needStates = []) {
  if (!needStates.length) return null
  return needStates.reduce((a, b) => (a.count > b.count ? a : b), needStates[0])
}
