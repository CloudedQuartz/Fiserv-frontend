import React, { useEffect, useState } from 'react'
import TransactionInput from './components/TransactionInput'
import ResultsPanel from './components/ResultsPanel'
import StatsBar from './components/StatsBar'

const API_BASE = import.meta.env.DEV ? '/api' : 'http://localhost:8000'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])
  const [history, setHistory] = useState({
    totalTxns: 0,
    flaggedTxns: 0,
    totalRiskSum: 0,
    totalAmount: 0,
    avgRiskScore: 0,
    highVelocityCount: 0,
    midnightCount: 0,
  })

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'unreachable', service: 'UPI Fraud Classifier' }))
  }, [])

  const handleClassify = async (rawInput) => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const trimmed = rawInput.trim()
      if (!trimmed) throw new Error('Input is empty.')

      const isJsonArray = trimmed.startsWith('[')
      const res = await fetch(`${API_BASE}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': isJsonArray ? 'application/json' : 'application/x-jsonlines',
        },
        body: trimmed,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResults(data)
      updateHistory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateHistory = (newResults) => {
    setHistory((prev) => {
      const addedFlagged = newResults.filter((r) => r.fraud_flag).length
      const addedRiskSum = newResults.reduce((sum, r) => sum + (r.risk_score || 0), 0)
      const highVelocity = newResults.filter((r) =>
        (r.reason_codes || []).some((code) => code.includes('High Velocity'))
      ).length
      const midnight = newResults.filter((r) =>
        (r.reason_codes || []).some((code) => code.includes('Midnight'))
      ).length

      const totalTxns = prev.totalTxns + newResults.length
      const totalRiskSum = prev.totalRiskSum + addedRiskSum
      return {
        totalTxns,
        flaggedTxns: prev.flaggedTxns + addedFlagged,
        totalRiskSum,
        totalAmount: prev.totalAmount,
        avgRiskScore: totalTxns > 0 ? totalRiskSum / totalTxns : 0,
        highVelocityCount: prev.highVelocityCount + highVelocity,
        midnightCount: prev.midnightCount + midnight,
      }
    })
  }

  const handleExportCSV = () => {
    const flagged = results.filter((r) => r.fraud_flag)
    if (flagged.length === 0) {
      alert('No flagged transactions to export.')
      return
    }

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
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">🛡️</div>
          <div className="brand-text">
            <h1>UPI Fraud Shield</h1>
            <p>Real-time Transaction Risk Analysis</p>
          </div>
        </div>
        <div className="header-status">
          {health && (
            <div className={`status-indicator ${isHealthy ? 'healthy' : 'unhealthy'}`}>
              <span className="status-dot" />
              <span>{isHealthy ? 'System Online' : 'Offline'}</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {history.totalTxns > 0 && <StatsBar history={history} />}

        <TransactionInput onClassify={handleClassify} loading={loading} error={error} />

        <ResultsPanel results={results} onExportCSV={handleExportCSV} />
      </main>
    </div>
  )
}

export default App
