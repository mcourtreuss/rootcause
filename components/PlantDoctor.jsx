'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Camera,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Sun,
  Heart,
  Bug,
  Leaf,
  RefreshCw,
} from 'lucide-react'
import DiseaseReference from '@/components/DiseaseReference'

const SEVERITY_COLORS = {
  Low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-red-100 text-red-800 border-red-200',
}

const HEALTH_COLORS = {
  Healthy: { bg: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  'Mild Issues': { bg: 'bg-yellow-500', text: 'text-yellow-700', ring: 'ring-yellow-200' },
  'Moderate Issues': { bg: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-200' },
  'Severe Issues': { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-200' },
  Critical: { bg: 'bg-red-700', text: 'text-red-800', ring: 'ring-red-300' },
}

function HealthScoreRing({ score, overallHealth }) {
  const colors = HEALTH_COLORS[overallHealth] || HEALTH_COLORS['Moderate Issues']
  const pct = (score / 10) * 100
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e5e4" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colors.text}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-stone-800">{score}</span>
          <span className="text-[10px] text-stone-500 font-medium">/10</span>
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.bg} text-white`}
      >
        {overallHealth}
      </span>
    </div>
  )
}

export default function PlantDoctor() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [diagnosis, setDiagnosis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20 MB')
      return
    }

    setError(null)
    setDiagnosis(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target.result)
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer?.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDiagnose = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    setDiagnosis(null)

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Diagnosis failed')
      }

      setDiagnosis(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setDiagnosis(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      {/* Upload area */}
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative bg-white rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer shadow-sm ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-stone-300 hover:border-emerald-400 hover:bg-stone-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-stone-800">
                Upload a photo of your plant
              </p>
              <p className="text-sm text-stone-500 mt-1">
                Drag & drop or click to browse — JPG, PNG, or WebP up to 20 MB
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  cameraInputRef.current?.click()
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview + diagnose */}
      {preview && !diagnosis && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="relative">
            <img
              src={preview}
              alt="Plant to diagnose"
              className="w-full max-h-96 object-contain bg-stone-100"
            />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 flex items-center justify-between gap-4">
            <p className="text-sm text-stone-500">
              Photo ready for analysis. Click Diagnose to check your plant&apos;s health.
            </p>
            <button
              onClick={handleDiagnose}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Leaf className="w-4 h-4" />
                  Diagnose
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <p className="mt-4 text-stone-700 font-medium">Analyzing your plant...</p>
          <p className="text-sm text-stone-400 mt-1">
            Our AI is inspecting leaves, stems, color, and overall condition
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Analysis Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            {error.includes('API key') && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-red-900 text-xs font-semibold mb-2">Free Alternatives:</p>
                <ul className="text-red-700 text-xs space-y-1.5">
                  <li>• <strong>Plant.id</strong> — Free tier: 100 identifications/month (<a href="https://plant.id" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">plant.id</a>)</li>
                  <li>• <strong>Pl@ntNet</strong> — Completely free, community-driven (<a href="https://plantnet.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">plantnet.org</a>)</li>
                  <li>• <strong>iNaturalist</strong> — Free, expert community validation (<a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">inaturalist.org</a>)</li>
                  <li>• <strong>Google Lens</strong> — Free mobile app for instant plant ID</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {diagnosis && (
        <div className="space-y-5">
          {/* Header card with image + score */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              <div className="relative">
                <img
                  src={preview}
                  alt="Diagnosed plant"
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:col-span-2 p-6 flex flex-col sm:flex-row items-center gap-6">
                <HealthScoreRing
                  score={diagnosis.healthScore}
                  overallHealth={diagnosis.overallHealth}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-stone-800">
                    {diagnosis.plantName}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">
                    {diagnosis.issues?.length
                      ? `${diagnosis.issues.length} issue${diagnosis.issues.length > 1 ? 's' : ''} detected`
                      : 'No issues detected'}
                  </p>
                  {diagnosis.positives?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                      {diagnosis.positives.map((p, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Issues */}
          {diagnosis.issues?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h4 className="flex items-center gap-2 text-base font-semibold text-stone-800 mb-4">
                <Bug className="w-5 h-5 text-amber-500" />
                Issues Found
              </h4>
              <div className="space-y-4">
                {diagnosis.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 ${SEVERITY_COLORS[issue.severity] || 'bg-stone-50 border-stone-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="font-semibold text-sm">{issue.name}</h5>
                        <p className="text-sm mt-1 opacity-90">{issue.description}</p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide flex-shrink-0 opacity-70">
                        {issue.severity}
                      </span>
                    </div>
                    {issue.cause && (
                      <p className="text-xs mt-2 opacity-75">
                        <span className="font-semibold">Cause:</span> {issue.cause}
                      </p>
                    )}
                    {issue.treatment && (
                      <div className="mt-3 bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-semibold mb-1 opacity-75">Treatment</p>
                        <p className="text-sm">{issue.treatment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Care advice grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Watering */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Watering
              </h4>
              <p className="text-sm text-stone-600">{diagnosis.wateringAdvice}</p>
            </div>

            {/* Sunlight */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Sunlight
              </h4>
              <p className="text-sm text-stone-600">{diagnosis.sunlightAdvice}</p>
            </div>
          </div>

          {/* Care tips */}
          {diagnosis.careTips?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h4 className="flex items-center gap-2 text-base font-semibold text-stone-800 mb-4">
                <Heart className="w-5 h-5 text-pink-500" />
                Care Tips
              </h4>
              <ul className="space-y-2">
                {diagnosis.careTips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-stone-700"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scan another */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Scan Another Plant
            </button>
          </div>
        </div>
      )}

      {/* Disease Reference Library */}
      <div className="mt-8 pt-8 border-t border-stone-200">
        <DiseaseReference />
      </div>
    </div>
  )
}
