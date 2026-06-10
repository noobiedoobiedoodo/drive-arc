import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import crypto from "crypto";


const app = express();
const PORT = Number(process.env.PORT) || 3000;

// JSON Persistence Setup for Lead Management
const LEADS_FILE = path.join(process.cwd(), "leads.json");

interface LeadData {
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

const readLeads = (): LeadData[] => {
  try {
    if (!fs.existsSync(LEADS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(raw) || [];
  } catch (error) {
    console.error("Error reading leads file:", error);
    return [];
  }
};

const writeLeads = (leads: LeadData[]) => {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing leads file:", error);
  }
};

// Google OAuth is used instead of administrative passcodes.

// Cookie Parser Helper for HTTP-Only sessions
const parseCookies = (cookieHeader?: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
  return cookies;
};

// Active sessions cache
const activeSessions = new Set<string>();

// Security Gate middleware for Admin Routes (HttpOnly Cookies check)
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["admin_session"];
  
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized: Invalid session" });
  }
  next();
};

app.use(express.json());

// 🎯 CORE MODEL: Weighted Risk Scoring Engine
app.post("/api/score", (req, res) => {
  const data = req.body;
  console.log(">>> [API/SCORE] INCOMING:", data);

  const {
    incomeMonthly: incomeMonthlyRaw,
    employmentStatus,
    creditScoreRange,
    monthlyDebt: monthlyDebtRaw,
    downPayment: downPaymentRaw
  } = data;

  const incomeMonthly = parseFloat(incomeMonthlyRaw) || 0;
  const monthlyDebt = parseFloat(monthlyDebtRaw) || 0;
  const downPayment = parseFloat(downPaymentRaw) || 0;

  const DTI = monthlyDebt / (incomeMonthly || 1);

  let score = 0;
  const reasons: string[] = [];

  // Employment
  if (employmentStatus === "full-time") { score += 25; reasons.push("Stable full-time employment"); }
  else if (employmentStatus === "part-time") { score += 18; reasons.push("Part-time income verified"); }
  else if (employmentStatus === "self-employed") { score += 15; reasons.push("Entrepreneurial revenue path"); }
  else { score += 5; reasons.push("Status verification required"); }

  // Credit
  if (creditScoreRange === "excellent") { score += 25; reasons.push("Excellent credit profile"); }
  else if (creditScoreRange === "good") score += 20;
  else if (creditScoreRange === "fair") score += 14;
  else { score += 8; reasons.push("Challenged credit pathway"); }

  // DTI
  if (DTI < 0.2) { score += 20; reasons.push("Low debt-to-income load"); }
  else if (DTI < 0.35) score += 16;
  else if (DTI < 0.5) score += 10;
  else { score += 5; reasons.push("Higher DTI ratio threshold"); }

  // Income strength
  if (incomeMonthly > 6000) { score += 15; reasons.push("Tier 1 income strength"); }
  else if (incomeMonthly > 4500) score += 12;
  else if (incomeMonthly > 3000) score += 9;
  else score += 6;

  // Down payment
  if (downPayment >= 5000) score += 10;
  else if (downPayment >= 2500) score += 7;
  else if (downPayment >= 1000) score += 5;

  score = Math.min(score, 100);

  // Risk tier
  let riskTier = "moderate";
  if (score >= 80) riskTier = "low";
  else if (score >= 60) riskTier = "moderate";
  else if (score >= 40) riskTier = "high";
  else riskTier = "very_high";

  // Loan calc
  let maxPayment = incomeMonthly * 0.15 - monthlyDebt * 0.5;
  if (maxPayment < 150) maxPayment = 150;

  const loanFactor = 0.0203;
  let maxLoan = maxPayment / loanFactor;

  if (riskTier === "low") maxLoan *= 1.1;
  if (riskTier === "high") maxLoan *= 0.75;
  if (riskTier === "very_high") maxLoan *= 0.55;

  const monthlyEstimate = maxLoan * loanFactor;

  // Revenue Machine Logic: Strategic Status Mapping
  let status: "APPROVED" | "CONDITIONAL" | "REVIEW" = "REVIEW";
  let priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" = "LOW";
  let routing = "general_queue";
  let offer = "standard_terms";

  if (score >= 70) {
    status = "APPROVED";
    priority = "HIGH";
    routing = "senior_closers";
    offer = "preferred_rate_0.9";
  } else if (score >= 45) {
    status = "CONDITIONAL"; // The Money Tier
    priority = "URGENT";
    routing = "rapid_response_team";
    offer = "flex_approval_low_down";
  } else {
    status = "REVIEW";
    priority = "NORMAL";
    routing = "manual_underwriting";
    offer = "custom_program_match";
  }

  const result = {
    approvalScore: Math.round(score),
    riskTier,
    maxLoan: Math.round(maxLoan),
    monthlyEstimate: Math.round(monthlyEstimate),
    reasonCodes: reasons.slice(0, 4),
    status,
    priority,
    routing,
    offer
  };

  console.log("<<< [API/SCORE] REVENUE RESULT:", result);
  res.status(200).json(result);
});

app.post("/api/lead", (req, res) => {
  const lead = req.body;
  console.log("💰 LEAD CAPTURED (Revenue Machine):", lead);
  
  const leads = readLeads();
  const existingIndex = lead.id ? leads.findIndex(l => l.id === lead.id) : -1;

  if (existingIndex !== -1) {
    const existing = leads[existingIndex];
    leads[existingIndex] = {
      ...existing,
      ...lead,
      id: existing.id,
      createdAt: existing.createdAt
    };
    writeLeads(leads);

    res.status(200).json({
      success: true,
      leadId: existing.id,
      updatedAt: new Date().toISOString(),
      automationTriggered: ["SMS_SALES", "EMAIL_USER"]
    });
  } else {
    const newLead: LeadData = {
      ...lead,
      id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: lead.status || 'NEW',
      createdAt: new Date().toISOString()
    };

    leads.push(newLead);
    writeLeads(leads);
    
    res.status(200).json({ 
      success: true, 
      leadId: newLead.id,
      capturedAt: newLead.createdAt,
      automationTriggered: ["SMS_SALES", "EMAIL_USER"]
    });
  }
});

app.get("/api/auth/google", (req, res) => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  if (!clientID) {
    console.error("GOOGLE_CLIENT_ID is not configured.");
    return res.status(500).send("Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID.");
  }
  
  const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${hostUrl}/api/auth/google/callback`;
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
  
  res.redirect(googleAuthUrl);
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    console.error("Google OAuth error parameter:", error);
    return res.redirect("/admin?error=auth_failed");
  }
  
  if (!code) {
    return res.redirect("/admin?error=no_code");
  }
  
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.error("Missing Google credentials in callback");
    return res.redirect("/admin?error=configuration_error");
  }
  
  const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${hostUrl}/api/auth/google/callback`;
  
  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientID,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    
    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Google token exchange failed:", errBody);
      return res.redirect("/admin?error=token_exchange_failed");
    }
    
    const tokenData = await tokenResponse.json() as { access_token: string; id_token: string };
    
    // 2. Fetch user profile (specifically email)
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    if (!userinfoResponse.ok) {
      console.error("Google userinfo fetch failed");
      return res.redirect("/admin?error=userinfo_failed");
    }
    
    const userData = await userinfoResponse.json() as { email: string; name?: string };
    const email = userData.email?.toLowerCase();
    
    if (!email) {
      console.error("No email returned from Google profile");
      return res.redirect("/admin?error=no_email");
    }
    
    // 3. Verify against allowed admin emails
    const allowedEmailsStr = process.env.ALLOWED_ADMIN_EMAILS || "";
    const allowedEmails = allowedEmailsStr
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
      
    if (allowedEmails.length === 0) {
      console.warn("WARNING: ALLOWED_ADMIN_EMAILS is empty. Blocking all logins.");
    }
    
    if (!allowedEmails.includes(email)) {
      console.warn(`Unauthorized login attempt by: ${email}`);
      return res.redirect(`/admin?error=unauthorized_email&email=${encodeURIComponent(email)}`);
    }
    
    // 4. Authenticate session
    const sessionToken = crypto.randomUUID();
    activeSessions.add(sessionToken);
    
    // Auto-expire session token after 2 hours
    setTimeout(() => {
      activeSessions.delete(sessionToken);
    }, 2 * 60 * 60 * 1000);
    
    // Set HTTP-Only Secure Cookie
    res.setHeader(
      "Set-Cookie",
      `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );
    
    console.log(`Successfully authenticated admin: ${email}`);
    return res.redirect("/admin");
  } catch (err) {
    console.error("Error during Google OAuth process:", err);
    return res.redirect("/admin?error=server_error");
  }
});

app.post("/api/admin/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["admin_session"];
  if (token) {
    activeSessions.delete(token);
  }
  
  // Clear the cookie in response
  res.setHeader(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
  );
  
  return res.status(200).json({ success: true });
});

app.get("/api/leads", requireAdmin, (req, res) => {
  const leads = readLeads();
  res.status(200).json(leads);
});

app.patch("/api/leads/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const leads = readLeads();
  const index = leads.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }
  
  leads[index] = { ...leads[index], ...updates };
  writeLeads(leads);
  
  res.status(200).json(leads[index]);
});

app.delete("/api/leads/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const leads = readLeads();
  const index = leads.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }
  
  leads.splice(index, 1);
  writeLeads(leads);
  
  res.status(200).json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
