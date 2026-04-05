import './Achievements.css'

export interface Achievement {
  id: number
  icon?: string
  title: string
}

interface AchievementsProps {
  achievements: Achievement[]
}

export const Achievements = ({ achievements }: AchievementsProps) => {
  return (
    <section className="achievements-section">
      <h3 className="achievements-title">Conquistas</h3>
      <div className="achievements-grid">
        {achievements.map((a) => (
          <div key={a.id} className="achievement-card">
            {a.icon && (
              <img
                src={a.icon}
                alt={a.title}
                className="achievement-icon"
              />
            )}
            <div className="achievement-title">{a.title}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Achievements
