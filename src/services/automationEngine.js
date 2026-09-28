// Sheetbotics Automation Execution Engine

/**
 * Evaluates triggers and conditions against current system events
 * and executes configured actions (send templates, tag contacts, assign agents).
 */
export function processAutomationEvent({
  eventType, // 'incoming_message_keyword' | 'new_contact' | 'tag_added' | 'contact_updated'
  contact,
  messageText = '',
  channelId = '',
  automations = [],
  templates = [],
  users = [],
}) {
  const triggeredActions = [];
  const logsToCreate = [];

  for (const rule of automations) {
    if (rule.status !== 'active') continue;

    let triggerMatched = false;

    if (rule.trigger.type === 'incoming_message_keyword' && eventType === 'incoming_message_keyword') {
      const pattern = rule.trigger.keywordPattern || '';
      const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
      if (regex.test(messageText)) {
        triggerMatched = true;
      }
    } else if (rule.trigger.type === eventType) {
      triggerMatched = true;
    }

    if (!triggerMatched) continue;

    // Evaluate Conditions
    let conditionsMet = true;
    if (rule.conditions && rule.conditions.length > 0) {
      for (const cond of rule.conditions) {
        const contactVal = contact ? contact[cond.field] : undefined;
        if (cond.operator === 'equals' && contactVal !== cond.value) {
          conditionsMet = false;
          break;
        }
        if (cond.operator === 'contains') {
          if (Array.isArray(contactVal)) {
            if (!contactVal.includes(cond.value)) {
              conditionsMet = false;
              break;
            }
          } else if (typeof contactVal === 'string') {
            if (!contactVal.toLowerCase().includes(cond.value.toLowerCase())) {
              conditionsMet = false;
              break;
            }
          }
        }
      }
    }

    if (!conditionsMet) continue;

    // Execute configured actions
    const executedActionSummaries = [];
    for (const action of rule.actions) {
      if (action.type === 'send_template') {
        const template = templates.find((t) => t.id === action.templateId);
        triggeredActions.push({
          type: 'SEND_TEMPLATE',
          ruleId: rule.id,
          templateId: action.templateId,
          templateName: template ? template.name : 'Unknown Template',
          contactId: contact ? contact.id : null,
        });
        executedActionSummaries.push(`Sent template "${template ? template.name : action.templateId}"`);
      } else if (action.type === 'add_tag') {
        triggeredActions.push({
          type: 'ADD_TAG',
          ruleId: rule.id,
          tag: action.tag,
          contactId: contact ? contact.id : null,
        });
        executedActionSummaries.push(`Added tag "${action.tag}"`);
      } else if (action.type === 'remove_tag') {
        triggeredActions.push({
          type: 'REMOVE_TAG',
          ruleId: rule.id,
          tag: action.tag,
          contactId: contact ? contact.id : null,
        });
        executedActionSummaries.push(`Removed tag "${action.tag}"`);
      } else if (action.type === 'assign_agent') {
        const agent = users.find((u) => u.id === action.agentId);
        triggeredActions.push({
          type: 'ASSIGN_AGENT',
          ruleId: rule.id,
          agentId: action.agentId,
          agentName: agent ? agent.fullName : 'Agent',
          contactId: contact ? contact.id : null,
        });
        executedActionSummaries.push(`Assigned agent "${agent ? agent.fullName : action.agentId}"`);
      } else if (action.type === 'send_quick_text') {
        triggeredActions.push({
          type: 'SEND_TEXT',
          ruleId: rule.id,
          text: action.messageText,
          contactId: contact ? contact.id : null,
        });
        executedActionSummaries.push(`Sent quick response`);
      }
    }

    logsToCreate.push({
      id: `alog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      contactId: contact ? contact.id : 'anonymous',
      contactName: contact ? contact.name : 'WhatsApp User',
      triggerEvent: eventType === 'incoming_message_keyword' ? `Keyword Match: "${messageText.substring(0, 30)}..."` : `Event: ${eventType}`,
      status: 'success',
      details: executedActionSummaries.join(', ') || 'Executed actions successfully',
      executedAt: new Date().toISOString(),
    });
  }

  return { triggeredActions, logsToCreate };
}
