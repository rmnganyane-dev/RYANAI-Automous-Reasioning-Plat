// twilioClient.js

// Best practice: Load credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACa08a4ef5834427df16cc78be96079d59';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN';

const getAuthHeader = () => {
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  return `Basic ${credentials}`;
};

/**
 * Send a Twilio WhatsApp message using a Content Template SID
 */
async function sendWhatsAppMessage({ to, from, contentSid }) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: `whatsapp:${from}`,
    ContentSid: contentSid
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Twilio WhatsApp Error (${data.status}): ${data.message}`);
  }
  return data;
}

/**
 * Initiate an outbound voice call with a TwiML URL
 */
async function makeVoiceCall({ to, from, twimlUrl }) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  
  const body = new URLSearchParams({
    To: to,
    From: from,
    Url: twimlUrl
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Twilio Voice Error (${data.status}): ${data.message}`);
  }
  return data;
}

// Example Execution
(async () => {
  try {
    console.log('🚀 Sending WhatsApp notification...');
    const messageResponse = await sendWhatsAppMessage({
      to: '+27718095084',
      from: '+17372508034',
      contentSid: 'HXac51c61af94371da7904a767b414c2fc'
    });
    console.log(`✅ WhatsApp Queued! SID: ${messageResponse.sid}`);

    console.log('📞 Initiating automated voice call...');
    const callResponse = await makeVoiceCall({
      to: '+27718095084',
      from: '+17372508034',
      twimlUrl: 'https://webhooks.twilio.com/v1/Voice/Template/voice_auto_response'
    });
    console.log(`✅ Call Queued! SID: ${callResponse.sid}`);

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
})();
