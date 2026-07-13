import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google OAuth Provider with Workspace Scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

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
  detailedNotes?: string;
}

/**
 * Initialize Auth State Listener
 */
export const initAuthState = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else {
        // If logged in but token is not in-memory (e.g., page refresh),
        // we might need to prompt login again to get an active access token with correct scopes.
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

/**
 * Trigger Google Sign-In with Drive & Sheets Scopes
 */
export const loginWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google OAuth access token missing from result.');
    }
    cachedAccessToken = credential.accessToken;
    
    // Save session config securely to Firestore (with local storage fallback)
    try {
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        lastLogin: new Date().toISOString(),
        hasConnectedLedger: true
      }, { merge: true });
    } catch (firestoreError) {
      console.warn('Firestore write failed, falling back to local storage:', firestoreError);
      localStorage.setItem(`melotwo_user_state_${result.user.uid}`, JSON.stringify({
        email: result.user.email,
        displayName: result.user.displayName,
        lastLogin: new Date().toISOString()
      }));
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Log Out and Clear Session Cache
 */
export const logoutUser = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Scan root Drive directory for MeloTwo_Compliance_Ledger spreadsheet
 */
export const findOrCreateSpreadsheet = async (token: string): Promise<string> => {
  const searchUrl = 'https://www.googleapis.com/drive/v3/files?q=' + 
    encodeURIComponent("name='MeloTwo_Compliance_Ledger' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false") +
    '&fields=files(id,name)';

  try {
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Drive search failed: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    if (searchData.files && searchData.files.length > 0) {
      console.log('Found existing ledger sheet:', searchData.files[0].name, 'ID:', searchData.files[0].id);
      return searchData.files[0].id;
    }

    // Ledger doesn't exist, create it!
    console.log('MeloTwo_Compliance_Ledger not found. Creating programmatically...');
    const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: 'MeloTwo_Compliance_Ledger'
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Sheets creation failed: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    const spreadsheetId = createData.spreadsheetId;
    console.log('Created new spreadsheet with ID:', spreadsheetId);

    // Initialize Columns
    const initUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:H1?valueInputOption=RAW`;
    const initResponse = await fetch(initUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[
          'Date',
          'Operator',
          'Terminal ID',
          'Risk Category',
          'SANS/POPIA Violation Vector',
          'Severity Level',
          'Audit Status',
          'Detailed Notes'
        ]]
      })
    });

    if (!initResponse.ok) {
      throw new Error(`Spreadsheet headers initialization failed: ${initResponse.statusText}`);
    }

    return spreadsheetId;
  } catch (err) {
    console.error('findOrCreateSpreadsheet failed:', err);
    throw err;
  }
};

/**
 * Fetch all records from the Google Sheet
 */
export const fetchLedgerRecords = async (token: string, spreadsheetId: string): Promise<ComplianceLedgerRow[]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:H500`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch spreadsheet rows: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }

    return data.values.map((row: any[]) => ({
      date: row[0] || '',
      operator: row[1] || '',
      terminalId: row[2] || '',
      riskCategory: row[3] || '',
      violationVector: row[4] || '',
      severityLevel: row[5] || '',
      auditStatus: row[6] || '',
      detailedNotes: row[7] || ''
    }));
  } catch (err) {
    console.error('fetchLedgerRecords failed:', err);
    throw err;
  }
};

/**
 * Append a row to the Google Sheet
 */
export const appendLedgerRecord = async (
  token: string,
  spreadsheetId: string,
  record: ComplianceLedgerRow
): Promise<void> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:A:append?valueInputOption=USER_ENTERED`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[
          record.date,
          record.operator,
          record.terminalId,
          record.riskCategory,
          record.violationVector,
          record.severityLevel,
          record.auditStatus,
          record.detailedNotes || ''
        ]]
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to append row to spreadsheet: ${response.statusText}`);
    }
    console.log('Appended compliance record successfully to sheet!');
  } catch (err) {
    console.error('appendLedgerRecord failed:', err);
    throw err;
  }
};
