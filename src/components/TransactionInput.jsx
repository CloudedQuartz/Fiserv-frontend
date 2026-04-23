import React, { useState } from 'react'

/**
 * TransactionInput
 * Provides a textarea for users to paste JSON array or JSONL transactions,
 * and a button to submit them for classification.
 */
const SAMPLE_JSON = `[
  {
    "payer_id": "9988776655",
    "payee_id": "MERCHANT121",
    "amount": 9500,
    "timestamp": "2026-02-10T12:30:45",
    "location": "Delhi",
    "device_id": "ABC123",
    "transaction_id": "tx001"
  },
  {
    "payer_id": "9988776655",
    "payee_id": "MERCHANT122",
    "amount": 15000,
    "timestamp": "2026-02-10T12:31:15",
    "location": "Delhi",
    "device_id": "ABC123",
    "transaction_id": "tx002"
  }
]`

function TransactionInput({ onClassify, loading, error }) {
  const [value, setValue] = useState(SAMPLE_JSON)

  const handleSubmit = (e) => {
    e.preventDefault()
    onClassify(value)
  }

  const loadSample = () => {
    setValue(SAMPLE_JSON)
  }

  return (
    <div className="card">
      <h2>Submit Transactions</h2>
      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: 10 }}>
        Paste a JSON array or JSONL (one object per line). All transactions should share the same payer_id.
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Paste JSON array or JSONL here...`}
        />
        {error && <div className="error-text">Error: {error}</div>}
        <div className="actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Classifying...' : 'Classify'}
          </button>
          <button type="button" className="btn-secondary" onClick={loadSample}>
            Load Sample
          </button>
        </div>
      </form>
    </div>
  )
}

export default TransactionInput
