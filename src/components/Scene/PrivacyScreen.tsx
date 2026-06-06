import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, CheckCircle, Mail, Globe, ArrowLeft, Building2 } from 'lucide-react';
import { playSound } from '../../lib/sounds';
import { CINEMATIC_EASE } from '../../types';

interface PrivacyScreenProps {
  onClose: () => void;
}

export const PrivacyScreen = ({ onClose }: PrivacyScreenProps) => {
  const handleClose = () => {
    playSound('selection');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 bg-bg-dark flex flex-col p-6 md:p-12 overflow-y-auto custom-scrollbar text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-radial-at-center from-brand-purple/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 pt-16 pb-24">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-brand-cyan" />
              <span className="text-[10px] font-mono tracking-[0.4em] text-brand-cyan uppercase font-bold">
                Regulatory Compliance // PIPEDA & CASL
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tight">
              Privacy Statement
            </h1>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1 font-mono">
              Entity: 17421745 Canada Ltd. dba Drive Arc
            </p>
          </div>

          <button
            onClick={handleClose}
            className="px-5 py-3 border border-white/10 hover:border-brand-cyan/40 hover:bg-white/5 text-white/80 hover:text-white text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> [ Return to Showroom ]
          </button>
        </div>

        {/* Content Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
          className="glass-panel p-6 md:p-12 rounded-3xl border-white/5 space-y-8 text-white/80 leading-relaxed text-sm md:text-base font-light"
        >
          {/* Quick Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
              <Lock className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-white font-bold mb-1">Encrypted Storage</h4>
                <p className="text-[10px] text-white/40">All personal and credit-related inputs are encrypted in transit and rest.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-white font-bold mb-1">Consent-First Policy</h4>
                <p className="text-[10px] text-white/40">No background tracking of personal identity occurs prior to explicit agreement.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
              <FileText className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-white font-bold mb-1">Right to Erasure</h4>
                <p className="text-[10px] text-white/40">Under PIPEDA guidelines, users can request immediate, permanent deletion of leads.</p>
              </div>
            </div>
          </div>

          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h3 className="text-lg font-display uppercase tracking-widest text-white border-l-2 border-brand-cyan pl-3">
              1. Overview & Accountability
            </h3>
            <p>
              This Privacy Policy explains how <strong>17421745 Canada Ltd.</strong> (operating as <strong>"Drive Arc"</strong>, and referred to herein as "we", "us", or "our") collects, uses, protects, and discloses personal information when you use our website, showroom tools, and decision-engine dashboards.
            </p>
            <p>
              As the custodian of your information, 17421745 Canada Ltd. complies with the federal <em>Personal Information Protection and Electronic Documents Act</em> (<strong>PIPEDA</strong>) and provincial private-sector privacy legislation where applicable. We are committed to transparency, security, and giving you control over your personal details.
            </p>
          </section>

          {/* Section 2: Collection */}
          <section className="space-y-3">
            <h3 className="text-lg font-display uppercase tracking-widest text-white border-l-2 border-brand-cyan pl-3">
              2. Information We Collect
            </h3>
            <p>
              To process automotive credit pre-approval assessments, we collect personal and financial information that you voluntarily submit through our showroom interface. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-white/70">
              <li><strong>Contact Information:</strong> Full Name, Email Address, and Phone Number.</li>
              <li><strong>Financial Details:</strong> Primary employment status, estimated monthly income, credit band estimate, monthly debt obligations, and down payment capacity.</li>
              <li><strong>Housing Profile:</strong> Status (Private Ownership, Rental/Lease, or Living with Family).</li>
              <li><strong>Technical Metadata:</strong> Anonymized usage events, browser type, and navigation paths used exclusively to optimize user experience.</li>
            </ul>
          </section>

          {/* Section 3: Purpose */}
          <section className="space-y-3">
            <h3 className="text-lg font-display uppercase tracking-widest text-white border-l-2 border-brand-cyan pl-3">
              3. Identifying Purposes
            </h3>
            <p>
              We collect and process your information for the following specific purposes:
            </p>
            <ol className="list-decimal pl-6 space-y-1.5 text-white/70">
              <li>To perform automated pre-approval calculations using our risk-scoring underwriting model.</li>
              <li>To connect you with qualified automotive finance specialists or lenders matching your risk profile.</li>
              <li>To establish communication regarding your quote, financing options, or vehicle selection.</li>
              <li>To satisfy regulatory requirements and maintain compliance with lending network partners.</li>
            </ol>
            <p className="italic text-xs text-white/40">
              We do not sell, rent, or trade your personal information with third parties for unrelated promotional purposes.
            </p>
          </section>

          {/* Section 4: Consent & CASL */}
          <section className="space-y-3">
            <h3 className="text-lg font-display uppercase tracking-widest text-white border-l-2 border-brand-cyan pl-3">
              4. Consent & Canada's Anti-Spam Legislation (CASL)
            </h3>
            <p>
              We obtain your consent prior to collecting, processing, or transmitting your personal details:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-white/70">
              <li><strong>PIPEDA Consent:</strong> By checking the mandatory consent checkbox on the contact form, you provide express consent for 17421745 Canada Ltd. to evaluate your credit profile for pre-approval options.</li>
              <li><strong>CASL Marketing Opt-In:</strong> Any promotional email or SMS communication requires your explicit, optional opt-in consent. If you opt-in, you may withdraw your consent at any time by clicking the "Unsubscribe" link in any commercial electronic message, or by contacting our Privacy Officer.</li>
            </ul>
          </section>

          {/* Section 5: Deletion & De-identification */}
          <section className="space-y-3">
            <h3 className="text-lg font-display uppercase tracking-widest text-white border-l-2 border-brand-cyan pl-3">
              5. Retention, Safeguards, & Right to Erasure
            </h3>
            <p>
              We retain personal information only as long as necessary to fulfill the identified underwriting and communication purposes, or as required by law.
            </p>
            <p>
              <strong>Security Safeguards:</strong> We protect personal information with security safeguards appropriate to the sensitivity of the data. This includes TLS/SSL encryption for data in transit, strict local persistence protocols, and secure administrative dashboards gated by Google OAuth authentication and HttpOnly sessions to prevent unauthorized access.
            </p>
            <p>
              <strong>Right to Erasure (Deletion Requests):</strong> You have the right to request that we delete your personal and financial records. Our administrative dashboard includes a secure, immediate "Delete Lead Record" mechanism. Once triggered by our staff at your request, your details are permanently removed from our active databases.
            </p>
          </section>

          {/* Section 6: Contact Information */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-purple" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">Privacy Officer Contact</h4>
                </div>
                <p className="text-xs text-white/50">For inquiries, access requests, or deletion audits:</p>
                <p className="text-xs font-mono text-white/80">17421745 Canada Ltd. (dba Drive Arc)</p>
              </div>
              
              <div className="flex flex-col gap-1 text-xs">
                <a href="mailto:privacy@drivearc.ca" className="flex items-center gap-2 text-brand-cyan hover:underline font-mono">
                  <Mail className="w-3.5 h-3.5" /> privacy@drivearc.ca
                </a>
                <span className="flex items-center gap-2 text-white/40 font-mono">
                  <Globe className="w-3.5 h-3.5" /> Canada Compliance Active
                </span>
              </div>
            </div>
          </section>
        </motion.div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[10px] text-white/20 uppercase tracking-widest font-mono">
          Last Updated: June 2026 // Document Version 1.1 // Gated in Canada
        </div>
      </div>
    </div>
  );
};
