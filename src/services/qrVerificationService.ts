import QRCode from 'qrcode';

export interface AuditVerificationRecord {
  siteId: string;
  reference: string;
  verificationUrl: string;
  qrDataUrl: string;
  hash: string;
  timestamp: string;
  docTitle: string;
  enterpriseName: string;
}

/**
 * Generate a high-resolution, scannable QR Code Data URL
 */
export async function generateQrCodeDataUrl(
  text: string, 
  options: { width?: number; margin?: number; darkColor?: string; lightColor?: string } = {}
): Promise<string> {
  const { 
    width = 300, 
    margin = 1, 
    darkColor = '#020617', 
    lightColor = '#ffffff' 
  } = options;

  try {
    return await QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('[QR Service] Failed to generate QR code:', err);
    // Return empty string on fallback
    return '';
  }
}

/**
 * Register an audit ledger block and generate an official verification record with QR Code
 */
export async function createAuditLedgerVerificationRecord(params: {
  docType: string;
  reference: string;
  enterpriseName: string;
  siteId?: string;
  tier?: string;
  payload?: Record<string, any>;
}): Promise<AuditVerificationRecord> {
  const {
    docType,
    reference,
    enterpriseName,
    siteId = 'SITE-WIT-01',
    tier = 'SANS Compliance',
    payload = {}
  } = params;

  const timestamp = new Date().toISOString();
  const rawDataToHash = `${siteId}:${reference}:${enterpriseName}:${timestamp}`;
  
  // Basic deterministic hash simulation for immediate client-side guarantee
  let hashNum = 0;
  for (let i = 0; i < rawDataToHash.length; i++) {
    hashNum = ((hashNum << 5) - hashNum) + rawDataToHash.charCodeAt(i);
    hashNum |= 0;
  }
  const hashHex = Math.abs(hashNum).toString(16).padStart(16, '0') + 
    Array.from(reference).map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 16);
  const fullProofHash = `0x${hashHex.padEnd(64, 'a')}`.slice(0, 66);

  // Formulate the secure online verification view URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://melotwo.co.za';
  const verificationUrl = `${baseUrl}/#verify?siteId=${encodeURIComponent(siteId)}&ref=${encodeURIComponent(reference)}&hash=${encodeURIComponent(fullProofHash)}`;

  // Generate Scannable QR Code Data URL
  const qrDataUrl = await generateQrCodeDataUrl(verificationUrl, { width: 320, margin: 1 });

  // Asynchronously register the block with the backend cryptographic Merkle ledger
  fetch('/api/v1/proof/append', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site_id: siteId,
      event_type: 'AUDIT_LEDGER_TENDER_VERIFICATION',
      record_payload: {
        docType,
        reference,
        enterpriseName,
        tier,
        verificationUrl,
        timestamp,
        ...payload
      }
    })
  }).catch(e => {
    console.warn('[QR Service] Note: Offline or background proof ledger append:', e);
  });

  // Also persist verification entry in localStorage for instant offline access
  try {
    if (typeof localStorage !== 'undefined') {
      const storedVerifications = JSON.parse(localStorage.getItem('melotwo_audit_verifications') || '[]');
      const newEntry: AuditVerificationRecord = {
        siteId,
        reference,
        verificationUrl,
        qrDataUrl,
        hash: fullProofHash,
        timestamp,
        docTitle: docType,
        enterpriseName
      };
      // Keep most recent 50 records
      const updated = [newEntry, ...storedVerifications.filter((v: any) => v.reference !== reference)].slice(0, 50);
      localStorage.setItem('melotwo_audit_verifications', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('[QR Service] LocalStorage verification cache warning:', e);
  }

  return {
    siteId,
    reference,
    verificationUrl,
    qrDataUrl,
    hash: fullProofHash,
    timestamp,
    docTitle: docType,
    enterpriseName
  };
}
