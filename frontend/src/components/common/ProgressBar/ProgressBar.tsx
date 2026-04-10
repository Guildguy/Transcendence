import './ProgressBar.css'
import { normalizeGamificationState } from '../../../utils/gamificationLevels'

interface ProgressBarProps {
  currentXp: number
  nextLevelXp: number | null
  currentLevel: number
  size?: 'small' | 'medium' | 'large'
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
  const normalized = normalizeGamificationState({
    totalXp: currentXp,
    currentLevel,
    nextLevelXp,
  })

  const displayXp = normalized.totalXp
  const displayNextLevelXp = normalized.nextLevelXp
  const fillPercentage = displayNextLevelXp
    ? Math.min((displayXp / displayNextLevelXp) * 100, 100)
    : 100

  return (
    // <div className={`progress-bar progress-bar--${size}`}>
      <div className="progress-bar__track" data-size={size}>
        <div
          className="progress-bar__fill"
          style={{ width: `${fillPercentage}%` }}
        />
        <div className="progress-bar__label">
          {displayNextLevelXp
            ? `XP: ${Math.floor(displayXp)} / ${Math.floor(displayNextLevelXp)}`
            : `XP: ${Math.floor(displayXp)} / MAX`}
        </div>
      </div>
    // </div>
  )
}

export default ProgressBar
