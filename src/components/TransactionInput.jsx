import React, { useRef, useState, useCallback } from 'react'

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
  const [fileName, setFileName] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onClassify(value)
  }

  const loadSample = () => {
    setValue(SAMPLE_JSON)
    setFileName(null)
  }

  const readFile = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      setValue(event.target.result)
      setFileName(file.name)
    }
    reader.onerror = () => {
      alert('Failed to read file.')
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) readFile(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.jsonl'))) {
      readFile(file)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">📝</div>
          Submit Transactions
        </div>
      </div>
      <p className="card-subtitle">
        Paste JSON array or JSONL below, or drag & drop a file. All transactions should share the same payer_id.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onClick={triggerFileSelect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="drop-zone-icon">📁</div>
          <div className="drop-zone-text">
            {isDragOver ? 'Drop file here' : 'Click or drag & drop to upload'}
          </div>
          <div className="drop-zone-hint">Supports .json and .jsonl files</div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.jsonl,application/json"
          className="file-input-hidden"
          onChange={handleFileChange}
        />

        {fileName && (
          <div className="file-loaded">
            <span>✅</span>
            <span>Loaded: {fileName}</span>
          </div>
        )}

        <div className="input-area">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste JSON array or JSONL here..."
          />
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="loading-spinner" />}
            <span>{loading ? 'Analyzing...' : 'Classify Transactions'}</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={loadSample}>
            <span>🔄</span>
            Load Sample
          </button>
        </div>
      </form>
    </div>
  )
}

export default TransactionInput
