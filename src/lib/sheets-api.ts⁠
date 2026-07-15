import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase with fallback for environment configurations
const hasValidConfig = firebaseConfig && (firebaseConfig as any).apiKey;
const finalConfig = hasValidConfig ? firebaseConfig : {
    apiKey: "mock-api-key-for-build-safety",
    authDomain: "mock-auth-domain",
    projectId: "mock-project-id",
    storageBucket: "mock-storage-bucket",
    messagingSenderId: "mock-sender-id",
    appId: "mock-app-id"
};

const app = initializeApp(finalConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google OAuth Provider with Workspace Scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// Memory Cache for Access Token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface ComplianceLedgerRow {
    date: string;
    operator: string;
    terminalId: string;
    riskCategory: string;
    violationVector: string;
    severityLevel: string;
    auditStatus: string;
    detailedNotes: string;
}

// Custom Firebase Auth State Observer
export function initAuthState(onUserChanged: (user: any, token: string | null) => void) {
    return auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Retrieve Google OAuth credential token from local storage cache if available
            const savedToken = localStorage.getItem('melotwo_google_oauth_token');
            onUserChanged(user, savedToken);
        } else {
            cachedAccessToken = null;
            localStorage.removeItem('melotwo_google_oauth_token');
            onUserChanged(null, null);
        }
    });
}

// Google Login Trigger
export async function loginWithGoogle(): Promise<{ user: any; token: string }> {
    if (isSigningIn) {
        throw new Error("Authentication request already in progress.");
    }
    isSigningIn = true;
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken || null;
        
        if (!token) {
            throw new Error("Failed to retrieve valid Google Workspace OAuth credentials.");
        }

        cachedAccessToken = token;
        localStorage.setItem('melotwo_google_oauth_token', token);
        return { user: result.user, token };
    } finally {
        isSigningIn = false;
    }
}

// Google Logout Trigger
export async function logoutUser(): Promise<void> {
    await signOut(auth);
    cachedAccessToken = null;
    localStorage.removeItem('melotwo_google_oauth_token');
    localStorage.removeItem('melotwo_spreadsheet_id');
}

// Locate or Create Google Spreadsheet
export async function findOrCreateSpreadsheet(token: string, userId: string, operationName: string): Promise<string> {
    const cacheKey = `melotwo_spreadsheet_id_${userId}`;
    const cachedId = localStorage.getItem(cacheKey);
    if (cachedId) {
        return cachedId;
    }

    const bearerToken = token || cachedAccessToken || localStorage.getItem('melotwo_google_oauth_token');
    if (!bearerToken) {
        throw new Error("User must be authenticated with Google Workspace to create a spreadsheet.");
    }

    const safeTitle = `MeloTwo Safety Ledger - ${operationName || 'Mine Site'}`;
    
    // First, let's create the Spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            properties: {
                title: safeTitle
            }
        })
    });

    if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to provision Google Sheet: ${errText}`);
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;

    // Initialize Headers
    const headers = [
        'Date',
        'Operator',
        'Terminal ID',
        'Risk Category',
        'SANS / Violation Vector',
        'Severity Level',
        'Audit Status',
        'Detailed Notes'
    ];

    const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:H1:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: [headers]
        })
    });

    if (!appendRes.ok) {
        console.error("Failed to append spreadsheet headers.");
    }

    localStorage.setItem(cacheKey, spreadsheetId);
    return spreadsheetId;
}

// Fetch Existing Logs
export async function fetchLedgerRecords(token: string, spreadsheetId: string): Promise<ComplianceLedgerRow[]> {
    const bearerToken = token || cachedAccessToken || localStorage.getItem('melotwo_google_oauth_token');
    if (!bearerToken) {
        throw new Error("User must be authenticated to pull sheets telemetry.");
    }

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:H1000`, {
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to sync from sheet: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.values || data.values.length === 0) {
        return [];
    }

    return data.values.map((row: any) => ({
        date: row[0] || '',
        operator: row[1] || '',
        terminalId: row[2] || '',
        riskCategory: row[3] || '',
        violationVector: row[4] || '',
        severityLevel: row[5] || '',
        auditStatus: row[6] || '',
        detailedNotes: row[7] || ''
    }));
}

// Append Row Record
export async function appendLedgerRecord(token: string, spreadsheetId: string, row: ComplianceLedgerRow): Promise<void> {
    const bearerToken = token || cachedAccessToken || localStorage.getItem('melotwo_google_oauth_token');
    if (!bearerToken) {
        throw new Error("User must be authenticated to push ledger records.");
    }

    const values = [[
        row.date,
        row.operator,
        row.terminalId,
        row.riskCategory,
        row.violationVector,
        row.severityLevel,
        row.auditStatus,
        row.detailedNotes
    ]];

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:H:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Google Sheets append failed: ${err}`);
    }
}
