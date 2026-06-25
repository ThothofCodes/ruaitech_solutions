// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const axios = require('axios');

// ── FIX (Continuity Audit, Part Four — critical) ───────────────────────────
// Every Daraja call used to be hardcoded to sandbox.safaricom.co.ke, with no
// way to ever reach the production host regardless of which credentials were
// placed in .env. That meant real M-Pesa payments could never actually be
// collected. MPESA_ENV now controls which host is used, and it defaults to
// 'sandbox' — the safe default — so nothing changes for existing setups
// unless production is explicitly opted into.
const MPESA_ENV = (process.env.MPESA_ENV || 'sandbox').toLowerCase();
const MPESA_BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

if (MPESA_ENV !== 'production' && MPESA_ENV !== 'sandbox') {
  console.warn(`[MPESA] Unrecognized MPESA_ENV="${process.env.MPESA_ENV}" — falling back to sandbox host for safety.`);
}
console.log(`[MPESA] Daraja host: ${MPESA_BASE_URL} (MPESA_ENV=${MPESA_ENV})`);

// Safaricom IP ranges for callback verification (these would need to be updated regularly)
// These are the known IP ranges that Safaricom uses for sending callbacks
const SAFARICOM_IP_RANGES = [
  // Safaricom Sandbox IPs
  '159.89.224.21', // Known sandbox callback IP
  '41.217.248.', // Safaricom IP range
  '105.29.', // Safaricom IP range
  // Production IPs (these are examples, actual ranges should be verified with Safaricom)
  '41.217.', // Safaricom production IP range
  '197.232.', // Safaricom production IP range
];

const formatPhone = (phone) => {
  const cleaned = String(phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.length === 9) return `254${cleaned}`;
  return cleaned;
};

const validatePhone = (phone) => {
  const formatted = formatPhone(phone);
  return /^254[17]\d{8}$/.test(formatted) ? formatted : null;
};

const generateToken = async () => {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error('M-Pesa credentials not configured');
  }
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` }, timeout: 10000 },
  );
  if (!data.access_token) throw new Error('Failed to obtain M-Pesa access token');
  return data.access_token;
};

const stkPush = async (phone, amount, accountRef, description) => {
  const { MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;
  if (!MPESA_SHORTCODE || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
    throw new Error('M-Pesa configuration incomplete');
  }

  const validPhone = validatePhone(phone);
  if (!validPhone) throw new Error(`Invalid phone number: ${phone}`);

  const parsedAmount = Math.ceil(Number(amount));
  if (!parsedAmount || parsedAmount < 1 || parsedAmount > 150000) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  // Sanitize accountRef and description — alphanumeric + spaces only
  const safeRef = String(accountRef || 'RuaiTech').replace(/[^A-Z0-9 ]/gi, '').slice(0, 12);
  const safeDesc = String(description || 'Payment').replace(/[^A-Z0-9 ]/gi, '').slice(0, 13);

  const token = await generateToken();
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

  const { data } = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: parsedAmount,
      PartyA: validPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: validPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: safeRef,
      TransactionDesc: safeDesc,
    },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 },
  );
  return data;
};

const verifyMpesaSource = (req, res, next) => {
  try {
    // Get the client IP address (considering proxies)
    const clientIP = req.headers['x-forwarded-for']
                     || req.headers['x-real-ip']
                     || req.connection.remoteAddress
                     || req.socket.remoteAddress
                     || (req.connection.socket ? req.connection.socket.remoteAddress : null)
                     || '127.0.0.1';

    // Clean IP address (remove ::ffff: prefix if present)
    const cleanIP = clientIP.replace(/^::ffff:/, '');

    // Check if IP matches Safaricom ranges
    const isFromSafaricom = SAFARICOM_IP_RANGES.some((range) => cleanIP.startsWith(range)
      || cleanIP === range);

    if (process.env.NODE_ENV === 'production') {
      if (!isFromSafaricom) {
        console.warn(`M-Pesa callback from non-Safaricom IP: ${cleanIP}`);
        // In production, you might want to reject non-Safaricom IPs
        // For now, we'll just log it and continue for flexibility
      }
    }

    // Add IP information to request for logging/debugging
    req.mpesaSourceInfo = { clientIP: cleanIP, isFromSafaricom };

    next();
  } catch (error) {
    console.error('Error verifying M-Pesa source:', error.message);
    // Don't block the request if verification fails, just continue
    next();
  }
};

const validateCallback = (body) => {
  // Basic structure validation
  const result = body?.Body?.stkCallback;
  if (!result) throw new Error('Invalid callback body structure');

  // Extract essential fields
  const {
    ResultCode,
    CheckoutRequestID,
    CallbackMetadata,
    MerchantRequestID,
  } = result;

  // Validate required fields exist
  if (!CheckoutRequestID) throw new Error('Missing CheckoutRequestID in callback');
  if (!MerchantRequestID) throw new Error('Missing MerchantRequestID in callback');
  if (typeof ResultCode === 'undefined') throw new Error('Missing ResultCode in callback');

  // Initialize metadata object
  const meta = {};

  // Process callback metadata if successful
  if (ResultCode === 0 && CallbackMetadata) {
    if (!Array.isArray(CallbackMetadata.Item)) {
      throw new Error('Invalid CallbackMetadata structure');
    }

    // Process each metadata item safely
    CallbackMetadata.Item.forEach((item) => {
      if (item && typeof item === 'object' && item.Name && item.Value !== undefined) {
        meta[item.Name] = item.Value;
      }
    });
  }

  // Validate the required payment details if transaction was successful
  if (ResultCode === 0) {
    // Verify required payment details are present
    if (!meta.MpesaReceiptNumber) throw new Error('Missing MpesaReceiptNumber in callback');
    if (!meta.TransactionDate) throw new Error('Missing TransactionDate in callback');
    if (!meta.PhoneNumber) throw new Error('Missing PhoneNumber in callback');

    // Validate amount if present
    if (meta.Amount) {
      const amount = Number(meta.Amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount in callback');
      }
    }
  }

  const success = ResultCode === 0;
  const amount = Number(meta.Amount || 0);
  const mpesaRef = String(meta.MpesaReceiptNumber || '');
  const phone = String(meta.PhoneNumber || '');

  return {
    success,
    resultCode: ResultCode,
    checkoutRequestId: CheckoutRequestID,
    merchantRequestId: MerchantRequestID,
    amount,
    mpesaRef,
    phone,
    meta,
  };
};

module.exports = {
  stkPush,
  validateCallback,
  formatPhone,
  verifyMpesaSource,
};
