import React from 'react';
import { ShieldCheck, MoreVertical, Phone, Video, CheckCheck, Send } from 'lucide-react';

export default function WhatsAppPhoneMockup({
  headerText = '',
  bodyText = '',
  footerText = '',
  buttons = [],
  variables = {},
  businessName = 'Sheetbotics Official',
  verified = true,
}) {
  // Resolve dynamic {{1}}, {{2}} in body text
  let resolvedBody = bodyText;
  if (variables && Object.keys(variables).length > 0) {
    Object.keys(variables).forEach((key) => {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      resolvedBody = resolvedBody.replace(pattern, `<span class="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-xs">${variables[key]}</span>`);
    });
  }

  return (
    <div className="w-[320px] sm:w-[350px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700/80 mx-auto select-none">
      {/* Smartphone Speaker & Camera Notch */}
      <div className="w-full flex justify-center items-center pb-2">
        <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          <div className="w-10 h-1.5 rounded-full bg-slate-800"></div>
        </div>
      </div>

      {/* Screen Container */}
      <div className="w-full rounded-[28px] overflow-hidden bg-[#0c1317] flex flex-col h-[520px] relative border border-slate-800">
        {/* WhatsApp App Topbar */}
        <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center justify-between text-slate-100 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow">
              SB
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-100 truncate max-w-[130px]">{businessName}</span>
                {verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-[10px] text-emerald-400 block font-medium">Official Business Account</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Video className="w-4 h-4 opacity-80" />
            <Phone className="w-4 h-4 opacity-80" />
            <MoreVertical className="w-4 h-4 opacity-80" />
          </div>
        </div>

        {/* WhatsApp Chat Area */}
        <div className="flex-1 p-3 overflow-y-auto whatsapp-chat-bg flex flex-col justify-end space-y-2">
          {/* Security Notice Pill */}
          <div className="bg-[#182229] border border-amber-500/20 text-amber-200/80 text-[10px] text-center p-1.5 rounded-lg mb-2 shadow-sm">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
          </div>

          {/* Outbound WhatsApp Template Message Bubble */}
          <div className="self-end max-w-[92%] bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-xs p-3 shadow-md border border-emerald-700/30 text-xs">
            {/* Header */}
            {headerText && (
              <div className="font-bold text-white text-xs mb-1.5 border-b border-emerald-600/30 pb-1">
                {headerText}
              </div>
            )}

            {/* Body */}
            <div
              className="text-slate-100 text-[11.5px] leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: resolvedBody || 'Template message content will appear here...' }}
            />

            {/* Footer */}
            {footerText && (
              <div className="text-[10px] text-slate-300/70 mt-2 italic">
                {footerText}
              </div>
            )}

            {/* Timestamp & Status */}
            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-300/80">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
            </div>

            {/* Interactive Buttons */}
            {buttons && buttons.length > 0 && (
              <div className="mt-2.5 pt-1.5 border-t border-emerald-600/30 flex flex-col gap-1">
                {buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-cyan-300 text-[11px] font-medium rounded-lg text-center transition flex items-center justify-center gap-1.5 border border-emerald-600/30"
                  >
                    <span>{btn.text || 'Action Button'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Bar Mockup */}
        <div className="bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-slate-800">
          <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-slate-400">
            Type a message...
          </div>
          <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
