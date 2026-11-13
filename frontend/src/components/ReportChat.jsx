import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react'
import { askReportChat } from '../services/api'

export default function ReportChat({ report }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your ReportSaathi educational assistant for this **${
        report?.summary?.report_title || report?.title || 'Laboratory Report'
      }**. You can ask me what specific numbers mean or what questions to ask your physician.\n\n*Note: I can only answer questions using the information in this report and cannot provide medical diagnoses or treatment recommendations.*`,
      grounded: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Suggested quick prompts based on the report
  const findings = report?.findings || report?.structured_data || []
  const firstFindingName = findings[0]?.test_name || findings[0]?.testName || 'Hemoglobin'

  const quickPrompts = [
    `What does ${firstFindingName} mean?`,
    "What questions should I ask my doctor?",
    "Were any of my test values outside the reference range?",
    "Can you check my thyroid level?" // To showcase the out-of-scope safety response
  ]

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputValue
    if (!query || !query.trim() || isLoading) return

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      // Build history for context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          text: m.text
        }))

      const response = await askReportChat(report, query.trim(), history)

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        grounded: response.grounded_in_report,
        disclaimer: response.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err.message || 'Unable to receive response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[600px] print:hidden">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <Bot className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight">ReportSaathi Discussion</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                Grounded to this Report
              </span>
            </div>
            <p className="text-xs text-blue-100">
              {report?.summary?.report_title || report?.title || 'Report'} • Strictly educational
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                sender: 'assistant',
                text: `Reset conversation for this **${
                  report?.summary?.report_title || report?.title || 'Laboratory Report'
                }**. How can I help you understand this report?`,
                grounded: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])
            setError(null)
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Safety Notice Strip */}
      <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>
          <strong>Strict Safety Protocol:</strong> Answers are drawn only from this document. If a topic is not in the report, it will be flagged as unavailable. No diagnoses or prescriptions.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                  : msg.grounded === false
                  ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-xs shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
              }`}
            >
              {msg.grounded === false && msg.sender === 'assistant' && (
                <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Topic Not Found in this Report</span>
                </div>
              )}

              <div className="whitespace-pre-line space-y-1">
                {msg.text}
              </div>

              {msg.disclaimer && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 italic">
                  {msg.disclaimer}
                </div>
              )}

              <span
                className={`block text-[10px] mt-1.5 text-right ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Reviewing report details...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Suggestions */}
      <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Suggested:</span>
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-medium border border-slate-200/90 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Error state if submission failed */}
      {error && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about this report (e.g. What does MCV mean?)..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className={`p-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
            inputValue.trim() && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title="Send Question"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  )
}
