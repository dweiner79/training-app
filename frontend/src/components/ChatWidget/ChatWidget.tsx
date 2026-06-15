import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../../services/trainingApi'
import type { ChatMessage } from '../../types'

type BotMode = 'openai' | 'pva'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your HLS training assistant. Ask me anything about your required trainings, upcoming sessions, or how to get started.",
  timestamp: new Date().toISOString(),
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<BotMode>('openai')
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pvaContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Inject PVA bot script when mode switches to 'pva'
  useEffect(() => {
    if (mode !== 'pva' || !open) return
    const pvaBotUrl = import.meta.env.VITE_PVA_BOT_URL
    if (!pvaBotUrl || !pvaContainerRef.current) return

    // Copilot Studio provides a <script> tag — we inject the webchat iframe approach here
    pvaContainerRef.current.innerHTML = ''
    const iframe = document.createElement('iframe')
    iframe.src = pvaBotUrl
    iframe.style.cssText = 'width:100%;height:100%;border:none;'
    iframe.title = 'HLS Training Assistant (Copilot Studio)'
    pvaContainerRef.current.appendChild(iframe)
  }, [mode, open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }))
      const reply = await sendChatMessage(history)
      setMessages((prev) => [...prev, reply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, I ran into an issue. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={open ? 'Close chat' : 'Open training assistant'}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v11z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
            <div>
              <p className="font-semibold text-sm">Training Assistant</p>
              <p className="text-xs text-blue-200">Ask about your onboarding trainings</p>
            </div>
            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-blue-700 rounded-full p-0.5 text-xs">
              <button
                onClick={() => setMode('openai')}
                className={`px-2 py-1 rounded-full transition-colors ${mode === 'openai' ? 'bg-white text-blue-700 font-medium' : 'text-blue-200 hover:text-white'}`}
              >
                AI
              </button>
              <button
                onClick={() => setMode('pva')}
                className={`px-2 py-1 rounded-full transition-colors ${mode === 'pva' ? 'bg-white text-blue-700 font-medium' : 'text-blue-200 hover:text-white'}`}
              >
                Bot
              </button>
            </div>
          </div>

          {/* Content */}
          {mode === 'openai' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask about your trainings…"
                  disabled={loading}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
                  aria-label="Send"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div ref={pvaContainerRef} className="flex-1 flex items-center justify-center text-sm text-gray-400">
              {import.meta.env.VITE_PVA_BOT_URL
                ? 'Loading bot…'
                : 'VITE_PVA_BOT_URL not configured. Set it in .env.local to enable the Copilot Studio bot.'}
            </div>
          )}
        </div>
      )}
    </>
  )
}
