// Meta WhatsApp Cloud API v20.0 Service & Integration Engine

/**
 * Format phone number into standard E.164 format (+[country_code][number])
 */
export function formatToE164(phone, defaultCountryCode = '91') {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = `+${defaultCountryCode}${cleaned}`;
    } else if (cleaned.length > 10) {
      cleaned = `+${cleaned}`;
    }
  }
  return cleaned;
}

/**
 * Validates whether a phone number meets WhatsApp E.164 requirements
 */
export function validateWhatsAppPhone(phone) {
  const formatted = formatToE164(phone);
  // Must start with + and have between 10 and 15 digits
  const regex = /^\+[1-9]\d{9,14}$/;
  return regex.test(formatted);
}

/**
 * Resolves template placeholders {{1}}, {{2}}, {{n}} using provided parameters
 */
export function resolveTemplateVariables(templateText, variableMap = {}, contact = {}) {
  if (!templateText) return '';
  let result = templateText;

  // Support numeric indices {{1}}, {{2}} as well as named fields
  Object.keys(variableMap).forEach((key) => {
    const val = variableMap[key];
    let resolvedValue = val;
    if (val === 'name' && contact?.name) resolvedValue = contact.name;
    if (val === 'company' && contact?.company) resolvedValue = contact.company;
    if (val === 'phone' && contact?.mobileNumber) resolvedValue = contact.mobileNumber;
    
    // Replace both {{key}} and {{1}} style
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, resolvedValue || '');
  });

  return result;
}

/**
 * Build official Meta Graph API v20.0 Outbound Template Message Payload
 */
export function buildMetaTemplatePayload({
  recipientPhone,
  templateName,
  languageCode = 'en_US',
  bodyParameters = []
}) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatToE164(recipientPhone),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: 'body',
          parameters: bodyParameters.map((param) => ({
            type: 'text',
            text: String(param)
          }))
        }
      ]
    }
  };
}

/**
 * Test real Meta Cloud API connection if user provides real credentials
 */
export async function testMetaConnection({ phoneNumberId, accessToken }) {
  if (!phoneNumberId || !accessToken) {
    return {
      success: false,
      message: 'Phone Number ID and Access Token are required for live Meta API test.'
    };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      return {
        success: true,
        data,
        message: `Successfully connected to Meta WABA: ${data.display_phone_number || data.verified_name || 'Verified'}`
      };
    } else {
      return {
        success: false,
        error: data.error,
        message: data.error?.message || 'Failed to authenticate with Meta Graph API'
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
      message: 'Network error connecting to Meta Graph API. Please verify token & internet connection.'
    };
  }
}
