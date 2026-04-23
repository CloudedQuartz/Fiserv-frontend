import React, { useEffect, useState } from 'react'
import TransactionInput from './components/TransactionInput'
import ResultsPanel from './components/ResultsPanel'
import StatsBar from './components/StatsBar'

// Base API URL; Vite proxy handles /api -> localhost:8000 in dev.
// For production builds, update this to your deployed backend URL.
const API_BASE = import.meta.env.DEV ? '/api' : 'http://localhost:8000'

/**
 * App Component
 * Orchestrates the UPI Fraud Dashboard:
 * - Health check on mount
 * - Transaction submission to /classify
 * - Historical pattern tracking (simple counters, no ML)
 * - CSV export of flagged transactions
 */
function App() {
  const [health, setHealth] = useState(null) // { status, service }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Current classification results
  const [results, setResults] = useState([])

  // Historical patterning: simple counters across all sessions
  const [history, setHistory] = useState({
    totalTxns: 0,
    flaggedTxns: 0,
    totalRiskSum: 0, // accumulated raw risk_score (0-1)
    totalAmount: 0,
    avgRiskScore: 0,
    highVelocityCount: 0,
    midnightCount: 0,
  })

  // Check backend health on load
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'unreachable', service: 'UPI Fraud Classifier' }))
  }, [])

  /**
   * Submit transactions to the backend for classification.
   * Accepts JSON array or JSONL string.
   */
  const handleClassify = async (rawInput) => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const trimmed = rawInput.trim()
      if (!trimmed) {
        throw new Error('Input is empty.')
      }

      // Determine if JSON array or JSONL by first non-whitespace char
      const isJsonArray = trimmed.startsWith('[')
      const body = trimmed

      const res = await fetch(`${API_BASE}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': isJsonArray ? 'application/json' : 'application/x-jsonlines',
        },
        body,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResults(data)

      // Update historical counters (simple patterning)
      updateHistory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update simple historical counters based on new results.
   * No ML — just counts and averages for basic patterning.
   */
  const updateHistory = (newResults) => {
    setHistory((prev) => {
      const addedFlagged = newResults.filter((r) => r.fraud_flag).length
      const addedRiskSum = newResults.reduce((sum, r) => sum + (r.risk_score || 0), 0)

      // Count specific reason codes for patterning
      const highVelocity = newResults.filter((r) =>
        (r.reason_codes || []).some((code) => code.includes('High Velocity'))
      ).length
      const midnight = newResults.filter((r) =>
        (r.reason_codes || []).some((code) => code.includes('Midnight'))
      ).length

      const totalTxns = prev.totalTxns + newResults.length
      const flaggedTxns = prev.flaggedTxns + addedFlagged
      const totalRiskSum = prev.totalRiskSum + addedRiskSum
      const avgRiskScore = totalTxns > 0 ? totalRiskSum / totalTxns : 0

      return {
        totalTxns,
        flaggedTxns,
        totalRiskSum,
        totalAmount: prev.totalAmount, // not tracked per result from backend; placeholder
        avgRiskScore,
        highVelocityCount: prev.highVelocityCount + highVelocity,
        midnightCount: prev.midnightCount + midnight,
      }
    })
  }

  /**
   * Export flagged transactions from current results to CSV.
   */
  const handleExportCSV = () => {
    const flagged = results.filter((r) => r.fraud_flag)
    if (flagged.length === 0) {
      alert('No flagged transactions to export.')
      return
    }

    // CSV header
    const headers = ['transaction_id', 'risk_score_0_100', 'fraud_flag', 'reason_codes']
    const rows = flagged.map((r) => [
      r.transaction_id || '',
      Math.round((r.risk_score || 0) * 100),
      r.fraud_flag ? 'YES' : 'NO',
      (r.reason_codes || []).join('; '),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flagged_transactions_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isHealthy = health && health.status === 'healthy'

  return (
    <div className="container">
      <header>
        <h1>UPI Fraud Dashboard</h1>
        <p>Minimal React frontend for heuristic fraud classification</p>
        {health && (
          <div className={`status-badge ${isHealthy ? 'healthy' : 'unhealthy'}`}>
            <span>{isHealthy ? '●' : '●'}</span>
            <span>
              Backend {isHealthy ? 'Healthy' : 'Unreachable'} — {health.service}
            </span>
          </div>
        )}
      </header>

      {history.totalTxns > 0 && <StatsBar history={history} />}

      <TransactionInput onClassify={handleClassify} loading={loading} error={error} />

      <ResultsPanel results={results} onExportCSV={handleExportCSV} />
    </div>
  )
}

export default App
