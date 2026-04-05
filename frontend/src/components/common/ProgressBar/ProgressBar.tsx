import './ProgressBar.css'

interface ProgressBarProps {
  currentXp: number
  nextLevelXp: number | null
  currentLevel: number
  size?: 'small' | 'medium' | 'large'
}

// Level progression thresholds based on backend LevelMockConfig
const LEVEL_XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3000,
  5: 5000,
}

/**
 * ProgressBar Component
 * 
 * Displays XP progress within the current level as a visual bar.
 * Calculates fill percentage based on:
 * - XP earned in current level / Total XP required for current level
 * 
 * Example: Level 2 (500-1500 XP)
 * - User has 750 XP
 * - Progress: (750 - 500) / (1500 - 500) = 25%
 */
export const ProgressBar = ({
  currentXp,
  nextLevelXp,
  currentLevel,
  size = 'medium',
}: ProgressBarProps) => {
  // Get the XP threshold for the current level
  const currentLevelXpThreshold = LEVEL_XP_THRESHOLDS[currentLevel] || 0

  // Calculate XP progress within the current level
  const xpInCurrentLevel = currentXp - currentLevelXpThreshold
  const totalXpForCurrentLevel = (nextLevelXp || currentXp) - currentLevelXpThreshold

  // Calculate fill percentage
  const fillPercentage = Math.min(
    (xpInCurrentLevel / totalXpForCurrentLevel) * 100,
    100
  )

  return (
    // <div className={`progress-bar progress-bar--${size}`}>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${fillPercentage}%` }}
        />
        <div className="progress-bar__label">
          {`XP: ${Math.floor(xpInCurrentLevel)} / ${Math.floor(totalXpForCurrentLevel)}`}
        </div>
      </div>
    // </div>
  )
}

export default ProgressBar
