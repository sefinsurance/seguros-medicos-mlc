import React, { useState } from "react";
import { X } from "lucide-react";
import Step1Form from "@/components/quote/Step1Form";
import Step2Form from "@/components/quote/Step2Form";
import QuoteSuccess from "@/components/quote/QuoteSuccess";

export default function QuoteModal({ open, onClose, ctaSource, lang }) {
  const [step, setStep] = useState(1);
  const [leadId, setLeadId] = useState(null);

  const handleStep1Done = (id) => {
    setLeadId(id);
    setStep(2);
  };

  const handleStep2Done = () => {
    setStep(3);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(1); setLeadId(null); }, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">
              {lang === "es" ? "MLC Insurance" : "MLC Insurance"}
            </div>
            <div className="text-xs text-blue-200">
              {lang === "es" ? "Seguros de salud para tu familia" : "Health insurance for your family"}
            </div>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {step < 3 && (
          <div className="px-6 pt-4 flex gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-[#2563eb]" : "bg-gray-200"}`} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {step === 1 && <Step1Form lang={lang} ctaSource={ctaSource} onDone={handleStep1Done} />}
          {step === 2 && <Step2Form lang={lang} leadId={leadId} onDone={handleStep2Done} />}
          {step === 3 && <QuoteSuccess lang={lang} onClose={handleClose} />}
        </div>
      </div>
    </div>
  );
}