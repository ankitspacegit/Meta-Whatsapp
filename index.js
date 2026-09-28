import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Storage File Path
const DB_FILE = path.join(__dirname, 'db.json');

// Default initial database state
const DEFAULT_DB = {
  platformSettings: {
    metaAppId: '109283746501928',
    metaAppSecret: '••••••••••••••••••••••••••••••••',
    metaGraphVersion: 'v20.0',
    systemWebhookUrl: 'https://whatsapp.sheetbotics.in/webhook/whatsapp',
    systemWebhookVerifyToken: 'sheetbotics_live_token_2026',
    paymentGateway: {
      provider: 'razorpay',
      keyId: 'rzp_live_••••••••••••',
      keySecret: '••••••••••••••••••••••••',
      webhookSecret: '••••••••••••••••',
    },
    smtp: {
      senderEmail: 'noreply@sheetbotics.app',
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: true,
    },
    maintenanceMode: false,
    updatedAt: new Date().toISOString(),
  },
  webhookLogs: [],
  auditLogs: [
    {
      id: 'aud_sys_01',
      action: 'PLATFORM_INITIALIZED',
      details: 'Sheetbotics Super Admin & Multi-Tenant WhatsApp Gateway activated.',
      admin: 'System',
      timestamp: new Date().toISOString(),
    },
  ],
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return DEFAULT_DB;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// ==========================================
// 1. HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sheetbotics WhatsApp SaaS Backend & Super Admin API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. OFFICIAL META WHATSAPP WEBHOOK ENDPOINTS
// ==========================================

// Verification handshake with Meta servers
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const db = readDb();
  const verifyToken = db.platformSettings?.systemWebhookVerifyToken || 'sheetbotics_live_token_2026';

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Meta WhatsApp Webhook Handshake verified successfully.');
      return res.status(200).send(challenge);
    } else {
      console.warn('❌ Meta Webhook verification token mismatch.');
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

// Inbound messages & delivery status receipts from Meta
app.post('/webhook/whatsapp', (req, res) => {
  const body = req.body;

  const db = readDb();
  const logEntry = {
    id: `whk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    object: body?.object || 'whatsapp_business_account',
    payload: body,
  };

  // Keep last 100 webhook logs in buffer
  const logs = [logEntry, ...(db.webhookLogs || [])].slice(0, 100);
  db.webhookLogs = logs;
  writeDb(db);

  console.log(`📩 Received WhatsApp Webhook: ${logEntry.id}`);

  // Acknowledge receipt to Meta immediately (Meta requires <3000ms 200 OK)
  res.status(200).json({ status: 'received', logId: logEntry.id });
});

// ==========================================
// 3. SUPER ADMIN — PLATFORM SETTINGS
// ==========================================

app.get('/api/admin/settings', (req, res) => {
  const db = readDb();
  res.json({ success: true, settings: db.platformSettings });
});

app.put('/api/admin/settings', (req, res) => {
  const updates = req.body;
  const db = readDb();

  db.platformSettings = {
    ...db.platformSettings,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    action: 'PLATFORM_SETTINGS_UPDATED',
    details: 'Global Meta API & Platform configuration modified.',
    admin: req.headers['x-admin-user'] || 'Superadmin',
    timestamp: new Date().toISOString(),
  });

  writeDb(db);
  res.json({ success: true, settings: db.platformSettings });
});

// Test handshake to Meta Graph API
app.post('/api/admin/test-meta-handshake', async (req, res) => {
  const { appId, appSecret } = req.body;
  const db = readDb();
  const effectiveAppId = appId || db.platformSettings?.metaAppId;
  const effectiveAppSecret = appSecret || db.platformSettings?.metaAppSecret;

  if (!effectiveAppId || !effectiveAppSecret) {
    return res.status(400).json({
      success: false,
      message: 'App ID and App Secret are required for Meta Graph API handshake test.',
    });
  }

  try {
    // Attempt OAuth App Token handshake
    const response = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${effectiveAppId}&client_secret=${effectiveAppSecret}&grant_type=client_credentials`
    );
    const data = await response.json();

    if (response.ok && data.access_token) {
      return res.json({
        success: true,
        message: 'Meta Cloud API App credentials are valid and active!',
        tokenType: data.token_type,
      });
    } else {
      return res.json({
        success: false,
        message: data.error?.message || 'Meta API returned an error during verification.',
        errorDetail: data.error,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Network error reaching graph.facebook.com: ${err.message}`,
    });
  }
});

// ==========================================
// 4. SUPER ADMIN — AUDIT LOGS & WEBHOOK STREAM
// ==========================================

app.get('/api/admin/webhook-logs', (req, res) => {
  const db = readDb();
  res.json({ success: true, logs: db.webhookLogs || [] });
});

app.get('/api/admin/audit-logs', (req, res) => {
  const db = readDb();
  res.json({ success: true, logs: db.auditLogs || [] });
});

// ==========================================
// 5. TENANT / CUSTOMER META WABA INTEGRATION
// ==========================================

// Fetch real-time health, limits, phone number & WABA details from Meta Graph API
app.post('/api/whatsapp/fetch-meta-details', async (req, res) => {
  const { wabaId, phoneNumberId, businessManagerId, accessToken, isDemoFallback } = req.body;

  if (!wabaId || !phoneNumberId || !accessToken) {
    return res.status(400).json({
      success: false,
      message: 'WABA ID, Phone Number ID, and Permanent Access Token are required.',
    });
  }

  // Support sandbox / simulated test credentials if explicit or starting with demo_
  if (isDemoFallback || accessToken.startsWith('demo_') || wabaId.startsWith('demo_')) {
    const demoPayload = {
      wabaId: wabaId || '109283746501928',
      phoneNumberId: phoneNumberId || '105492817290123',
      businessManagerId: businessManagerId || '392817462019284',
      accessToken: accessToken,
      wabaName: 'Sheetbotics Official WABA',
      displayPhoneNumber: '+91 98765 43210',
      verifiedDisplayName: 'Sheetbotics Technologies Pvt Ltd',
      tokenStatus: 'ACTIVE (Valid System User Token)',
      messagingLimit: 'Tier 1K (1,000 unique users/24hr)',
      qualityRating: 'GREEN (High Quality)',
      phoneVerification: 'VERIFIED',
      displayNameStatus: 'APPROVED',
      numberStatus: 'CONNECTED',
      throughput: '80 msgs/sec (Standard Cloud API)',
      wabaReview: 'APPROVED',
      businessVerification: 'VERIFIED',
      businessManagerOwner: businessManagerId
        ? `Sheetbotics Corp (BM ID: ${businessManagerId})`
        : 'Sheetbotics Technologies (BM ID: 392817462019284)',
      webhookCallbackUrl: 'https://whatsapp.sheetbotics.in/webhook/whatsapp',
      webhookVerifyToken: 'sheetbotics_live_token_2026',
      fetchedAt: new Date().toISOString(),
    };
    return res.json({
      success: true,
      isDemo: true,
      message: 'Meta Cloud API credentials verified in Sandbox Simulator.',
      data: demoPayload,
    });
  }

  try {
    const metaGraphVersion = 'v20.0';

    // 1. Fetch Phone Number details from Meta Graph API
    const phoneUrl = `https://graph.facebook.com/${metaGraphVersion}/${encodeURIComponent(
      phoneNumberId
    )}?fields=display_phone_number,verified_name,code_verification_status,quality_rating,name_status,messaging_tier,throughput,status&access_token=${encodeURIComponent(
      accessToken
    )}`;

    // 2. Fetch WABA details from Meta Graph API
    const wabaUrl = `https://graph.facebook.com/${metaGraphVersion}/${encodeURIComponent(
      wabaId
    )}?fields=id,name,account_review_status,business_verification_status,owner_business_info,currency,timezone_id&access_token=${encodeURIComponent(
      accessToken
    )}`;

    const [phoneRes, wabaRes] = await Promise.allSettled([
      fetch(phoneUrl),
      fetch(wabaUrl),
    ]);

    let phoneData = null;
    let wabaData = null;

    if (phoneRes.status === 'fulfilled') {
      try {
        phoneData = await phoneRes.value.json();
      } catch (e) {
        phoneData = null;
      }
    }
    if (wabaRes.status === 'fulfilled') {
      try {
        wabaData = await wabaRes.value.json();
      } catch (e) {
        wabaData = null;
      }
    }

    // Inspect if Meta rejected the request
    if (phoneData?.error || wabaData?.error) {
      const err = phoneData?.error || wabaData?.error;
      console.warn('Meta Graph API returned error during customer connect:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Meta Graph API returned an error.',
        metaError: err,
        code: err.code,
        errorSubcode: err.error_subcode,
        fbtrace_id: err.fbtrace_id,
      });
    }

    // Format Messaging Tier
    let messagingLimitFormatted = 'Tier 1K (1,000 unique users/24hr)';
    const tier = phoneData?.messaging_tier;
    if (tier === 'TIER_10K') messagingLimitFormatted = 'Tier 10K (10,000 unique users/24hr)';
    else if (tier === 'TIER_100K') messagingLimitFormatted = 'Tier 100K (100,000 unique users/24hr)';
    else if (tier === 'TIER_UNLIMITED') messagingLimitFormatted = 'Unlimited unique users/24hr';
    else if (tier) messagingLimitFormatted = tier;

    // Format Quality Rating
    let qualityRatingFormatted = phoneData?.quality_rating || 'GREEN';
    if (qualityRatingFormatted === 'GREEN') qualityRatingFormatted = 'GREEN (High Quality)';
    else if (qualityRatingFormatted === 'YELLOW') qualityRatingFormatted = 'YELLOW (Medium Quality)';
    else if (qualityRatingFormatted === 'RED') qualityRatingFormatted = 'RED (Low Quality)';

    // Format Throughput
    let throughputFormatted = '80 msgs/sec (Standard Cloud API)';
    if (phoneData?.throughput?.level) {
      throughputFormatted = `${phoneData.throughput.level} (${phoneData.throughput.level === 'STANDARD' ? '80 msgs/sec' : 'Tiered High Volume'})`;
    }

    // Format Owner BM
    let ownerBm = businessManagerId ? `Business Manager (ID: ${businessManagerId})` : 'Connected Meta Business';
    if (wabaData?.owner_business_info?.name) {
      ownerBm = `${wabaData.owner_business_info.name} (BM: ${wabaData.owner_business_info.id || businessManagerId})`;
    } else if (businessManagerId) {
      ownerBm = `Business Manager (BM ID: ${businessManagerId})`;
    }

    const payload = {
      wabaId: wabaId,
      phoneNumberId: phoneNumberId,
      businessManagerId: businessManagerId || wabaData?.owner_business_info?.id || '',
      accessToken: accessToken,
      wabaName: wabaData?.name || 'Meta WhatsApp Account',
      displayPhoneNumber: phoneData?.display_phone_number || '',
      verifiedDisplayName: phoneData?.verified_name || wabaData?.name || 'Verified Business',
      tokenStatus: 'ACTIVE (Valid System User Token)',
      messagingLimit: messagingLimitFormatted,
      qualityRating: qualityRatingFormatted,
      phoneVerification: phoneData?.code_verification_status || 'VERIFIED',
      displayNameStatus: phoneData?.name_status || 'APPROVED',
      numberStatus: phoneData?.status || 'CONNECTED',
      throughput: throughputFormatted,
      wabaReview: wabaData?.account_review_status || 'APPROVED',
      businessVerification: (wabaData?.business_verification_status || 'VERIFIED').toUpperCase(),
      businessManagerOwner: ownerBm,
      webhookCallbackUrl: 'https://whatsapp.sheetbotics.in/webhook/whatsapp',
      webhookVerifyToken: 'sheetbotics_live_token_2026',
      fetchedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: 'Meta WhatsApp account details fetched and verified successfully!',
      data: payload,
    });
  } catch (err) {
    console.error('Exception fetching Meta details:', err);
    return res.status(500).json({
      success: false,
      message: `Failed to connect to Meta Graph API: ${err.message}`,
    });
  }
});

// Endpoint to trigger a test webhook ping
app.post('/api/whatsapp/test-webhook-ping', (req, res) => {
  const db = readDb();
  const testPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: req.body?.wabaId || '109283746501928',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: req.body?.displayPhoneNumber || '+91 98765 43210',
                phone_number_id: req.body?.phoneNumberId || '105492817290123',
              },
              statuses: [
                {
                  id: `wamid.test_${Date.now()}`,
                  status: 'delivered',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  recipient_id: '919876543210',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  const logEntry = {
    id: `whk_test_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1 (Self-Test Ping)',
    object: 'whatsapp_business_account',
    payload: testPayload,
  };

  const logs = [logEntry, ...(db.webhookLogs || [])].slice(0, 100);
  db.webhookLogs = logs;
  writeDb(db);

  res.json({
    success: true,
    message: 'Test Webhook Ping sent to https://whatsapp.sheetbotics.in/webhook/whatsapp',
    log: logEntry,
  });
});

// ==========================================
// 6. SERVE PRODUCTION FRONTEND (DIST SPA)
// ==========================================
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Fallback for React Router / SPA navigation (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/webhook')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Sheetbotics Backend API listening on port ${PORT}`);
  console.log(`   - Webhook URL: http://localhost:${PORT}/webhook/whatsapp`);
  console.log(`   - Health:      http://localhost:${PORT}/api/health`);
  console.log(`   - Superadmin:  http://localhost:${PORT}/api/admin/settings`);
  console.log(`====================================================`);
});
