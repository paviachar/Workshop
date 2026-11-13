import React from 'react'
import {
  Activity,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  HeartPulse,
  Brain,
  Stethoscope,
  CheckCircle2,
  HelpCircle,
  Clock,
  BookOpen,
  Users
} from 'lucide-react'

export default function LandingPage({ onOpenDashboard, onOpenUpload }) {
  const departments = [
    {
      title: 'Hematology & Blood Work',
      subtitle: 'Complete Blood Count, Platelets, Hemoglobin & Anemia Panels',
      icon: <Activity className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'Cardiovascular & Lipids',
      subtitle: 'Total Cholesterol, HDL, LDL, Triglycerides & Cardiac Markers',
      icon: <HeartPulse className="w-6 h-6 text-rose-500" />
    },
    {
      title: 'Metabolic & Diabetes',
      subtitle: 'Fasting Blood Glucose, HbA1c, Insulin & Electrolytes',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />
    },
    {
      title: 'Renal & Kidney Health',
      subtitle: 'Serum Creatinine, eGFR, Blood Urea Nitrogen & Filtration',
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />
    },
    {
      title: 'Hepatic & Liver Enzymes',
      subtitle: 'ALT (SGPT), AST (SGOT), Bilirubin & Protein Synthesis',
      icon: <Brain className="w-6 h-6 text-indigo-600" />
    },
    {
      title: 'Preventive Wellness',
      subtitle: 'Thyroid (TSH), Vitamin D, B12 & Routine Executive Panels',
      icon: <Stethoscope className="w-6 h-6 text-sky-600" />
    }
  ]

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section (ProHealth Inspired) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-800 text-white p-8 sm:p-14 shadow-xl">
        {/* Background decorative blurs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Educational Health Literacy Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Compassionate care, <br />
            <span className="text-cyan-200">clear explanations.</span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed mb-8 max-w-2xl">
            ReportSaathi translates confusing medical laboratory jargon, complex numbers, and clinical reference intervals into friendly, everyday language so you can have informed, confident conversations with your doctor.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
            <button
              onClick={onOpenUpload}
              className="px-6 py-3.5 rounded-xl bg-white text-blue-800 font-bold text-sm sm:text-base hover:bg-blue-50 transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Upload Medical Report</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={onOpenDashboard}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Interactive Demo Dashboard</span>
            </button>
          </div>

          {/* Quick Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-blue-200 font-medium">Educational Focus</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">50+</div>
              <div className="text-xs text-blue-200 font-medium">Common Lab Tests</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">0</div>
              <div className="text-xs text-blue-200 font-medium">Medical Jargon</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">Free</div>
              <div className="text-xs text-blue-200 font-medium">Patient Resource</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl">
          <span className="text-xs font-bold tracking-wider uppercase text-blue-600 mb-2 block">
            About ReportSaathi
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            A bridge between clinical lab tests and patient peace of mind
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            Receiving a multi-page pathology report filled with acronyms like <em>MCV, eGFR, VLDL,</em> or <em>SGPT</em> can be overwhelming and anxiety-inducing. ReportSaathi is designed to demystify these metrics by providing objective, clear explanations and real-world analogies, while strictly framing the information for educational purposes only.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-1">Plain Language</strong>
                <span className="text-slate-600">Every metric is translated into everyday terminology with relatable examples.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-1">Empowered Conversations</strong>
                <span className="text-slate-600">Generate a personalized list of constructive questions to ask your physician.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-1">Strict Safety Standard</strong>
                <span className="text-slate-600">Never provides clinical diagnoses or prescription alterations.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold tracking-wider uppercase text-blue-600 block mb-2">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How ReportSaathi Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Understanding your laboratory data in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Upload Your Report</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Drop your digital PDF or snap a photo with your mobile camera (JPG, PNG). The platform validates file size and format safely.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Educational Translation</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ReportSaathi extracts test values and matches them against standard reference intervals, adding plain-language definitions and visual indicators.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Prepare for Your Doctor</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Review a list of tailored discussion points and constructive questions to bring to your next healthcare appointment.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Panels & Departments (ProHealth Style) */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-blue-600 block mb-1">
            Common Lab Test Panels Covered
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            For Your Health Literacy
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departments.map((dept, index) => (
            <div
              key={index}
              onClick={onOpenDashboard}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {dept.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                {dept.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {dept.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 rounded-3xl border border-blue-200/80 p-8 sm:p-10 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Ready to review your medical lab report?
        </h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Explore realistic sample reports in our interactive educational demo or upload your own lab document.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenUpload}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            Upload Report File
          </button>
          <button
            onClick={onOpenDashboard}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Go to Demo Dashboard
          </button>
        </div>
      </section>
    </div>
  )
}
