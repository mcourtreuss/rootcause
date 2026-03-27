import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Leaf,
  Loader2,
  Sprout,
  Sun,
  Droplets,
  Bug,
  Home,
  Flower2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'

const SUGGESTED_PROMPTS = [
  {
    icon: Sprout,
    text: 'What are the easiest vegetables to grow as a beginner?',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Droplets,
    text: 'How often should I water my plants?',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Sun,
    text: 'How do I know if my plant is getting enough sunlight?',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Home,
    text: 'What plants can I grow indoors with low light?',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Bug,
    text: 'How do I deal with common garden pests naturally?',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    icon: Flower2,
    text: 'What soil should I use for container gardening?',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center shadow-sm">
      <Leaf className="w-4 h-4 text-white" />
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
      <span className="text-white text-xs font-bold">You</span>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {isUser ? <UserAvatar /> : <AssistantAvatar />}
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-green-600 text-white rounded-br-sm'
            : 'bg-white border border-green-100 text-stone-700 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

function WelcomeScreen({ onPrompt }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Sprout className="w-10 h-10 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Welcome to Garden Guide! 🌱
          </h2>
          <p className="text-stone-500 text-sm max-w-sm mx-auto leading-relaxed">
            I'm your AI gardening companion, here to help you grow with confidence.
            Ask me anything about plants, soil, watering, pests, and more.
          </p>
        </div>

        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider text-center mb-3">
          Try asking...
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onPrompt(prompt.text)}
              className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-stone-200 hover:border-green-300 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className={`w-8 h-8 ${prompt.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <prompt.icon className={`w-4 h-4 ${prompt.color}`} />
              </div>
              <span className="text-sm text-stone-600 group-hover:text-stone-800 leading-snug pt-0.5">
                {prompt.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleScroll = () => {
    const el = scrollAreaRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }

  const sendMessage = async (content) => {
    const trimmed = content.trim()
    if (!trimmed || isLoading) return

    setError(null)
    const userMessage = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error (${res.status})`)
      }

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleReset = () => {
    setMessages([])
    setError(null)
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-stone-50">
      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-emerald-800 text-white px-5 py-3.5 shadow-lg flex items-center gap-3">
        <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">Garden Guide</h1>
          <p className="text-green-300 text-xs">AI gardening companion for beginners</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-xs">Cloudflare AI</span>
          </div>
          {hasMessages && (
            <button
              onClick={handleReset}
              title="Start a new conversation"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-green-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Messages / Welcome ── */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
      >
        {!hasMessages ? (
          <WelcomeScreen onPrompt={sendMessage} />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-end gap-2.5">
                <AssistantAvatar />
                <div className="bg-white border border-green-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 right-4 w-9 h-9 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 bg-white border-t border-green-100 px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about plants, watering, soil, pests…"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-green-200 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm text-stone-700 placeholder-stone-400 disabled:opacity-60 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 flex-shrink-0 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 rounded-xl flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-stone-400 mt-2">
          Garden Guide can make mistakes — verify important advice with local experts.
        </p>
      </div>
    </div>
  )
}
