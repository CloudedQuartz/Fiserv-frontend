import React from 'react'

const STAT_CONFIG = [
  { key: 'totalTxns', label: 'Total Transactions', icon: '📊', color: 'blue' },
  { key: 'flaggedTxns', label: 'Flagged', icon: '🚩', color: 'red' },
  { key: 'avgRiskScore', label: 'Avg Risk Score', icon: '⚡', color: 'yellow', format: (v) => Math.round(v * 100) },
  { key: 'highVelocityCount', label: 'High Velocity', icon: '⚠️', color: 'purple' },
  { key: 'midnightCount', label: 'Midnight Events', icon: '🌙', color: 'purple' },
]

function StatsBar({ history }) {
  const { totalTxns, flaggedTxns, avgRiskScore, highVelocityCount, midnightCount } = history

  const values = { totalTxns, flaggedTxns, avgRiskScore, highVelocityCount, midnightCount }

  return (
    <div className="stats-grid fade-in">
      {STAT_CONFIG.map((stat) => {
        const rawValue = values[stat.key]
        const displayValue = stat.format ? stat.format(rawValue) : rawValue

        return (
          <div className={`stat-card ${stat.color}`} key={stat.key}>
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            </div>
            <div className="stat-value">{displayValue}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsBar
