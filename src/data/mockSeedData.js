// ============================================================
// Sheetbotics WhatsApp Management — Initial Empty State Data
// All data will be created by real users at runtime.
// No fake or demo records are pre-loaded.
// ============================================================

export const initialAccounts = [];

export const initialUsers = [];

export const initialChannels = [];

export const initialContacts = [];

export const initialConversations = [];

export const initialMessages = [];

export const initialTemplates = [];

export const initialCampaigns = [];

export const initialAutomations = [];

export const initialAutomationLogs = [];

export const initialImportLogs = [];

export const initialAuditLogs = [];

export const initialInvoices = [];

// Subscription plan tiers (static product config, not user data)
export const initialPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: [
      '5,000 WhatsApp Conversations/mo',
      '1 WhatsApp Channel (WABA)',
      '2 Team Agent Seats',
      'Standard Template Manager',
      'Basic Broadcasts',
      'Email Support',
    ],
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$79',
    period: '/month',
    features: [
      '25,000 WhatsApp Conversations/mo',
      '2 WhatsApp Channels (WABA)',
      '10 Team Agent Seats',
      'Dynamic Message Templates',
      'High-Speed Broadcast Engine',
      'Visual Automation Flow Engine',
      'CSV Importer & Error Inspector',
      'Priority 24/7 Support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    features: [
      '100,000+ WhatsApp Conversations/mo',
      'Unlimited WhatsApp Channels',
      'Unlimited Agent Seats',
      'Custom API Webhooks & Integrations',
      'Dedicated Meta WABA Tier Escalation',
      'Multi-Tenant White-Labeling',
      'Dedicated Account Manager',
    ],
    popular: false,
  },
];
