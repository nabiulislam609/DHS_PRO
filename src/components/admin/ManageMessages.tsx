import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Mail, MailOpen, Trash2, X, Phone, Calendar, Check, Send } from 'lucide-react';
import { ContactMessage } from '../../types';

export const ManageMessages: React.FC = () => {
  const { messages, markMessageRead, deleteMessage } = useSchool();
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);

  const openMsg = (msg: ContactMessage) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      markMessageRead(msg.id, true);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySent(true);
    setTimeout(() => {
      setReplySent(false);
      setReplyText('');
      setSelectedMsg(null);
    }, 2000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ইনবক্স / বার্তা</h1>
          <p className="text-xs text-gray-500">
            ওয়েবসাইট ভিজিটর ও অভিভাবকদের প্রেরিত সকল অনুসন্ধান বার্তা
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            <Mail className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>কোনো বার্তা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => openMsg(m)}
                className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer transition ${
                  !m.read ? 'bg-emerald-50/40 hover:bg-emerald-50/70 font-semibold' : 'hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      !m.read
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {!m.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-gray-900 truncate">
                        {m.name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        ({m.phone})
                      </span>
                      {!m.read && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          নতুন
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-800 font-medium truncate">
                      {m.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {m.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                    {m.date}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`আপনি কি এই বার্তাটি মুছে ফেলতে চান?`)) {
                        deleteMessage(m.id);
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setSelectedMsg(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{selectedMsg.date}</span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedMsg.subject}</h3>
            <p className="text-xs text-gray-600 mb-4">
              প্রেরক: <span className="font-bold text-gray-800">{selectedMsg.name}</span> | ফোন: <span className="font-mono text-emerald-800">{selectedMsg.phone}</span>
              {selectedMsg.email && ` | ইমেইল: ${selectedMsg.email}`}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-100 mb-6">
              {selectedMsg.message}
            </div>

            {/* Quick Reply Form */}
            {replySent ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>উত্তর সফলভাবে প্রেরিত হয়েছে!</span>
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="space-y-3">
                <label className="block text-xs font-bold text-gray-700">দ্রুত উত্তর পাঠান:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="আপনার উত্তর লিখুন..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-600 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMsg(null)}
                    className="px-4 py-1.5 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>পাঠান</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
