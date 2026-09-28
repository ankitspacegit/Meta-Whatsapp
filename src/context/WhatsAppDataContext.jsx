import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initialContacts,
  initialConversations,
  initialMessages,
  initialTemplates,
  initialCampaigns,
  initialAutomations,
  initialAutomationLogs,
  initialImportLogs,
  initialChannels,
  initialAuditLogs,
  initialInvoices,
  initialPlans,
} from '../data/mockSeedData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { processAutomationEvent } from '../services/automationEngine';
import { formatToE164, validateWhatsAppPhone } from '../services/metaWhatsAppService';

const WhatsAppDataContext = createContext(null);

export function WhatsAppDataProvider({ children }) {
  const { currentAccount, currentUser, users } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const accountId = currentAccount?.id || 'acc_sheetbotics_01';

  // State slices initialized from LocalStorage or defaults
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem(`sb_contacts_${accountId}`);
    return saved ? JSON.parse(saved) : initialContacts.filter((c) => c.accountId === accountId);
  });

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem(`sb_conversations_${accountId}`);
    return saved ? JSON.parse(saved) : initialConversations.filter((c) => c.accountId === accountId);
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`sb_messages_${accountId}`);
    return saved ? JSON.parse(saved) : initialMessages.filter((m) => m.accountId === accountId);
  });

  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem(`sb_templates_${accountId}`);
    return saved ? JSON.parse(saved) : initialTemplates.filter((t) => t.accountId === accountId);
  });

  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem(`sb_campaigns_${accountId}`);
    return saved ? JSON.parse(saved) : initialCampaigns.filter((c) => c.accountId === accountId);
  });

  const [automations, setAutomations] = useState(() => {
    const saved = localStorage.getItem(`sb_automations_${accountId}`);
    return saved ? JSON.parse(saved) : initialAutomations.filter((a) => a.accountId === accountId);
  });

  const [automationLogs, setAutomationLogs] = useState(() => {
    const saved = localStorage.getItem(`sb_automation_logs_${accountId}`);
    return saved ? JSON.parse(saved) : initialAutomationLogs.filter((l) => l.accountId === accountId);
  });

  const [importLogs, setImportLogs] = useState(() => {
    const saved = localStorage.getItem(`sb_import_logs_${accountId}`);
    return saved ? JSON.parse(saved) : initialImportLogs.filter((i) => i.accountId === accountId);
  });

  const [channels, setChannels] = useState(() => {
    const saved = localStorage.getItem(`sb_channels_${accountId}`);
    return saved ? JSON.parse(saved) : initialChannels.filter((ch) => ch.accountId === accountId);
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem(`sb_audit_logs_${accountId}`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [activeConversationId, setActiveConversationId] = useState(
    conversations[0]?.id || 'conv_01'
  );

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(`sb_contacts_${accountId}`, JSON.stringify(contacts));
  }, [contacts, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_conversations_${accountId}`, JSON.stringify(conversations));
  }, [conversations, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_messages_${accountId}`, JSON.stringify(messages));
  }, [messages, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_templates_${accountId}`, JSON.stringify(templates));
  }, [templates, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_campaigns_${accountId}`, JSON.stringify(campaigns));
  }, [campaigns, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_automations_${accountId}`, JSON.stringify(automations));
  }, [automations, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_automation_logs_${accountId}`, JSON.stringify(automationLogs));
  }, [automationLogs, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_import_logs_${accountId}`, JSON.stringify(importLogs));
  }, [importLogs, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_channels_${accountId}`, JSON.stringify(channels));
  }, [channels, accountId]);

  useEffect(() => {
    localStorage.setItem(`sb_audit_logs_${accountId}`, JSON.stringify(auditLogs));
  }, [auditLogs, accountId]);

  // Record Audit Trail Entry
  const recordAuditLog = useCallback((action, entity) => {
    const newLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      user: currentUser?.fullName || 'User',
      role: currentUser?.role || 'Admin',
      action,
      entity,
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [currentUser]);

  // ==========================================
  // CONTACTS ACTIONS
  // ==========================================
  const addContact = useCallback((contactData) => {
    const formattedPhone = formatToE164(contactData.mobileNumber);
    if (!validateWhatsAppPhone(formattedPhone)) {
      showError('Invalid Phone', 'Please provide a valid E.164 phone number with country code.');
      return null;
    }

    const newContact = {
      id: `cnt_${Date.now()}`,
      accountId,
      name: contactData.name,
      mobileNumber: formattedPhone,
      email: contactData.email || '',
      company: contactData.company || '',
      tags: contactData.tags || ['Lead'],
      source: contactData.source || 'manual',
      optInStatus: contactData.optInStatus || 'opted_in',
      status: 'active',
      customAttributes: contactData.customAttributes || {},
      lastContactedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: contactData.notes || '',
    };

    setContacts((prev) => [newContact, ...prev]);
    recordAuditLog('Added Contact', `${newContact.name} (${newContact.mobileNumber})`);
    showSuccess('Contact Added', `${newContact.name} added to WhatsApp directory.`);

    // Run Automation for 'new_contact'
    runAutomationTrigger('new_contact', newContact);
    return newContact;
  }, [accountId, recordAuditLog, showSuccess, showError]);

  const updateContact = useCallback((id, updates) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    recordAuditLog('Updated Contact', `Contact ID: ${id}`);
    showSuccess('Contact Updated', 'Contact details saved.');
  }, [recordAuditLog, showSuccess]);

  const deleteContact = useCallback((id) => {
    const target = contacts.find((c) => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      recordAuditLog('Deleted Contact', `${target.name} (${target.mobileNumber})`);
    }
    showInfo('Contact Deleted', 'Contact removed from directory.');
  }, [contacts, recordAuditLog, showInfo]);

  const bulkTagContacts = useCallback((contactIds, tagToAdd) => {
    if (!tagToAdd.trim()) return;
    setContacts((prev) =>
      prev.map((c) => {
        if (contactIds.includes(c.id)) {
          const currentTags = c.tags || [];
          if (!currentTags.includes(tagToAdd)) {
            return { ...c, tags: [...currentTags, tagToAdd] };
          }
        }
        return c;
      })
    );
    recordAuditLog('Bulk Tagged Contacts', `${contactIds.length} contacts tagged with "${tagToAdd}"`);
    showSuccess('Tags Applied', `Added "${tagToAdd}" to ${contactIds.length} contacts.`);
  }, [recordAuditLog, showSuccess]);

  const bulkDeleteContacts = useCallback((contactIds) => {
    setContacts((prev) => prev.filter((c) => !contactIds.includes(c.id)));
    recordAuditLog('Bulk Deleted Contacts', `${contactIds.length} contacts deleted`);
    showInfo('Contacts Removed', `${contactIds.length} contacts deleted.`);
  }, [recordAuditLog, showInfo]);

  // Bulk Import Contacts from CSV with complete statistics & error logging
  const importContactsBatch = useCallback((fileData, fileName) => {
    let successCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    let failedCount = 0;
    const errors = [];
    const newContactsToAdd = [];

    const existingPhones = new Set(contacts.map((c) => c.mobileNumber));

    fileData.forEach((row, index) => {
      const rowNum = index + 2; // account for header
      const rawPhone = row.mobileNumber || row.phone || row.Mobile || row.Phone || row['Mobile Number'];
      const rawName = row.name || row.Name || row['Full Name'] || 'Customer';
      const rawEmail = row.email || row.Email || '';
      const rawCompany = row.company || row.Company || '';
      const rawTags = row.tags || row.Tags ? (row.tags || row.Tags).split(',').map((t) => t.trim()) : ['Imported'];

      if (!rawPhone) {
        invalidCount++;
        errors.push({ row: rowNum, phone: 'Empty', reason: 'Phone number field missing' });
        return;
      }

      const formatted = formatToE164(String(rawPhone));
      if (!validateWhatsAppPhone(formatted)) {
        invalidCount++;
        errors.push({ row: rowNum, phone: String(rawPhone), reason: 'Invalid E.164 phone format' });
        return;
      }

      if (existingPhones.has(formatted)) {
        duplicateCount++;
        errors.push({ row: rowNum, phone: formatted, reason: 'Duplicate phone already in directory' });
        return;
      }

      existingPhones.add(formatted);
      successCount++;
      newContactsToAdd.push({
        id: `cnt_imp_${Date.now()}_${index}`,
        accountId,
        name: rawName,
        mobileNumber: formatted,
        email: rawEmail,
        company: rawCompany,
        tags: rawTags,
        source: 'import',
        optInStatus: 'opted_in',
        status: 'active',
        customAttributes: {},
        lastContactedAt: null,
        createdAt: new Date().toISOString(),
        notes: `Imported from ${fileName}`,
      });
    });

    if (newContactsToAdd.length > 0) {
      setContacts((prev) => [...newContactsToAdd, ...prev]);
    }

    const importLog = {
      id: `imp_${Date.now()}`,
      accountId,
      fileName,
      uploadedBy: currentUser?.fullName || 'Admin',
      uploadDate: new Date().toISOString(),
      totalRecords: fileData.length,
      successfulRecords: successCount,
      duplicateRecords: duplicateCount,
      invalidRecords: invalidCount,
      failedRecords: failedCount,
      status: 'completed',
      errorDetails: errors,
    };

    setImportLogs((prev) => [importLog, ...prev]);
    recordAuditLog('Imported Contacts File', `${fileName} (${successCount} added, ${duplicateCount} duplicates)`);
    showSuccess('Import Completed', `${successCount} contacts imported successfully.`);
    return importLog;
  }, [contacts, accountId, currentUser, recordAuditLog, showSuccess]);

  // ==========================================
  // INBOX & MESSAGES ACTIONS
  // ==========================================
  const sendMessage = useCallback((arg1, arg2, arg3, arg4) => {
    let conversationId, text, templateName, mediaUrl;
    if (typeof arg1 === 'object' && arg1 !== null) {
      conversationId = arg1.conversationId;
      text = arg1.text;
      templateName = arg1.templateName;
      mediaUrl = arg1.mediaUrl;
    } else {
      conversationId = arg1;
      text = arg2;
      templateName = arg3 === 'template' ? arg4 : null;
      mediaUrl = arg3 === 'image' || arg3 === 'media' ? arg4 : null;
    }

    if (!conversationId) return;

    let conv = conversations.find((c) => c.id === conversationId);
    if (!conv) {
      conv = {
        id: conversationId,
        accountId,
        contactId: `cnt_${Date.now()}`,
        contactName: 'WhatsApp Contact',
        contactPhone: '',
        channelId: channels[0]?.id || 'chan_01',
        assignedToUserId: currentUser?.id,
        assignedToName: currentUser?.fullName || 'Agent',
        status: 'open',
        lastMessageText: text || '',
        lastMessageTimestamp: new Date().toISOString(),
        unreadCount: 0,
        tags: [],
      };
      setConversations((prev) => [conv, ...prev]);
    }

    const newMsgId = `msg_${Date.now()}`;
    const newMsg = {
      id: newMsgId,
      accountId,
      conversationId,
      contactId: conv?.contactId || `cnt_${Date.now()}`,
      direction: 'outbound',
      type: templateName ? 'template' : mediaUrl ? 'image' : 'text',
      text: text || '',
      templateName: templateName || null,
      mediaUrl: mediaUrl || null,
      status: 'sending',
      timestamp: new Date().toISOString(),
      senderName: currentUser?.fullName || 'Agent',
    };

    // Add message in sending status
    setMessages((prev) => [...prev, newMsg]);

    // Update conversation last message preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessageText: text || (templateName ? `Template: ${templateName}` : 'Media'),
              lastMessageTimestamp: newMsg.timestamp,
            }
          : c
      )
    );

    // Simulate Meta API status progression: sending -> sent -> delivered -> read
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, status: 'sent' } : m))
      );
    }, 400);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, status: 'delivered' } : m))
      );
    }, 1200);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, status: 'read' } : m))
      );
    }, 2400);

    recordAuditLog('Sent WhatsApp Message', `To ${conv.contactName} (${conv.contactPhone})`);
  }, [conversations, accountId, currentUser, recordAuditLog]);

  // Simulated Inbound Webhook Generator (Customer messages the business)
  const simulateInboundMessage = useCallback(({ contactId, contactName, phone, messageText }) => {
    let targetContact = contacts.find((c) => c.id === contactId || c.mobileNumber === phone);

    // If new customer messaging for first time, create contact automatically
    if (!targetContact) {
      const formatted = formatToE164(phone || '+919899001122');
      targetContact = {
        id: `cnt_${Date.now()}`,
        accountId,
        name: contactName || 'New Inbound Lead',
        mobileNumber: formatted,
        email: '',
        company: '',
        tags: ['New Lead', 'Inbound'],
        source: 'chat',
        optInStatus: 'opted_in',
        status: 'active',
        customAttributes: {},
        lastContactedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notes: 'Initiated conversation via WhatsApp inbound message.',
      };
      setContacts((prev) => [targetContact, ...prev]);
    }

    // Find or create conversation
    let conv = conversations.find((c) => c.contactId === targetContact.id);
    let convId = conv ? conv.id : `conv_${Date.now()}`;

    if (!conv) {
      conv = {
        id: convId,
        accountId,
        contactId: targetContact.id,
        contactName: targetContact.name,
        contactPhone: targetContact.mobileNumber,
        channelId: channels[0]?.id || 'chan_01',
        assignedToUserId: currentUser?.id || 'usr_04',
        assignedToName: currentUser?.fullName || 'Ananya Sen',
        status: 'open',
        lastMessageText: messageText,
        lastMessageTimestamp: new Date().toISOString(),
        unreadCount: 1,
        tags: targetContact.tags,
      };
      setConversations((prev) => [conv, ...prev]);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastMessageText: messageText,
                lastMessageTimestamp: new Date().toISOString(),
                unreadCount: c.unreadCount + 1,
                status: 'open',
              }
            : c
        )
      );
    }

    // Add Inbound Message
    const inMsg = {
      id: `msg_in_${Date.now()}`,
      accountId,
      conversationId: convId,
      contactId: targetContact.id,
      direction: 'inbound',
      type: 'text',
      text: messageText,
      status: 'read',
      timestamp: new Date().toISOString(),
      senderName: targetContact.name,
    };

    setMessages((prev) => [...prev, inMsg]);
    setActiveConversationId(convId);
    showInfo('New Inbound WhatsApp Message', `${targetContact.name}: "${messageText.substring(0, 40)}"`);

    // Run Automation Engine for Inbound Keyword
    runAutomationTrigger('incoming_message_keyword', targetContact, messageText, convId);
  }, [contacts, conversations, accountId, channels, currentUser, showInfo]);

  // ==========================================
  // AUTOMATION ENGINE TRIGGER HANDLER
  // ==========================================
  const runAutomationTrigger = useCallback((eventType, contact, messageText = '', convId = null) => {
    const { triggeredActions, logsToCreate } = processAutomationEvent({
      eventType,
      contact,
      messageText,
      channelId: channels[0]?.id,
      automations,
      templates,
      users,
    });

    if (logsToCreate.length > 0) {
      setAutomationLogs((prev) => [...logsToCreate, ...prev]);
    }

    // Execute actions
    triggeredActions.forEach((action) => {
      if (action.type === 'SEND_TEMPLATE') {
        const tmpl = templates.find((t) => t.id === action.templateId);
        const resolvedText = tmpl?.components?.find((c) => c.type === 'BODY')?.text || 'Automated response';
        const targetConvId = convId || conversations.find((c) => c.contactId === contact.id)?.id;
        if (targetConvId) {
          setTimeout(() => {
            sendMessage({
              conversationId: targetConvId,
              text: resolvedText.replace('{{1}}', contact.name).replace('{{2}}', 'Offer').replace('{{3}}', 'AUTO'),
              templateName: tmpl?.name,
            });
          }, 800);
        }
      } else if (action.type === 'SEND_TEXT') {
        const targetConvId = convId || conversations.find((c) => c.contactId === contact.id)?.id;
        if (targetConvId) {
          setTimeout(() => {
            sendMessage({
              conversationId: targetConvId,
              text: action.text,
            });
          }, 800);
        }
      } else if (action.type === 'ADD_TAG') {
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, tags: [...new Set([...(c.tags || []), action.tag])] } : c))
        );
      } else if (action.type === 'ASSIGN_AGENT') {
        if (convId) {
          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, assignedToUserId: action.agentId, assignedToName: action.agentName } : c))
          );
        }
      }
    });
  }, [automations, templates, users, channels, conversations, sendMessage]);

  const updateConversationStatus = useCallback((id, status) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }, []);

  const assignConversationAgent = useCallback((convId, userId) => {
    const user = users.find((u) => u.id === userId);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              assignedToUserId: userId,
              assignedToName: user ? user.fullName : 'Unassigned',
            }
          : c
      )
    );
    showSuccess('Agent Assigned', `Assigned to ${user ? user.fullName : 'Agent'}`);
  }, [users, showSuccess]);

  const markConversationAsRead = useCallback((convId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  // ==========================================
  // TEMPLATES ACTIONS
  // ==========================================
  const addTemplate = useCallback((templateData) => {
    const bodyText = templateData.bodyText || templateData.body || templateData.content || (templateData.components?.find((c) => c.type === 'BODY')?.text) || '';
    const headerText = templateData.headerText || (templateData.components?.find((c) => c.type === 'HEADER')?.text) || '';
    const footerText = templateData.footerText || (templateData.components?.find((c) => c.type === 'FOOTER')?.text) || '';
    const buttons = templateData.buttons || [];

    const newTemplate = {
      id: `tmpl_${Date.now()}`,
      accountId,
      name: (templateData.name || 'template').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category: templateData.category || 'MARKETING',
      language: templateData.language || 'en_US',
      headerText,
      bodyText,
      footerText,
      buttons,
      components: [
        headerText ? { type: 'HEADER', format: 'TEXT', text: headerText } : null,
        { type: 'BODY', text: bodyText },
        footerText ? { type: 'FOOTER', text: footerText } : null,
      ].filter(Boolean),
      variables: templateData.variables || [],
      status: 'APPROVED', // instant simulated Meta approval
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    recordAuditLog('Created WhatsApp Template', newTemplate.name);
    showSuccess('Template Created', `Template "${newTemplate.name}" approved by Meta.`);
    return newTemplate;
  }, [accountId, recordAuditLog, showSuccess]);

  const updateTemplate = useCallback((id, updates) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const bodyText = updates.bodyText !== undefined ? updates.bodyText : t.bodyText;
          const headerText = updates.headerText !== undefined ? updates.headerText : t.headerText;
          const footerText = updates.footerText !== undefined ? updates.footerText : t.footerText;
          const buttons = updates.buttons !== undefined ? updates.buttons : t.buttons;
          return {
            ...t,
            ...updates,
            bodyText,
            headerText,
            footerText,
            buttons,
            components: [
              headerText ? { type: 'HEADER', format: 'TEXT', text: headerText } : null,
              { type: 'BODY', text: bodyText },
              footerText ? { type: 'FOOTER', text: footerText } : null,
            ].filter(Boolean),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    recordAuditLog('Updated WhatsApp Template', `Template ID: ${id}`);
    showSuccess('Template Saved', 'Template details updated.');
  }, [recordAuditLog, showSuccess]);

  const deleteTemplate = useCallback((id) => {
    const target = templates.find((t) => t.id === id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      recordAuditLog('Deleted WhatsApp Template', target.name);
    }
    showInfo('Template Deleted', 'Template removed.');
  }, [templates, recordAuditLog, showInfo]);

  // ==========================================
  // BROADCAST CAMPAIGN ACTIONS
  // ==========================================
  const createBroadcastCampaign = useCallback((campaignData) => {
    const template = templates.find((t) => t.id === campaignData.templateId);
    let recipientContacts = contacts;

    const audienceType = campaignData.audienceType || campaignData.targetAudienceType || 'all';
    const targetTags = campaignData.targetTags || (audienceType !== 'all' ? [audienceType] : []);

    if (audienceType !== 'all' && targetTags.length > 0) {
      recipientContacts = contacts.filter((c) =>
        c.tags?.some((tag) => targetTags.includes(tag))
      );
    }

    const newCampaign = {
      id: `cmp_${Date.now()}`,
      accountId,
      name: campaignData.name,
      templateId: campaignData.templateId,
      templateName: template ? template.name : 'Unknown Template',
      channelId: channels[0]?.id || 'chan_01',
      targetAudienceType: audienceType,
      targetTags,
      variableMappings: campaignData.variables || campaignData.variableMappings || {},
      totalRecipients: recipientContacts.length || contacts.length || 0,
      recipientCount: recipientContacts.length || contacts.length || 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      status: campaignData.scheduledAt ? 'scheduled' : 'sent',
      scheduledAt: campaignData.scheduledAt || null,
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    recordAuditLog('Created Broadcast Campaign', newCampaign.name);
    showSuccess('Campaign Created', `Broadcast "${newCampaign.name}" configured.`);
    return newCampaign;
  }, [templates, contacts, channels, accountId, recordAuditLog, showSuccess]);

  const createCampaign = useCallback((campaignData) => {
    return createBroadcastCampaign(campaignData);
  }, [createBroadcastCampaign]);

  // Launch broadcast immediately with realistic progress simulation
  const launchCampaignNow = useCallback((campaignId) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'running' } : c))
    );
    showInfo('Broadcast Launching', `Dispatching messages for "${campaign.name}"...`);

    const total = campaign.totalRecipients || 50;
    let sent = 0;
    let delivered = 0;
    let read = 0;
    let failed = Math.floor(total * 0.03); // 3% realistic failure rate

    const interval = setInterval(() => {
      sent += Math.ceil(total / 5);
      if (sent >= total) {
        sent = total;
        delivered = total - failed;
        read = Math.floor(delivered * 0.85);

        clearInterval(interval);
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  status: 'completed',
                  sentCount: sent,
                  deliveredCount: delivered,
                  readCount: read,
                  failedCount: failed,
                  completedAt: new Date().toISOString(),
                }
              : c
          )
        );
        recordAuditLog('Broadcast Completed', `${campaign.name} (${sent} sent, ${delivered} delivered)`);
        showSuccess('Broadcast Completed! 🚀', `Successfully delivered ${delivered} WhatsApp messages.`);
      } else {
        delivered = Math.floor(sent * 0.95);
        read = Math.floor(delivered * 0.7);
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  sentCount: sent,
                  deliveredCount: delivered,
                  readCount: read,
                  failedCount: Math.floor(sent * 0.03),
                }
              : c
          )
        );
      }
    }, 400);
  }, [campaigns, recordAuditLog, showInfo, showSuccess]);

  // ==========================================
  // AUTOMATIONS ACTIONS
  // ==========================================
  const addAutomationRule = useCallback((ruleData) => {
    const newRule = {
      id: `auto_${Date.now()}`,
      accountId,
      name: ruleData.name,
      description: ruleData.description || '',
      trigger: ruleData.trigger,
      conditions: ruleData.conditions || [],
      actions: ruleData.actions || [],
      status: 'active',
      executionCount: 0,
      createdAt: new Date().toISOString(),
    };

    setAutomations((prev) => [newRule, ...prev]);
    recordAuditLog('Created Automation Rule', newRule.name);
    showSuccess('Automation Activated', `Rule "${newRule.name}" is now live.`);
    return newRule;
  }, [accountId, recordAuditLog, showSuccess]);

  const updateAutomation = useCallback((id, updates) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
    recordAuditLog('Updated Automation Rule', `Rule ID: ${id}`);
    showSuccess('Automation Saved', 'Automation rule updated.');
  }, [recordAuditLog, showSuccess]);

  const toggleAutomationStatus = useCallback((id) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'active' ? 'paused' : 'active';
          showInfo('Rule Status Updated', `Automation is now ${nextStatus}.`);
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  }, [showInfo]);

  const deleteAutomationRule = useCallback((id) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    showInfo('Automation Deleted', 'Rule removed.');
  }, [showInfo]);

  // ==========================================
  // CHANNEL ACTIONS
  // ==========================================
  const createChannel = useCallback((channelData) => {
    const newChannel = {
      id: `chan_${Date.now()}`,
      accountId,
      phoneNumberId: channelData.phoneNumberId || '',
      wabaId: channelData.wabaId || '',
      businessManagerId: channelData.businessManagerId || '',
      displayName: channelData.displayName || channelData.verifiedDisplayName || 'WhatsApp Business',
      verifiedDisplayName: channelData.verifiedDisplayName || channelData.displayName || '',
      displayPhoneNumber: channelData.displayPhoneNumber || channelData.whatsappNumber || '',
      whatsappNumber: channelData.whatsappNumber || channelData.displayPhoneNumber || '',
      accessToken: channelData.accessToken || '',
      appId: channelData.appId || '',
      appSecret: channelData.appSecret || '',
      webhookVerifyToken: channelData.webhookVerifyToken || 'sheetbotics_live_token_2026',
      webhookCallbackUrl: channelData.webhookCallbackUrl || 'https://whatsapp.sheetbotics.in/webhook/whatsapp',
      tokenStatus: channelData.tokenStatus || 'ACTIVE (Valid System User Token)',
      messagingLimit: channelData.messagingLimit || 'Tier 1K (1,000 unique users/24hr)',
      messagingTier: channelData.messagingTier || channelData.messagingLimit || 'Tier 1K',
      qualityRating: channelData.qualityRating || 'GREEN (High Quality)',
      phoneVerification: channelData.phoneVerification || 'VERIFIED',
      displayNameStatus: channelData.displayNameStatus || 'APPROVED',
      numberStatus: channelData.numberStatus || 'CONNECTED',
      throughput: channelData.throughput || '80 msgs/sec (Standard Cloud API)',
      wabaReview: channelData.wabaReview || 'APPROVED',
      businessVerification: channelData.businessVerification || 'VERIFIED',
      businessManagerOwner: channelData.businessManagerOwner || 'Sheetbotics Technologies',
      wabaName: channelData.wabaName || 'WhatsApp Cloud Account',
      status: channelData.status || 'CONNECTED',
      fetchedAt: channelData.fetchedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setChannels((prev) => [newChannel, ...prev]);
    recordAuditLog('Connected WhatsApp Channel', newChannel.displayName);
    showSuccess('Channel Connected', `WhatsApp Channel "${newChannel.displayName}" is active.`);
    return newChannel;
  }, [accountId, recordAuditLog, showSuccess]);

  const updateChannel = useCallback((id, updates) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, ...updates, updatedAt: new Date().toISOString() } : ch))
    );
    recordAuditLog('Updated WhatsApp Channel', `Channel ID: ${id}`);
    showSuccess('Channel Saved', 'WhatsApp Business credentials updated.');
  }, [recordAuditLog, showSuccess]);

  const deleteChannel = useCallback((id) => {
    setChannels((prev) => prev.filter((ch) => ch.id !== id));
    recordAuditLog('Disconnected WhatsApp Channel', `Channel ID: ${id}`);
    showInfo('Channel Disconnected', 'WhatsApp channel removed.');
  }, [recordAuditLog, showInfo]);

  // ==========================================
  // IMPORT LOGS ACTIONS
  // ==========================================
  const createImportLog = useCallback((logData) => {
    const newLog = {
      id: `imp_${Date.now()}`,
      accountId,
      fileName: logData.fileName || 'contacts.csv',
      fileSize: logData.fileSize || 0,
      uploadedBy: currentUser?.fullName || 'Admin',
      uploadDate: new Date().toISOString(),
      totalRecords: logData.rowCount || logData.totalRecords || 0,
      successfulRecords: logData.successCount || logData.successfulRecords || 0,
      duplicateRecords: 0,
      invalidRecords: 0,
      failedRecords: logData.failCount || logData.failedRecords || 0,
      status: logData.status || 'completed',
      errorDetails: [],
    };
    setImportLogs((prev) => [newLog, ...prev]);
    recordAuditLog('Import Contacts File', `${newLog.fileName} logged.`);
    return newLog;
  }, [accountId, currentUser, recordAuditLog]);

  return (
    <WhatsAppDataContext.Provider
      value={{
        contacts,
        conversations,
        messages,
        templates,
        campaigns,
        automations,
        automationLogs,
        importLogs,
        channels,
        auditLogs,
        activeConversationId,
        setActiveConversationId,
        initialPlans,
        // Contacts
        createContact: addContact,
        addContact,
        updateContact,
        deleteContact,
        bulkTagContacts,
        bulkDeleteContacts,
        importContactsBatch,
        // Messages
        sendMessage,
        simulateInboundMessage,
        updateConversationStatus,
        assignConversation: assignConversationAgent,
        assignConversationAgent,
        markAsRead: markConversationAsRead,
        markConversationAsRead,
        // Templates
        createTemplate: addTemplate,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        // Campaigns
        createCampaign,
        createBroadcastCampaign,
        launchCampaignNow,
        // Automations
        createAutomation: addAutomationRule,
        addAutomationRule,
        updateAutomation,
        deleteAutomation: deleteAutomationRule,
        deleteAutomationRule,
        toggleAutomation: toggleAutomationStatus,
        toggleAutomationStatus,
        // Channel
        createChannel,
        updateChannel,
        deleteChannel,
        // Import
        createImportLog,
      }}
    >
      {children}
    </WhatsAppDataContext.Provider>
  );
}

export function useWhatsAppData() {
  const context = useContext(WhatsAppDataContext);
  if (!context) {
    throw new Error('useWhatsAppData must be used within a WhatsAppDataProvider');
  }
  return context;
}
