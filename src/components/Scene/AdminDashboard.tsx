import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Lock, Eye, Users, ShieldCheck, Wallet, TrendingUp, Search, Download, LogOut, ChevronDown, ChevronUp, AlertCircle, Building2, User, X } from 'lucide-react';
import { playSound } from '../../lib/sounds';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  employment: string;
  income: string;
  creditScore: string;
  monthlyDebt: string;
  downPayment: string;
  housingStatus: string;
  vehicle: string;
  selectedModel?: string;
  selectedModelYear?: number;
  approvalScore?: number;
  riskTier?: string;
  maxLoan?: number;
  monthlyEstimate?: number;
  status: 'NEW' | 'CONTACTED' | 'UNDERWRITTEN' | 'CLOSED';
  createdAt: string;
  marketingConsent?: boolean;
  privacyConsent?: boolean;
}

export const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'UNDERWRITTEN' | 'CLOSED'>('ALL');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Fetch leads from server (implicitly verifies session cookie)
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Check for Google OAuth redirect error query params
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    const emailParam = params.get('email');
    
    if (err) {
      if (err === 'unauthorized_email') {
        setError(`Access Denied: The Google account ${emailParam || ''} is not authorized as an administrator.`);
      } else if (err === 'configuration_error') {
        setError('Configuration Error: Google OAuth is not set up correctly on the server.');
      } else if (err === 'token_exchange_failed' || err === 'userinfo_failed') {
        setError('Authentication Error: Failed to exchange credentials with Google.');
      } else {
        setError('Authentication Failed: Google Sign-In was unsuccessful.');
      }
      
      // Clean up URL query parameters dynamically
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = () => {
    playSound('selection');
    window.location.href = '/api/auth/google';
  };

  // Log Out / Lock Dashboard
  const handleLogOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
    setLeads([]);
    playSound('transition');
  };

  // Update lead status
  const handleUpdateStatus = async (id: string, newStatus: Lead['status']) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setLeads([]);
        return;
      }

      if (!res.ok) throw new Error('Failed to update status');
      
      const updatedLead = await res.json();
      setLeads(prevLeads => prevLeads.map(l => l.id === id ? updatedLead : l));
      playSound('selection');
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Delete lead record (PIPEDA Compliance right-to-be-forgotten request)
  const handleDeleteLead = async (id: string, name: string) => {
    const confirmed = window.confirm(`[Privacy Compliance] Are you sure you want to permanently delete all collected personal and financial data for: "${name}"?\n\nThis will permanently remove the record from the leads file to satisfy a data deletion request.`);
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'DELETE'
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setLeads([]);
        return;
      }

      if (!res.ok) throw new Error('Failed to delete lead');
      
      setLeads(prevLeads => prevLeads.filter(l => l.id !== id));
      setExpandedLeadId(null);
      playSound('transition');
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete lead. Please try again.');
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    playSound('selection');

    const headers = [
      'ID', 'Date Created', 'Name', 'Email', 'Phone', 'Employment', 'Monthly Income', 
      'Monthly Debt', 'DTI %', 'Housing', 'Credit Tier', 'Scoring', 'Max Approved Loan', 'Status'
    ];

    const rows = filteredLeads.map(l => {
      const incomeVal = parseFloat(l.income) || 1;
      const debtVal = parseFloat(l.monthlyDebt) || 0;
      const dti = ((debtVal / incomeVal) * 100).toFixed(1);
      
      return [
        l.id,
        new Date(l.createdAt).toLocaleDateString(),
        `"${l.name.replace(/"/g, '""')}"`,
        l.email,
        l.phone,
        l.employment,
        l.income,
        l.monthlyDebt,
        dti,
        l.housingStatus,
        l.creditScore,
        l.approvalScore || 'N/A',
        l.maxLoan || 0,
        l.status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `drive_arc_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and search computation
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.vehicle && l.vehicle.toLowerCase().includes(search.toLowerCase())) ||
      (l.selectedModel && l.selectedModel.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate HUD Metrics
  const totalLeads = leads.length;
  const preApprovedLeads = leads.filter(l => l.maxLoan && l.maxLoan > 0).length;
  const preApprovalRate = totalLeads > 0 ? Math.round((preApprovedLeads / totalLeads) * 100) : 0;
  const totalCapitalApproved = leads.reduce((sum, l) => sum + (l.maxLoan || 0), 0);
  const avgCreditScore = totalLeads > 0 
    ? Math.round(leads.reduce((sum, l) => sum + (l.approvalScore || 0), 0) / totalLeads) 
    : 0;

  // Initial loading check state
  if (isAuthenticated === null) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg-dark text-white gap-3">
        <div className="w-8 h-8 border-2 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">Securing environment...</span>
      </div>
    );
  }

  // Lock Screen Render
  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg-dark text-white overflow-hidden p-6">
        <div className="fixed inset-0 bg-radial-at-center from-brand-purple/10 to-transparent pointer-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel w-full max-w-[420px] p-8 md:p-12 border border-white/10 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-purple/10 border border-brand-purple/20 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(122,92,255,0.15)]">
              <Lock className="w-6 h-6 text-brand-purple" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-medium tracking-[0.1em] uppercase">Security Portal</h2>
              <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed">
                Sign in with Google to access the administrative console
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs bg-red-950/20 border border-red-900/30 p-4 rounded-xl font-medium tracking-wide flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500 animate-pulse" />
                  <span className="text-left font-sans text-[11px] leading-normal uppercase">{error}</span>
                </motion.div>
              )}

              <button
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white hover:bg-white/95 text-black hover:text-black font-display font-bold uppercase tracking-widest text-xs hover:scale-102 active:scale-98 transition-all rounded-xl cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>

            <button 
              onClick={onClose}
              className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors pt-2 block mx-auto cursor-pointer"
            >
              [ Return to Showroom ]
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard Render
  return (
    <div className="absolute inset-0 z-40 bg-bg-dark flex flex-col p-6 md:p-12 overflow-hidden text-white font-sans">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono tracking-[0.4em] text-brand-purple uppercase font-bold">
            Console v2.0 // Lead Center
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium uppercase tracking-tight">
            Underwriting Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 mt-1 text-[9px] tracking-wider uppercase font-mono">
            <span className="text-white/30">Custodian: 17421745 Canada Ltd.</span>
            <span className="text-white/10">•</span>
            <span className="text-brand-cyan/80">PIPEDA Compliant Data Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className="px-5 py-3 border border-white/10 hover:border-brand-purple/40 hover:bg-white/5 text-white/80 hover:text-white text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handleLogOut}
            className="px-5 py-3 bg-red-950/20 hover:bg-red-950/60 border border-red-900/30 hover:border-red-500/50 text-red-400 text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Lock
          </button>
          <button 
            onClick={onClose}
            className="w-10 h-10 border border-white/10 hover:border-white/30 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all cursor-pointer"
            title="Return to Showroom"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics HUD Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leads', val: totalLeads, desc: 'captured', icon: <Users className="w-4 h-4 text-brand-purple" /> },
          { label: 'Approval Rate', val: `${preApprovalRate}%`, desc: 'approved', icon: <ShieldCheck className="w-4 h-4 text-brand-cyan" /> },
          { label: 'Pre-Approved Capital', val: `$${(totalCapitalApproved / 1000).toFixed(0)}k`, desc: 'locked limits', icon: <Wallet className="w-4 h-4 text-green-400" /> },
          { label: 'Avg Scoring Metric', val: `${avgCreditScore}/100`, desc: 'credit quality', icon: <TrendingUp className="w-4 h-4 text-yellow-400" /> }
        ].map((m, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3 opacity-20">{m.icon}</div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">{m.label}</p>
              <h3 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white">{m.val}</h3>
            </div>
            <p className="text-[8px] uppercase tracking-wider text-white/15 mt-2 font-mono">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 pl-11 pr-4 py-3 rounded-xl focus:outline-hidden focus:border-brand-purple transition-all text-sm placeholder:text-white/20 text-white/80"
          />
        </div>
        
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'NEW', 'CONTACTED', 'UNDERWRITTEN', 'CLOSED'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                playSound('selection');
              }}
              className={`px-4 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all border cursor-pointer whitespace-nowrap ${
                statusFilter === f 
                  ? 'bg-brand-purple border-brand-purple text-white shadow-[0_0_15px_rgba(122,92,255,0.3)]' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10 hover:text-white/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar glass-panel rounded-2xl border-white/5 p-4 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">Loading database...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2">
            <AlertCircle className="w-8 h-8 text-white/10" />
            <p className="text-sm font-medium text-white/40">No matching leads found</p>
            <p className="text-xs text-white/20 uppercase tracking-widest">Adjust filters or search parameters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header Labels */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Date Created</div>
              <div className="col-span-2">Credit Tier</div>
              <div className="col-span-2">Target Vehicle</div>
              <div className="col-span-2">Limit Approved</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Leads List */}
            {filteredLeads.map(l => {
              const isExpanded = expandedLeadId === l.id;
              
              return (
                <div 
                  key={l.id} 
                  className={`border transition-all duration-300 rounded-xl overflow-hidden ${
                    isExpanded 
                      ? 'border-brand-purple/30 bg-brand-purple/[0.02]' 
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Summary Grid Item */}
                  <div 
                    onClick={() => {
                      setExpandedLeadId(isExpanded ? null : l.id);
                      playSound('selection');
                    }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer text-sm"
                  >
                    <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-white/90">{l.name}</p>
                        <p className="text-[10px] text-white/30 truncate font-mono">{l.email}</p>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 text-white/60 font-mono text-xs">
                      {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${
                        l.creditScore === 'excellent' ? 'bg-brand-cyan/10 text-brand-cyan' :
                        l.creditScore === 'good' ? 'bg-green-500/10 text-green-400' :
                        l.creditScore === 'fair' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {l.creditScore}
                      </span>
                    </div>

                    <div className="col-span-1 md:col-span-2 font-mono text-xs text-white/80">
                      {l.selectedModel || l.vehicle || 'Not Selected'}
                    </div>

                    <div className="col-span-1 md:col-span-2 font-semibold text-white/90">
                      {l.maxLoan ? `$${l.maxLoan.toLocaleString()}` : 'N/A'}
                    </div>

                    <div className="col-span-1 md:col-span-1 flex items-center justify-between md:justify-end gap-3">
                      <span className={`text-[9px] uppercase font-mono tracking-widest px-2.5 py-1.5 rounded-lg border font-bold ${
                        l.status === 'NEW' ? 'border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan' :
                        l.status === 'CONTACTED' ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400' :
                        l.status === 'UNDERWRITTEN' ? 'border-brand-purple/20 bg-brand-purple/5 text-brand-purple' :
                        'border-green-500/20 bg-green-500/5 text-green-400'
                      }`}>
                        {l.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </div>
                  </div>

                  {/* Expanded Detail Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5 bg-black/20"
                      >
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                          {/* Col 1: Contact & Profile */}
                          <div className="space-y-4 border-r border-white/5 pr-6 last:border-r-0">
                            <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-purple font-bold">Contact Profile</h4>
                            <div className="space-y-3 font-mono text-xs">
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Full Name</p>
                                <p className="text-white/80 font-semibold">{l.name}</p>
                              </div>
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Email Address</p>
                                <p className="text-brand-cyan">{l.email}</p>
                              </div>
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Phone Number</p>
                                <p className="text-white/80">{l.phone}</p>
                              </div>
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Housing Status</p>
                                <p className="text-white/80 uppercase">{l.housingStatus?.replace(/_/g, ' ')}</p>
                              </div>
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Regulatory Consent</p>
                                <div className="space-y-1 mt-1 font-sans">
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <div className={`w-1.5 h-1.5 rounded-full ${l.privacyConsent !== false ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`} />
                                    <span className="text-white/70">PIPEDA: {l.privacyConsent !== false ? 'CONSENTED' : 'NONE'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <div className={`w-1.5 h-1.5 rounded-full ${l.marketingConsent ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-white/20'}`} />
                                    <span className="text-white/50">CASL Marketing: {l.marketingConsent ? 'OPT-IN' : 'OPT-OUT'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Underwriting variables */}
                          <div className="space-y-4 border-r border-white/5 pr-6 last:border-r-0">
                            <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-purple font-bold">Risk Parameters</h4>
                            <div className="space-y-3 font-mono text-xs">
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Employment Status</p>
                                <p className="text-white/80 capitalize">{l.employment}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-white/30 uppercase text-[9px]">Monthly Income</p>
                                  <p className="text-white/80 font-bold">${parseFloat(l.income || '0').toLocaleString()}/mo</p>
                                </div>
                                <div>
                                  <p className="text-white/30 uppercase text-[9px]">Obligations/Debt</p>
                                  <p className="text-white/80">${parseFloat(l.monthlyDebt || '0').toLocaleString()}/mo</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Debt-to-Income (DTI)</p>
                                <p className={`font-bold ${
                                  (parseFloat(l.monthlyDebt) / parseFloat(l.income)) < 0.3 ? 'text-brand-cyan' :
                                  (parseFloat(l.monthlyDebt) / parseFloat(l.income)) < 0.45 ? 'text-yellow-400' :
                                  'text-red-400'
                                }`}>
                                  {((parseFloat(l.monthlyDebt || '0') / parseFloat(l.income || '1')) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-white/30 uppercase text-[9px]">Down Payment capacity</p>
                                <p className="text-white/80">${parseFloat(l.downPayment || '0').toLocaleString()}</p>
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Scoring & Pipeline Actions */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-purple font-bold">Decision Results</h4>
                            
                            <div className="space-y-3 font-mono text-xs">
                              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                <div>
                                  <p className="text-white/30 uppercase text-[9px]">Max Approved</p>
                                  <p className="text-brand-cyan text-lg font-bold">${l.maxLoan?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-white/30 uppercase text-[9px]">Risk Tier</p>
                                  <p className={`font-bold capitalize ${
                                    l.riskTier === 'low' ? 'text-brand-cyan' :
                                    l.riskTier === 'moderate' ? 'text-green-400' :
                                    'text-red-400'
                                  }`}>{l.riskTier || 'N/A'}</p>
                                </div>
                              </div>

                              {/* Lead Status Workflow Dropdown */}
                              <div>
                                <p className="text-white/30 uppercase text-[9px] mb-1.5">Update Workflow status</p>
                                <select 
                                  value={l.status}
                                  onChange={(e) => handleUpdateStatus(l.id, e.target.value as Lead['status'])}
                                  className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-brand-purple cursor-pointer"
                                >
                                  <option value="NEW" className="bg-bg-dark text-white">NEW</option>
                                  <option value="CONTACTED" className="bg-bg-dark text-white">CONTACTED</option>
                                  <option value="UNDERWRITTEN" className="bg-bg-dark text-white">UNDERWRITTEN</option>
                                  <option value="CLOSED" className="bg-bg-dark text-white">CLOSED</option>
                                </select>
                              </div>

                              {/* Erasure Action (PIPEDA right-to-be-forgotten) */}
                              <div className="pt-2">
                                <button
                                  onClick={() => handleDeleteLead(l.id, l.name)}
                                  className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/60 border border-red-900/30 hover:border-red-500/50 text-red-400 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  Delete Lead Record
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
