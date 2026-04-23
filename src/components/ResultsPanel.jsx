import React from 'react'

/**
 * ResultsPanel
 * Displays classification results in a table, highlights fraud flags,
 * shows weighted risk scores on a 0–100 scale, and lists reason codes.
 * Also provides a CSV export button for flagged transactions.
 */
function ResultsPanel({ results, onExportCSV }) {
  if (!results || results.length === 0) {
    return (
      <div className="card">
        <h2>Results</h2>
        <div className="empty-state">No results yet. Submit transactions to see classification output.</div>
      </div>
    )
  }

  const flaggedCount = results.filter((r) => r.fraud_flag).length

  // Determine color class based on 0-100 weighted risk score
  const scoreClass = (score100) => {
    if (score100 >= 70) return 'score-high'
    if (score100 >= 40) return 'score-mid'
    return 'score-low'
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2>Results ({results.length} transactions)</h2>
        <button className="btn-export" onClick={onExportCSV}>
          Export Flagged CSV
        </button>
      </div>

      {flaggedCount > 0 && (
        <div className="alert-banner">
          <span className="alert-icon">🚩</span>
          <span>
            <strong>{flaggedCount}</strong> transaction{flaggedCount > 1 ? 's' : ''} flagged as fraudulent.
          </span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Risk Score (0-100)</th>
              <th>Flag</th>
              <th>Reason Codes</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const score100 = Math.round((r.risk_score || 0) * 100)
              return (
                <tr key={r.transaction_id || idx}>
                  <td>{r.transaction_id || '-'}</td>
                  <td>
                    <span className={`score-pill ${scoreClass(score100)}`}>{score100}</span>
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
                      <span style={{ color: '#a0aec0' }}>None</span>
                    ) : (
                      (r.reason_codes || []).map((code, i) => (
                        <span className="reason-tag" key={i}>
                          {code}
                        </span>
                      ))
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
