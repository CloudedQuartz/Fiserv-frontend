import React from 'react'

/**
 * StatsBar
 * Shows basic historical patterning using simple counters.
 * No ML — just aggregates from all classified batches in the current session.
 */
function StatsBar({ history }) {
  const {
    totalTxns,
    flaggedTxns,
    avgRiskScore,
    highVelocityCount,
    midnightCount,
  } = history

  const stats = [
    { label: 'Total Transactions', value: totalTxns },
    { label: 'Flagged Transactions', value: flaggedTxns },
    {
      label: 'Avg Risk Score (0-100)',
      value: totalTxns > 0 ? Math.round(avgRiskScore * 100) : 0,
    },
    { label: 'High Velocity Events', value: highVelocityCount },
    { label: 'Midnight Hour Events', value: midnightCount },
  ]

  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <div className="stat-box" key={s.label}>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

export default StatsBar
