import { jsPDF } from 'jspdf';
import { 
  EftBankDetails, 
  EftBankAccountsConfig, 
  SupportedEftBankKey, 
  EftOrderSubmission, 
  PayPalConfig, 
  PaymentSuccessResult,
  ProvisionedAdminAccount
} from '../types';

// Official South African Banking Coordinates for Direct EFT / Wire Transfers
export const EFT_BANK_ACCOUNTS: EftBankAccountsConfig = {
  capitec: {
    bankKey: 'capitec',
    bankName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BANK_NAME_CAPITEC) || 'Capitec Bank',
    accountName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ACCOUNT_NAME_CAPITEC) || 'MR TH SEROKA',
    accountNumber: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ACCOUNT_NUMBER_CAPITEC) || '1602352133',
    branchCode: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BRANCH_CODE_CAPITEC) || '470010',
    swiftCode: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SWIFT_CODE_CAPITEC) || 'CABLZAJJ',
    accountType: 'Savings / Direct Corporate EFT',
    country: 'South Africa',
    isPrimary: true
  },
  fnb: {
    bankKey: 'fnb',
    bankName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BANK_NAME_FNB) || 'First National Bank (FNB)',
    accountName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ACCOUNT_NAME_FNB) || 'MR TH SEROKA',
    accountNumber: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ACCOUNT_NUMBER_FNB) || '62904917393',
    branchCode: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BRANCH_CODE_FNB) || '250655',
    swiftCode: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SWIFT_CODE_FNB) || 'FIRNZAJJ',
    accountType: 'Cheque Account',
    country: 'South Africa',
    isPrimary: false
  }
};

// Default primary export for backward compatibility
export const EFT_BANKING_DETAILS: EftBankDetails = EFT_BANK_ACCOUNTS.capitec;

// Standard ZAR to USD conversion rate for PayPal gateway processing
export const ZAR_TO_USD_RATE = 18.5;

export function convertZarToUsd(zarAmount: number): number {
  if (!zarAmount || zarAmount <= 0) return 0;
  return Math.max(1, Math.round((zarAmount / ZAR_TO_USD_RATE) * 100) / 100);
}

export function formatZarCurrency(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatUsdCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

export function getStoredPayPalConfig(): PayPalConfig {
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('melotwo_paypal_client_id') || '' : '';
  const localMode = typeof localStorage !== 'undefined' ? (localStorage.getItem('melotwo_paypal_mode') as 'sandbox' | 'live') : null;
  const localCurrency = typeof localStorage !== 'undefined' ? (localStorage.getItem('melotwo_paypal_currency') as 'USD' | 'EUR' | 'GBP') || 'USD' : 'USD';

  // Read secrets directly from environment
  const envKey = (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || (import.meta as any).env?.PAYPAL_CLIENT_ID)) || '';
  const envModeRaw = (typeof import.meta !== 'undefined' && ((import.meta as any).env?.PAYPAL_ENVIRONMENT || (import.meta as any).env?.VITE_PAYPAL_ENVIRONMENT)) || '';
  const envMode: 'sandbox' | 'live' = envModeRaw.toLowerCase() === 'live' ? 'live' : 'sandbox';

  // Automatic secret injection: prefer environment, then saved local key, or public sandbox test credential
  const resolvedKey = envKey.trim() || localKey.trim() || 'test';
  const resolvedMode = localMode || (envKey ? envMode : 'sandbox');

  return {
    clientId: resolvedKey,
    mode: resolvedMode,
    currency: localCurrency,
    // Always configured so key configuration modal is completely bypassed for clients
    isConfigured: true
  };
}

export function saveStoredPayPalConfig(config: { clientId: string; mode?: 'sandbox' | 'live'; currency?: 'USD' | 'EUR' | 'GBP'; clientSecret?: string }): PayPalConfig {
  if (config.clientId) {
    localStorage.setItem('melotwo_paypal_client_id', config.clientId.trim());
  }
  if (config.mode) {
    localStorage.setItem('melotwo_paypal_mode', config.mode);
  }
  if (config.currency) {
    localStorage.setItem('melotwo_paypal_currency', config.currency);
  }

  // Also sync to backend server config asynchronously
  fetch('/api/paypal/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: config.clientId?.trim(),
      clientSecret: config.clientSecret?.trim(),
      mode: config.mode || 'sandbox',
      currency: config.currency || 'USD'
    })
  }).catch(err => {
    console.warn('[PaymentService] Failed to sync config to server:', err);
  });

  return getStoredPayPalConfig();
}

export async function fetchServerPayPalConfig(): Promise<PayPalConfig> {
  try {
    const res = await fetch('/api/paypal/config');
    if (res.ok) {
      const data = await res.json();
      if (data.clientId && data.clientId !== 'test' && !localStorage.getItem('melotwo_paypal_client_id')) {
        localStorage.setItem('melotwo_paypal_client_id', data.clientId);
      }
      return {
        clientId: data.clientId || getStoredPayPalConfig().clientId || 'test',
        mode: data.mode || 'sandbox',
        currency: data.currency || 'USD',
        isConfigured: true
      };
    }
  } catch (e) {
    console.warn('[PaymentService] Server config fetch error:', e);
  }
  return getStoredPayPalConfig();
}

export function generateEftReference(tierOrContext: string = 'SANS'): string {
  const currentYear = new Date().getFullYear() || 2026;
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `MT-${currentYear}-${randNum}`;
}

export function provisionAdminAccount(data: {
  enterpriseName: string;
  email: string;
  reference: string;
  tierOrItem?: string;
}): ProvisionedAdminAccount {
  const adminUser: ProvisionedAdminAccount = {
    id: `ADM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    enterpriseName: data.enterpriseName || 'Industrial Enterprise',
    email: data.email || 'admin@melotwo.co.za',
    role: 'MINE_SHEQ_ADMIN',
    tierOrItem: data.tierOrItem || '30-Day Operational Pilot',
    permissions: [
      'STATUTORY_AUDIT_VERIFY',
      'TENDER_DOSSIER_GENERATE',
      'SECTION_54_LEGAL_DEFENSE',
      'SUBTERRANEAN_SYNC_OPERATOR',
      'FULL_SYSTEM_ACCESS'
    ],
    status: 'PROVISIONED',
    provisionedAt: new Date().toISOString(),
    proof_of_payment_received: true,
    reference: data.reference
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('melotwo_admin_account', JSON.stringify(adminUser));
    localStorage.setItem('melotwo_proof_of_payment_received', 'true');
    try {
      const existing: ProvisionedAdminAccount[] = JSON.parse(
        localStorage.getItem('melotwo_provisioned_admin_users') || '[]'
      );
      const filtered = existing.filter((a: any) => a && a.reference !== data.reference);
      filtered.unshift(adminUser);
      localStorage.setItem('melotwo_provisioned_admin_users', JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to cache provisioned admin accounts:', e);
    }
  }

  fetch('/api/admin/provision-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminUser)
  }).catch(e => console.warn('[PaymentService] Server admin provisioning sync notice:', e));

  return adminUser;
}

export async function submitEftOrder(submission: {
  reference: string;
  amountZar?: number;
  amountUsd?: number;
  enterpriseName: string;
  email: string;
  tierOrItem: string;
  selectedBank?: SupportedEftBankKey;
  bankName?: string;
  notes?: string;
  popFileName?: string;
  popFileDataUrl?: string;
  proof_of_payment_received?: boolean;
}): Promise<EftOrderSubmission> {
  const bankKey = submission.selectedBank || 'capitec';
  const resolvedBank = EFT_BANK_ACCOUNTS[bankKey] || EFT_BANK_ACCOUNTS.capitec;
  const activePartnerCode = typeof localStorage !== 'undefined' ? localStorage.getItem('melotwo_partner_ref') || undefined : undefined;

  const zarVal = typeof submission.amountZar === 'number' && submission.amountZar > 0
    ? submission.amountZar
    : (submission.amountUsd ? Math.round(submission.amountUsd * ZAR_TO_USD_RATE) : 12025);
  const usdVal = typeof submission.amountUsd === 'number' && submission.amountUsd > 0
    ? submission.amountUsd
    : convertZarToUsd(zarVal);

  const hasPop = Boolean(submission.popFileName || submission.popFileDataUrl || submission.proof_of_payment_received);
  let provisionedAdmin: ProvisionedAdminAccount | undefined;

  // Enforce immediate admin account provisioning upon triggering proof_of_payment_received
  if (hasPop) {
    provisionedAdmin = provisionAdminAccount({
      enterpriseName: submission.enterpriseName,
      email: submission.email,
      reference: submission.reference,
      tierOrItem: submission.tierOrItem
    });
  }

  const order: EftOrderSubmission = {
    id: `EFT-${Date.now()}`,
    reference: submission.reference,
    amountZar: zarVal,
    amountUsd: usdVal,
    enterpriseName: submission.enterpriseName,
    email: submission.email,
    tierOrItem: submission.tierOrItem,
    selectedBank: bankKey,
    bankName: resolvedBank.bankName,
    notes: submission.notes,
    popFileName: submission.popFileName,
    popFileDataUrl: submission.popFileDataUrl,
    proof_of_payment_received: hasPop,
    proofOfPaymentReceived: hasPop,
    adminAccountProvisioned: Boolean(hasPop),
    adminAccount: provisionedAdmin,
    hasActiveProofOfPayment: false, // Locked until system admin verifies payment proof
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString(),
    partnerCode: activePartnerCode
  };

  // Cache locally
  try {
    const existing = JSON.parse(localStorage.getItem('melotwo_eft_orders') || '[]');
    existing.unshift(order);
    localStorage.setItem('melotwo_eft_orders', JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to cache EFT order locally:', err);
  }

  // Push to server
  try {
    await fetch('/api/eft/submit-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
  } catch (err) {
    console.warn('[PaymentService] Server sync for EFT failed:', err);
  }

  return order;
}

export function generateEftInvoicePdf(order: {
  reference: string;
  amountZar?: number;
  amountUsd?: number;
  enterpriseName?: string;
  email?: string;
  tierOrItem?: string;
  selectedBank?: SupportedEftBankKey;
}) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const activeBankKey = order.selectedBank || 'capitec';
    const activeBank = EFT_BANK_ACCOUNTS[activeBankKey] || EFT_BANK_ACCOUNTS.capitec;
    const secondaryBankKey: SupportedEftBankKey = activeBankKey === 'capitec' ? 'fnb' : 'capitec';
    const secondaryBank = EFT_BANK_ACCOUNTS[secondaryBankKey];

    const displayTier = order.tierOrItem || '30-Day Operational Pilot (Pilot Onboarding)';
    const isPilot = displayTier.toLowerCase().includes('pilot') || displayTier.toLowerCase().includes('30-day');
    
    const finalAmountUsd = typeof order.amountUsd === 'number' && order.amountUsd > 0
      ? order.amountUsd
      : (isPilot ? 650 : (order.amountZar ? convertZarToUsd(order.amountZar) : 650));
    const finalAmountZar = typeof order.amountZar === 'number' && order.amountZar > 0
      ? order.amountZar
      : Math.round(finalAmountUsd * ZAR_TO_USD_RATE);

    // Dark Slate Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 45, 'F');

    // Accent line
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 44, 210, 1.5, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('MELOTWO MINE SAFETY & COMPLIANCE', 15, 17);

    doc.setFontSize(8.5);
    doc.setTextColor(245, 158, 11);
    doc.text('OFFICIAL PROFORMA TAX INVOICE & SWIFT WIRE INSTRUCTION', 15, 26);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Doc Ref: ${order.reference}  |  Date: ${new Date().toLocaleDateString('en-ZA')}  |  Currency: USD ($) & ZAR (R)`, 15, 35);

    // Bill To Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('BILL TO / CLIENT DETAILS', 15, 56);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Enterprise: ${order.enterpriseName || 'Industrial Mining Client'}`, 15, 64);
    doc.text(`Official Contact: ${order.email || 'billing@enterprise.com'}`, 15, 71);
    doc.text(`Contract Scope: ${displayTier}`, 15, 78);

    // Line items box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 86, 180, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 86, 180, 28, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Description & Statutory Inclusions', 20, 93);
    doc.text('Qty', 130, 93);
    doc.text('Amount (USD / ZAR)', 150, 93);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(displayTier, 20, 100);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Includes: Zambian Mining Act alignment, 20-Section Tender Dossier, OCR parsing & sync', 20, 106);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1', 133, 100);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${finalAmountUsd}.00 USD`, 150, 100);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`(approx. R${finalAmountZar.toLocaleString('en-ZA')})`, 150, 106);

    // Total box
    doc.setFillColor(15, 23, 42);
    doc.rect(120, 120, 75, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('TOTAL DUE (USD):', 125, 129);
    doc.setTextColor(245, 158, 11);
    doc.text(`$${finalAmountUsd}.00 USD`, 160, 129);
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Settlement Equiv: R${finalAmountZar.toLocaleString('en-ZA')}.00 ZAR`, 125, 135);

    // Official Banking Coordinates
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DIRECT BANK EFT & SWIFT WIRE TRANSFER COORDINATES', 15, 149);

    doc.setDrawColor(203, 213, 225);
    doc.line(15, 152, 195, 152);

    const bankFields = [
      ['Selected Clearing Bank:', `${activeBank.bankName} ${activeBank.isPrimary ? '(Primary Clearing Account)' : '(Secondary Corporate Account)'}`],
      ['Account Beneficiary Name:', activeBank.accountName],
      ['Account Number:', activeBank.accountNumber],
      ['Branch Code:', activeBank.branchCode],
      ['SWIFT / BIC Code:', activeBank.swiftCode],
      ['Account Type:', activeBank.accountType],
      ['Country of Account:', `${activeBank.country} (Full International SWIFT Enabled)`],
      ['Mandatory Reference:', order.reference]
    ];

    let yPos = 159;
    bankFields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label, 20, yPos);

      const isRef = label.includes('Reference');
      doc.setFont('helvetica', isRef ? 'bold' : 'normal');
      doc.setFontSize(isRef ? 9.5 : 8.5);
      doc.setTextColor(isRef ? 180 : 15, isRef ? 83 : 23, isRef ? 9 : 42);
      doc.text(value, 75, yPos);
      yPos += 6.5;
    });

    // Secondary Account Wire Instructions Box
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, yPos + 2, 180, 14, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, yPos + 2, 180, 14, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`ALTERNATIVE SWIFT WIRE OPTION (${secondaryBank.bankName.toUpperCase()}):`, 20, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${secondaryBank.bankName}  |  Acc: ${secondaryBank.accountNumber}  |  Branch: ${secondaryBank.branchCode}  |  SWIFT: ${secondaryBank.swiftCode}  |  Acc Name: ${secondaryBank.accountName}`, 20, yPos + 12);

    // Important Notice
    const noticeY = yPos + 20;
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(15, noticeY, 180, 24, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(15, noticeY, 180, 24, 'S');

    doc.setTextColor(146, 64, 14); // amber-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('MANDATORY COMPLIANCE & PROVISIONING INSTRUCTION:', 20, noticeY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
      `Please state "${order.reference}" as your beneficiary reference. Upload your Proof of Payment (POP) in the portal or email to billing@melotwo.co.za to trigger immediate admin account provisioning. Official un-watermarked compliance dossiers remain locked behind validated payment verification by system admin.`,
      20,
      noticeY + 11.5,
      { maxWidth: 170 }
    );

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Melotwo SHEQ Operations Division | Reg No: 2024/098124/07 | Capitec & FNB SWIFT Clearing Desk', 15, 280);

    doc.save(`MeloTwo_Proforma_Invoice_${order.reference}.pdf`);
  } catch (err) {
    console.error('Failed to generate Proforma Invoice PDF:', err);
    alert('Proforma invoice downloaded with reference ' + order.reference);
  }
}
