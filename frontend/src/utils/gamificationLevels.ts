const LEVEL_XP_THRESHOLDS: Array<{ level: number; xpRequired: number }> = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 500 },
  { level: 3, xpRequired: 1500 },
  { level: 4, xpRequired: 3000 },
  { level: 5, xpRequired: 5000 },
]

function sanitizeXp(totalXp: number | null | undefined): number {
  if (typeof totalXp !== 'number' || Number.isNaN(totalXp) || totalXp < 0) {
    return 0
  }
  return totalXp
}

export function deriveLevelFromTotalXp(totalXp: number): number {
  let currentLevel = 1

  for (const threshold of LEVEL_XP_THRESHOLDS) {
    if (totalXp >= threshold.xpRequired) {
      currentLevel = threshold.level
    }
  }

  return currentLevel
}

export function deriveNextLevelXp(totalXp: number): number | null {
  for (const threshold of LEVEL_XP_THRESHOLDS) {
    if (totalXp < threshold.xpRequired) {
      return threshold.xpRequired
    }
  }

  return null
}

export function normalizeGamificationState(params: {
  totalXp?: number | null
  currentLevel?: number | null
  nextLevelXp?: number | null
}) {
  const totalXp = sanitizeXp(params.totalXp)
  const derivedLevel = deriveLevelFromTotalXp(totalXp)
  const derivedNextLevelXp = deriveNextLevelXp(totalXp)

  return {
    totalXp,
    currentLevel: params.currentLevel === derivedLevel ? params.currentLevel : derivedLevel,
    nextLevelXp: params.nextLevelXp === derivedNextLevelXp ? params.nextLevelXp : derivedNextLevelXp,
  }
}
