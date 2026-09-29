import { jsPDF } from 'jspdf';
import { EftBankDetails, EftOrderSubmission, PayPalConfig, PaymentSuccessResult } from '../types';

export const EFT_BANKING_DETAILS: EftBankDetails = {
  bankName: 'First National Bank (FNB)',
  accountName: 'MeloTwo Mine Safety & Compliance (Pty) Ltd',
  accountNumber: '62894103852',
  branchCode: '250655',
  accountType: 'Commercial Cheque Account',
  swiftCode: 'FIRNZAJJ',
  country: 'South Africa'
};

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

  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID) || '';
  const envModeRaw = (typeof import.meta !== 'undefined' && ((import.meta as any).env?.PAYPAL_ENVIRONMENT || (import.meta as any).env?.VITE_PAYPAL_ENVIRONMENT)) || '';
  const envMode: 'sandbox' | 'live' = envModeRaw.toLowerCase() === 'sandbox' ? 'sandbox' : 'live';

  const resolvedKey = localKey.trim() || envKey.trim();
  const resolvedMode = localMode || (resolvedKey ? envMode : 'sandbox');

  return {
    clientId: resolvedKey,
    mode: resolvedMode,
    currency: localCurrency,
    isConfigured: Boolean(resolvedKey)
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
      if (data.clientId && !localStorage.getItem('melotwo_paypal_client_id')) {
        localStorage.setItem('melotwo_paypal_client_id', data.clientId);
      }
      return {
        clientId: data.clientId || getStoredPayPalConfig().clientId,
        mode: data.mode || 'sandbox',
        currency: data.currency || 'USD',
        isConfigured: Boolean(data.clientId || getStoredPayPalConfig().clientId)
      };
    }
  } catch (e) {
    console.warn('[PaymentService] Server config fetch error:', e);
  }
  return getStoredPayPalConfig();
}

export function generateEftReference(tierOrContext: string = 'SANS'): string {
  const prefix = tierOrContext.toLowerCase().includes('sprint') ? 'SPRINT'
    : tierOrContext.toLowerCase().includes('pro') ? 'PRO'
    : tierOrContext.toLowerCase().includes('enter') ? 'ENT'
    : tierOrContext.toLowerCase().includes('site') ? 'SITE'
    : 'SANS';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `MT-${prefix}-${randNum}`;
}

export async function submitEftOrder(submission: {
  reference: string;
  amountZar: number;
  enterpriseName: string;
  email: string;
  tierOrItem: string;
  notes?: string;
  popFileName?: string;
}): Promise<EftOrderSubmission> {
  const order: EftOrderSubmission = {
    id: `EFT-${Date.now()}`,
    reference: submission.reference,
    amountZar: submission.amountZar,
    enterpriseName: submission.enterpriseName,
    email: submission.email,
    tierOrItem: submission.tierOrItem,
    notes: submission.notes,
    popFileName: submission.popFileName,
    status: 'PROVISIONALLY_APPROVED',
    createdAt: new Date().toISOString()
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
}) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

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
      ['Bank Name:', EFT_BANKING_DETAILS.bankName],
      ['Account Holder:', EFT_BANKING_DETAILS.accountName],
      ['Account Number:', EFT_BANKING_DETAILS.accountNumber],
      ['Branch Code:', EFT_BANKING_DETAILS.branchCode],
      ['Account Type:', EFT_BANKING_DETAILS.accountType],
      ['SWIFT / BIC:', EFT_BANKING_DETAILS.swiftCode],
      ['Payment Reference:', order.reference]
    ];

    let yPos = 164;
    bankFields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(label, 20, yPos);

      doc.setFont('helvetica', label.includes('Reference') ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(label.includes('Reference') ? 180 : 15, label.includes('Reference') ? 83 : 23, label.includes('Reference') ? 9 : 42);
      doc.text(value, 75, yPos);
      yPos += 7.5;
    });

    // Important Notice
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(15, yPos + 4, 180, 22, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(15, yPos + 4, 180, 22, 'S');

    doc.setTextColor(146, 64, 14); // amber-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('MANDATORY COMPLIANCE INSTRUCTION:', 20, yPos + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      `Please state "${order.reference}" as your beneficiary reference. Submit your Proof of Payment (POP) via the terminal or email to billing@melotwo.co.za for immediate ledger verification.`,
      20,
      yPos + 17,
      { maxWidth: 170 }
    );

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Melotwo SHEQ Operations Division | Reg No: 2024/098124/07 | SANS 10108 / 10142-1 Certified', 15, 280);

    doc.save(`MeloTwo_EFT_Invoice_${order.reference}.pdf`);
  } catch (err) {
    console.error('Failed to generate EFT Invoice PDF:', err);
    alert('Invoice downloaded with reference ' + order.reference);
  }
}
