import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, ThumbsUp, AlertTriangle } from 'lucide-react';
import type { Gate } from '../types';

interface ClaudeAssistantProps {
  gate: Gate;
  phaseName: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function generateGateAnalysis(gate: Gate, phaseName: string): string {
  const completed = gate.criteria.filter(c => c.completed);
  const pending = gate.criteria.filter(c => !c.completed);
  const progress = gate.criteria.length > 0
    ? Math.round((completed.length / gate.criteria.length) * 100)
    : 0;

  if (gate.status === 'passed') {
    return `This gate has already been passed. All ${gate.criteria.length} criteria were met and approved. The decision was made by ${gate.decidedBy} on ${gate.decidedAt}. No further action is needed for this gate.`;
  }

  if (gate.status === 'blocked') {
    return `This gate is currently blocked with a No-Go decision.\n\n**Reason:** ${gate.blockReason || 'No reason provided'}\n\nTo unblock, the team should address the blocking issues and request a new review.`;
  }

  if (gate.status === 'locked') {
    return `This gate is locked. The preceding phase and gate must be completed before this gate can be activated. Focus on completing the current active phase first.`;
  }

  // Active gate analysis
  let analysis = `**Gate Analysis: ${gate.name}**\n*Phase: ${phaseName}*\n\n`;
  analysis += `**Progress:** ${completed.length}/${gate.criteria.length} criteria met (${progress}%)\n\n`;

  if (completed.length > 0) {
    analysis += `**Completed:**\n`;
    completed.forEach(c => {
      analysis += `- ${c.label}${c.approvedBy ? ` (approved by ${c.approvedBy})` : ''}\n`;
    });
    analysis += '\n';
  }

  if (pending.length > 0) {
    analysis += `**Pending:**\n`;
    pending.forEach(c => {
      analysis += `- ${c.label}\n`;
    });
    analysis += '\n';
  }

  // Recommendation
  if (progress === 100) {
    analysis += `**Recommendation:** All criteria are met. This gate is ready for a **Go** decision. I'd recommend proceeding to the next phase.`;
  } else if (progress >= 75) {
    analysis += `**Recommendation:** Strong progress at ${progress}%. ${pending.length === 1 ? 'Only 1 criterion remains' : `${pending.length} criteria remain`}. ${gate.enforcement === 'soft' ? 'Since this is a soft gate, the team could consider proceeding with documented risks.' : 'As a hard gate, all criteria must be met before proceeding.'}`;
  } else if (progress >= 50) {
    analysis += `**Recommendation:** Moderate progress. Focus on the ${pending.length} remaining criteria before scheduling a gate review. ${gate.enforcement === 'hard' ? 'This hard gate requires full completion.' : 'Consider whether soft-pass is appropriate given the risks.'}`;
  } else {
    analysis += `**Recommendation:** This gate is in early stages with ${pending.length} criteria still pending. I'd suggest scheduling focused working sessions to address the outstanding items before a formal review.`;
  }

  return analysis;
}

function generateFollowUpResponse(question: string, gate: Gate, phaseName: string): string {
  const q = question.toLowerCase();
  const completed = gate.criteria.filter(c => c.completed);
  const pending = gate.criteria.filter(c => !c.completed);

  if (q.includes('risk') || q.includes('concern')) {
    if (pending.length === 0) {
      return `All criteria have been met for "${gate.name}", so the risk profile is low. The main consideration is whether the approvals are still current and the underlying work hasn't changed since sign-off.`;
    }
    return `**Key risks for "${gate.name}":**\n\n${pending.map((c, i) => `${i + 1}. **${c.label}** - This remains unverified and could impact downstream phases if not addressed.`).join('\n')}\n\n${gate.enforcement === 'hard' ? 'Since this is a hard gate, proceeding without these could create significant blockers later.' : 'As a soft gate, the team can proceed with documented risk acceptance, but I\'d recommend tracking these as open items.'}`;
  }

  if (q.includes('who') || q.includes('assign') || q.includes('owner')) {
    if (completed.length > 0) {
      const approvers = [...new Set(completed.filter(c => c.approvedBy).map(c => c.approvedBy!))];
      return `**Current approvers:** ${approvers.join(', ')}\n\nFor the ${pending.length} pending criteria, I'd suggest assigning owners based on domain expertise. The team members who've already approved related criteria would be good candidates for reviewing the remaining items.`;
    }
    return `No criteria have been approved yet. I'd recommend identifying subject matter experts for each criterion and assigning them as reviewers.`;
  }

  if (q.includes('timeline') || q.includes('when') || q.includes('how long') || q.includes('deadline')) {
    return `Based on the current progress (${completed.length}/${gate.criteria.length} criteria met), the gate completion depends on how quickly the remaining ${pending.length} items can be addressed. I'd recommend setting target dates for each pending criterion and scheduling a gate review once all are met.`;
  }

  if (q.includes('skip') || q.includes('bypass') || q.includes('override')) {
    if (gate.enforcement === 'hard') {
      return `This is a **hard gate** - it cannot be bypassed without meeting all criteria. Hard gates exist to enforce critical quality and compliance checkpoints. If you believe the gate criteria need revision, I'd recommend discussing with the project lead rather than bypassing the gate.`;
    }
    return `This is a **soft gate**, so it can technically be passed without all criteria met. However, I'd recommend documenting the rationale for any bypassed criteria and ensuring stakeholders are aligned on the accepted risks.`;
  }

  if (q.includes('ready') || q.includes('pass') || q.includes('go')) {
    if (pending.length === 0) {
      return `Yes, all ${gate.criteria.length} criteria are met. The gate is ready for a Go decision. You can proceed by clicking the "Go — Pass Gate" button below.`;
    }
    return `Not yet. ${pending.length} of ${gate.criteria.length} criteria are still pending:\n\n${pending.map(c => `- ${c.label}`).join('\n')}\n\nComplete these items before making a Go decision.`;
  }

  return `Regarding "${gate.name}" in the ${phaseName} phase: ${completed.length} of ${gate.criteria.length} criteria have been met so far. ${pending.length > 0 ? `The remaining items are: ${pending.map(c => c.label).join(', ')}.` : 'All criteria are complete.'} Let me know if you'd like a deeper analysis of any specific criterion or aspect of this gate.`;
}

export function ClaudeAssistant({ gate, phaseName }: ClaudeAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let msgCounter = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (messages.length === 0) {
        // Auto-analyze on first open
        setIsTyping(true);
        setTimeout(() => {
          const analysis = generateGateAnalysis(gate, phaseName);
          setMessages([{
            id: `msg-${++msgCounter.current}`,
            role: 'assistant',
            content: analysis,
          }]);
          setIsTyping(false);
        }, 800);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: `msg-${++msgCounter.current}`,
      role: 'user',
      content: trimmed,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateFollowUpResponse(trimmed, gate, phaseName);
      setMessages(prev => [...prev, {
        id: `msg-${++msgCounter.current}`,
        role: 'assistant',
        content: response,
      }]);
      setIsTyping(false);
    }, 600 + Math.random() * 600);
  };

  const pending = gate.criteria.filter(c => !c.completed);
  const completed = gate.criteria.filter(c => c.completed);
  const progress = gate.criteria.length > 0
    ? Math.round((completed.length / gate.criteria.length) * 100)
    : 0;

  // Quick suggestion chips
  const suggestions = [
    'What are the risks?',
    'Is this gate ready to pass?',
    'Who should review?',
  ];

  if (!isOpen) {
    return (
      <div className="px-5 py-3 border-t border-grey-080">
        <button
          onClick={handleOpen}
          className="flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl bg-[#F9F5EE] hover:bg-[#F3EDE3] border border-[#E8DFD0] transition-all group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#E5793B] flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-medium text-[#B5560F]">Ask Claude</span>
            <span className="text-xs text-[#C4956A] ml-1.5">
              {gate.status === 'active'
                ? pending.length > 0
                  ? `${pending.length} criteria to review`
                  : 'Ready for review'
                : 'Analyze gate'
              }
            </span>
          </div>
          <div className="flex items-center gap-1">
            {gate.status === 'active' && progress === 100 && (
              <ThumbsUp size={13} className="text-emerald-500" />
            )}
            {gate.status === 'active' && pending.length > 0 && progress < 50 && (
              <AlertTriangle size={13} className="text-amber-500" />
            )}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-grey-080 flex flex-col" style={{ maxHeight: '55%', minHeight: '240px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F5EE] border-b border-[#E8DFD0] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#E5793B] flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[#8B4513]">Claude</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#EDE4D5] transition-colors"
        >
          <X size={14} className="text-[#B5560F]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[95%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary-500 text-white rounded-br-md'
                : 'bg-[#F9F5EE] text-grey-700 rounded-bl-md border border-[#E8DFD0]'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="space-y-1.5">
                  {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold text-[#8B4513]">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('**') && line.includes(':**')) {
                      const [label, ...rest] = line.split(':**');
                      return (
                        <p key={i}>
                          <span className="font-semibold text-[#8B4513]">{label.replace(/\*\*/g, '')}:</span>
                          {rest.join(':**').replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return <p key={i} className="pl-3 text-grey-600">{line}</p>;
                    }
                    if (line.startsWith('*') && line.endsWith('*')) {
                      return <p key={i} className="text-grey-500 italic text-xs">{line.replace(/\*/g, '')}</p>;
                    }
                    if (line.match(/^\d+\./)) {
                      return <p key={i} className="pl-2 text-grey-600">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line === '') return <div key={i} className="h-1" />;
                    return <p key={i}>{line.replace(/\*\*/g, '')}</p>;
                  })}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#F9F5EE] border border-[#E8DFD0] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#C4956A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#C4956A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#C4956A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips — show only when no user messages yet */}
      {messages.length <= 1 && !isTyping && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2 bg-white">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                setTimeout(() => {
                  const userMsg: Message = {
                    id: `msg-${++msgCounter.current}`,
                    role: 'user',
                    content: s,
                  };
                  setMessages(prev => [...prev, userMsg]);
                  setInput('');
                  setIsTyping(true);
                  setTimeout(() => {
                    const response = generateFollowUpResponse(s, gate, phaseName);
                    setMessages(prev => [...prev, {
                      id: `msg-${++msgCounter.current}`,
                      role: 'assistant',
                      content: response,
                    }]);
                    setIsTyping(false);
                  }, 600 + Math.random() * 600);
                }, 50);
              }}
              className="text-xs px-2.5 py-1.5 rounded-full border border-[#E8DFD0] text-[#8B4513] hover:bg-[#F9F5EE] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-grey-080 bg-white shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about this gate..."
          className="flex-1 h-9 px-3 text-sm bg-grey-050 border border-grey-080 rounded-xl focus:outline-none focus:border-[#E5793B] focus:ring-1 focus:ring-[#E5793B]/20 placeholder:text-grey-300"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
            input.trim() && !isTyping
              ? 'bg-[#E5793B] text-white hover:bg-[#D4692B]'
              : 'bg-grey-050 text-grey-300'
          }`}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
