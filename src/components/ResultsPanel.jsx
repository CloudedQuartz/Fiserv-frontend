import React from 'react'

function ResultsPanel({ results, onExportCSV }) {
  if (!results || results.length === 0) {
    return (
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">📋</div>
            Classification Results
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No results yet</div>
          <div className="empty-state-text">
            Submit transactions to see real-time fraud classification and risk analysis.
          </div>
        </div>
      </div>
    )
  }

  const flaggedCount = results.filter((r) => r.fraud_flag).length

  const getScoreClass = (score100) => {
    if (score100 >= 70) return 'score-high'
    if (score100 >= 40) return 'score-mid'
    return 'score-low'
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">📋</div>
          Results ({results.length} transactions)
        </div>
        <button className="btn btn-export" onClick={onExportCSV}>
          <span>⬇️</span>
          Export CSV
        </button>
      </div>

      {flaggedCount > 0 && (
        <div className={`alert-banner ${flaggedCount > 2 ? 'danger' : ''}`}>
          <span className="alert-icon">🚨</span>
          <div className="alert-content">
            <div className="alert-title">
              {flaggedCount} transaction{flaggedCount > 1 ? 's' : ''} flagged
            </div>
            <div className="alert-text">
              Review the flagged transactions below for potential fraudulent activity.
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Triggered Rules</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const score100 = Math.round((r.risk_score || 0) * 100)
              const scoreClass = getScoreClass(score100)

              return (
                <tr key={r.transaction_id || idx}>
                  <td>
                    <span className="txn-id">{r.transaction_id || '-'}</span>
                  </td>
                  <td>
                    <div className={`score-cell ${scoreClass}`}>
                      <div className="score-bar-bg">
                        <div
                          className="score-bar-fill"
                          style={{ width: `${score100}%` }}
                        />
                      </div>
                      <span className="score-value">{score100}</span>
                    </div>
                  </td>
                  <td>
                    {r.fraud_flag ? (
                      <span className="badge badge-flagged">FLAGGED</span>
                    ) : (
                      <span className="badge badge-safe">SAFE</span>
                    )}
                  </td>
                  <td>
                    {(r.reason_codes || []).length === 0 ? (
                      <span style={{ color: 'var(--text-tertiary)' }}>No rules triggered</span>
                    ) : (
                      <div className="reason-tags">
                        {(r.reason_codes || []).map((code, i) => (
                          <span className="reason-tag" key={i}>
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultsPanel
