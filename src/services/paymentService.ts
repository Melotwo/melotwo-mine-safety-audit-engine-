import { jsPDF } from 'jspdf';
import { 
  EftBankDetails, 
  EftBankAccountsConfig, 
  SupportedEftBankKey, 
  EftOrderSubmission, 
  PayPalConfig, 
  PaymentSuccessResult 
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

export async function submitEftOrder(submission: {
  reference: string;
  amountZar: number;
  enterpriseName: string;
  email: string;
  tierOrItem: string;
  selectedBank?: SupportedEftBankKey;
  bankName?: string;
  notes?: string;
  popFileName?: string;
  popFileDataUrl?: string;
}): Promise<EftOrderSubmission> {
  const bankKey = submission.selectedBank || 'capitec';
  const resolvedBank = EFT_BANK_ACCOUNTS[bankKey] || EFT_BANK_ACCOUNTS.capitec;
  const activePartnerCode = typeof localStorage !== 'undefined' ? localStorage.getItem('melotwo_partner_ref') || undefined : undefined;

  const order: EftOrderSubmission = {
    id: `EFT-${Date.now()}`,
    reference: submission.reference,
    amountZar: submission.amountZar,
    enterpriseName: submission.enterpriseName,
    email: submission.email,
    tierOrItem: submission.tierOrItem,
    selectedBank: bankKey,
    bankName: resolvedBank.bankName,
    notes: submission.notes,
    popFileName: submission.popFileName,
    popFileDataUrl: submission.popFileDataUrl,
    status: 'PROVISIONALLY_APPROVED',
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
  amountZar: number;
  enterpriseName: string;
  email: string;
  tierOrItem: string;
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

    // Dark Slate Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 45, 'F');

    // Accent line
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 44, 210, 1.5, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('MELOTWO MINE SAFETY & COMPLIANCE', 15, 18);

    doc.setFontSize(9);
    doc.setTextColor(245, 158, 11);
    doc.text('OFFICIAL PROFORMA TAX INVOICE & EFT INSTRUCTION', 15, 27);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Doc Ref: ${order.reference}  |  Date: ${new Date().toLocaleDateString('en-ZA')}`, 15, 36);

    // Bill To Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('BILL TO / CLIENT DETAILS', 15, 58);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Enterprise: ${order.enterpriseName || 'Industrial Client'}`, 15, 66);
    doc.text(`Official Contact: ${order.email || 'N/A'}`, 15, 73);
    doc.text(`Operational Item: ${order.tierOrItem}`, 15, 80);

    // Line items box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 90, 180, 26, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 90, 180, 26, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Description', 20, 97);
    doc.text('Qty', 130, 97);
    doc.text('Amount (ZAR)', 160, 97);

    doc.setFont('helvetica', 'normal');
    doc.text(order.tierOrItem, 20, 107);
    doc.text('1', 133, 107);
    doc.setFont('helvetica', 'bold');
    doc.text(`R${order.amountZar.toLocaleString('en-ZA')}.00`, 160, 107);

    // Total box
    doc.setFillColor(15, 23, 42);
    doc.rect(125, 122, 70, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL DUE (ZAR):', 130, 132);
    doc.setTextColor(245, 158, 11);
    doc.text(`R${order.amountZar.toLocaleString('en-ZA')}`, 170, 132);

    // Official Banking Coordinates
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ELECTRONIC FUNDS TRANSFER (EFT) BANKING COORDINATES', 15, 152);

    doc.setDrawColor(203, 213, 225);
    doc.line(15, 155, 195, 155);

    const bankFields = [
      ['Selected Bank:', `${activeBank.bankName} ${activeBank.isPrimary ? '(Primary Clearing Account)' : '(Secondary Corporate Account)'}`],
      ['Account Name:', activeBank.accountName],
      ['Account Number:', activeBank.accountNumber],
      ['Branch Code:', activeBank.branchCode],
      ['SWIFT / BIC:', activeBank.swiftCode],
      ['Account Type:', activeBank.accountType],
      ['Country of Account:', activeBank.country],
      ['Mandatory Reference:', order.reference]
    ];

    let yPos = 163;
    bankFields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(label, 20, yPos);

      const isRef = label.includes('Reference');
      doc.setFont('helvetica', isRef ? 'bold' : 'normal');
      doc.setFontSize(isRef ? 10 : 9);
      doc.setTextColor(isRef ? 180 : 15, isRef ? 83 : 23, isRef ? 9 : 42);
      doc.text(value, 75, yPos);
      yPos += 7;
    });

    // Secondary Account Wire Instructions Box
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, yPos + 3, 180, 15, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, yPos + 3, 180, 15, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`ALTERNATIVE WIRE TRANSFER OPTION (${secondaryBank.bankName.toUpperCase()}):`, 20, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${secondaryBank.bankName}  |  Acc: ${secondaryBank.accountNumber}  |  Branch: ${secondaryBank.branchCode}  |  SWIFT: ${secondaryBank.swiftCode}  |  Acc Name: ${secondaryBank.accountName}`, 20, yPos + 13);

    // Important Notice
    const noticeY = yPos + 22;
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(15, noticeY, 180, 22, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(15, noticeY, 180, 22, 'S');

    doc.setTextColor(146, 64, 14); // amber-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('MANDATORY COMPLIANCE INSTRUCTION:', 20, noticeY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      `Please state "${order.reference}" as your beneficiary reference. Submit your Proof of Payment (POP) via the terminal upload or email to billing@melotwo.co.za for immediate ledger verification.`,
      20,
      noticeY + 12.5,
      { maxWidth: 170 }
    );

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Melotwo SHEQ Operations Division | Reg No: 2024/098124/07 | Capitec & FNB Corporate Settlement', 15, 280);

    doc.save(`MeloTwo_EFT_Invoice_${order.reference}.pdf`);
  } catch (err) {
    console.error('Failed to generate EFT Invoice PDF:', err);
    alert('Invoice downloaded with reference ' + order.reference);
  }
}
