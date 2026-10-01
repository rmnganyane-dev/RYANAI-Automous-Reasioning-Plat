import { Analytics } from '@segment/analytics-node';

(async () => {
  const userId = 'user_897123'; // Target user in your system

  try {
    // Send WhatsApp & Log to Segment
    const msg = await sendWhatsAppAndTrack({
      userId,
      to: '+27718095084',
      from: '+17372508034',
      contentSid: 'HXac51c61af94371da7904a767b414c2fc'
    });
    console.log(`WhatsApp Sent & Tracked: ${msg.sid}`);

    // Trigger Call & Log to Segment
    const call = await makeVoiceCallAndTrack({
      userId,
      to: '+27718095084',
      from: '+17372508034',
      twimlUrl: 'https://webhooks.twilio.com/v1/Voice/Template/voice_auto_response'
    });
    console.log(`Call Initiated & Tracked: ${call.sid}`);

    // Flush Segment buffer before process exits (crucial in CLI / Serverless)
    await analytics.closeAndFlush();

  } catch (err) {
    console.error('Execution Error:', err.message);
  }
})();

// 1. Initialize Clients
const segmentWriteKey = process.env.SEGMENT_WRITE_KEY || 'YOUR_SEGMENT_WRITE_KEY';
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACa08a4ef5834427df16cc78be96079d59';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';

const analytics = new Analytics({ writeKey: segmentWriteKey });

const getAuthHeader = () => {
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  return `Basic ${credentials}`;
};

/**
 * Send a WhatsApp Message and track the event in Segment
 */
export async function sendWhatsAppAndTrack({ userId, to, from, contentSid }) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: `whatsapp:${from}`,
    ContentSid: contentSid
  });

  // 1. Dispatch Twilio Request
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
    // Optionally track failure in Segment
    analytics.track({
      userId,
      event: 'WhatsApp Message Failed',
      properties: {
        to,
        from,
        contentSid,
        errorCode: data.code,
        errorMessage: data.message
      }
    });
    throw new Error(`Twilio Error (${data.status}): ${data.message}`);
  }

  // 2. Track Successful Dispatch in Segment
  analytics.track({
    userId,
    event: 'WhatsApp Message Sent',
    properties: {
      messageSid: data.sid,
      to,
      from,
      contentSid,
      channel: 'whatsapp',
      status: data.status
    }
  });

  return data;
}

/**
 * Initiate a Voice Call and track the event in Segment
 */
export async function makeVoiceCallAndTrack({ userId, to, from, twimlUrl }) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  
  const body = new URLSearchParams({
    To: to,
    From: from,
    Url: twimlUrl
  });

  // 1. Dispatch Twilio Request
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
    analytics.track({
      userId,
      event: 'Voice Call Failed',
      properties: {
        to,
        from,
        twimlUrl,
        errorCode: data.code,
        errorMessage: data.message
      }
    });
    throw new Error(`Twilio Error (${data.status}): ${data.message}`);
  }

  // 2. Track Call Initiation in Segment
  analytics.track({
    userId,
    event: 'Voice Call Initiated',
    properties: {
      callSid: data.sid,
      to,
      from,
      twimlUrl,
      channel: 'voice',
      status: data.status
    }
  });

  return data;
}
