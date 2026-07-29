import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, query, where, getDocs, setDoc, updateDoc, deleteDoc, Timestamp, orderBy, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Sign-In helper (supports optional extra OAuth scopes like Drive)
export const signInWithGoogle = async (includeDriveScope: boolean = false) => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  if (includeDriveScope) {
    provider.addScope('https://www.googleapis.com/auth/drive.file');
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) {
      sessionStorage.setItem('gdrive_access_token', accessToken);
    }
    return result;
  } catch (error: any) {
    console.warn('Google Popup SignIn error, trying redirect fallback...', error);
    const code = error?.code || '';

    if (code === 'auth/unauthorized-domain') {
      alert('⚠️ Lỗi tên miền chưa được cấp phép trong Firebase:\n\nVui lòng vào Firebase Console > Authentication > Settings > Authorized domains và thêm tên miền Vercel của bạn (ví dụ: nuoiconpum.vercel.app).');
      throw error;
    }

    if (code === 'auth/popup-closed-by-user') {
      return;
    }

    // Fallback to Redirect for popup-blocked or mobile devices
    try {
      await signInWithRedirect(auth, provider);
    } catch (redirectErr: any) {
      console.error('Google Redirect SignIn Error:', redirectErr);
      alert(`Không thể mở trang đăng nhập Google: ${redirectErr?.message || 'Vui lòng kiểm tra kết nối mạng.'}`);
      throw redirectErr;
    }
  }
};

export const signIn = signInWithGoogle;

// Email/Password Login
export const signInWithEmail = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

// Email/Password Register
export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  if (res.user && name) {
    await updateProfile(res.user, { displayName: name });
  }
  return res;
};

// Password Reset Email
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const signOut = () => {
  sessionStorage.removeItem('gdrive_access_token');
  return fbSignOut(auth);
};

