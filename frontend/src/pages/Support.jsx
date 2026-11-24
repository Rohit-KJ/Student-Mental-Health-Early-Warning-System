import { useState } from 'react'
import { useNavigate } from 'react-router'
import { generateSupportiveMessage } from '../services/api'

const promptStarters = [
  {
    label: 'Exam & Academic Pressure',
    prompt:
      "I have major exams approaching and a heavy assignment backlog. I'm feeling overwhelmed by the expectations and having trouble staying focused.",
  },
  {
    label: 'Exhaustion & Low Energy',
    prompt:
      "I've been sleeping poorly and feeling constantly drained. Even small tasks feel difficult and I feel burned out.",
  },
  {
    label: 'Anxiety & Overthinking',
    prompt:
      "My mind is constantly racing about my grades and future career. I feel anxious and find it hard to relax or be present.",
  },
  {
    label: 'Loneliness & Social Disconnect',
    prompt:
      "I've been feeling isolated and distant from my friends in the hostel. It feels like everyone else is managing fine except me.",
  },
  {
    label: 'Self-Doubt & Low Confidence',
    prompt:
      "I feel like an imposter in my classes. I'm doubting my abilities and comparing myself to others constantly.",
  },
]

function Support() {
  const navigate = useNavigate()

  const [studentText, setStudentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const charCount = studentText.length
  const maxChars = 2000

  const handleTextChange = (e) => {
    const value = e.target.value
    if (value.length <= maxChars) {
      setStudentText(value)
      if (error) setError('')
    }
  }

  const handleApplyStarter = (starterText) => {
    setStudentText(starterText)
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmed = studentText.trim()
    if (!trimmed || trimmed.length < 5) {
      setError('Please share at least a few words (minimum 5 characters) to help us provide meaningful support.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setCopied(false)

    try {
      const response = await generateSupportiveMessage(trimmed)
      setResult(response)
    } catch (err) {
      setError(
        err.message ||
          'Unable to generate a supportive response at this moment. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result?.supportive_message) return
    try {
      await navigator.clipboard.writeText(result.supportive_message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(false)
    }
  }

  const handleClear = () => {
    setStudentText('')
    setError('')
    setResult(null)
    setCopied(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Navigation link */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-7 text-white shadow-lg sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300">
            <span>💬</span>
            <span>JUET Peer Support Companion</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Motivational & Emotional Support
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            Express what is on your mind—academic stress, tiredness, feelings of doubt, or daily pressure.
            Receive a safe, empathetic message designed to bring calm perspective and gentle encouragement.
          </p>
        </div>

        <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      </section>

      {/* Non-clinical Care Boundary Notice */}
      <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <span className="text-xl shrink-0" aria-hidden="true">
            ℹ️
          </span>
          <div className="text-xs sm:text-sm text-blue-900 leading-relaxed">
            <strong className="font-semibold">Support Notice: </strong>
            This is an automated encouragement feature designed for emotional perspective and self-reflection.
            It does <span className="underline decoration-blue-400 underline-offset-2">not</span> provide clinical
            diagnoses, medical prescriptions, or therapy plans. Your entries are processed in memory and are never
            saved to your account history or logged.
          </div>
        </div>
      </section>

      {/* Input Card */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              What is on your mind today?
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Take your time to write openly in your own words.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {charCount}/{maxChars}
          </span>
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Starters (Click to Fill)
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {promptStarters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleApplyStarter(item.prompt)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="relative">
            <label htmlFor="student-mental-health-text" className="sr-only">
              Describe your current mental health situation or feelings
            </label>
            <textarea
              id="student-mental-health-text"
              rows={6}
              value={studentText}
              onChange={handleTextChange}
              disabled={loading}
              placeholder="e.g., I've been feeling overwhelmed with upcoming semester exams, struggling to focus during lectures, and feeling exhausted even after sleeping..."
              className="w-full resize-y rounded-2xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Privacy & Safe Guidance Note */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>🛡️ Protected in memory • Never stored or logged</span>
            <span>Min 5 chars</span>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-base" aria-hidden="true">
                  ⚠️
                </span>
                <div>
                  <p className="font-semibold">Unable to process request</p>
                  <p className="mt-0.5 text-xs text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!studentText && !result && !error)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={loading || studentText.trim().length < 5}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Reflecting on your words...</span>
                </>
              ) : (
                <>
                  <span>Generate Supportive Message</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Generated Result Section */}
      {result && (
        <section
          aria-live="polite"
          className="space-y-6 animate-in fade-in duration-300"
        >
          {/* Emergency Crisis Guidance Card (Shown only if is_crisis is true) */}
          {result.is_crisis && (
            <div className="rounded-3xl border-2 border-red-300 bg-red-50 p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-2xl text-white shadow-md shadow-red-500/20">
                  🆘
                </div>

                <div className="space-y-3">
                  <span className="inline-block rounded-full bg-red-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-red-900">
                    Immediate Safety & Care Notice
                  </span>

                  <h3 className="text-xl font-bold text-red-950 sm:text-2xl">
                    We Care About Your Life and Wellbeing
                  </h3>

                  <p className="text-sm leading-relaxed text-red-900">
                    {result.crisis_guidance}
                  </p>
                </div>
              </div>

              {/* Crisis Helplines Grid */}
              {Array.isArray(result.crisis_resources) &&
                result.crisis_resources.length > 0 && (
                  <div className="mt-6 border-t border-red-200/80 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
                      Free & Confidential 24/7 Helplines
                    </h4>

                    <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                      {result.crisis_resources.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-red-200 bg-white/90 p-4 shadow-xs"
                        >
                          <p className="font-bold text-slate-900 text-sm">
                            {item.name}
                          </p>
                          <p className="mt-1 font-mono text-base font-extrabold text-red-600">
                            {item.contact}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {item.availability}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 leading-normal">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Supportive Reflection Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg">
                  🌱
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                    Your MindCare Reflection
                  </h3>
                  <p className="text-xs text-slate-400">
                    {result.timestamp
                      ? new Date(result.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <span>{copied ? '✓ Copied' : '📋 Copy'}</span>
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
              {result.supportive_message
                .split('\n\n')
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index} className="text-justify sm:text-left">
                    {paragraph}
                  </p>
                ))}
            </div>

            {/* Quick Grounding Micro-step */}
            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-lg">🧘</span>
                <div className="text-xs sm:text-sm text-slate-600">
                  <strong className="font-semibold text-slate-800">
                    Grounding suggestion for right now:
                  </strong>{' '}
                  Inhale deeply for 4 counts, hold for 4, and exhale gently for 6.
                  Take a small sip of water and let your shoulders drop. You do not have
                  to solve everything this very minute.
                </div>
              </div>
            </div>

            {/* Automated Disclaimer Footer */}
            <div className="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
              {result.disclaimer}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Support
