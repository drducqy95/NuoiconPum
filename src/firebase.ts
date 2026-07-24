import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut as fbSignOut } from 'firebase/auth';
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

export const signIn = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.warn('Google Popup SignIn error, trying redirect fallback...', error);
    const code = error?.code || '';

    if (code === 'auth/unauthorized-domain') {
      alert('⚠️ Lỗi tên miền chưa được cấp phép trong Firebase:\n\nVui lòng vào Firebase Console > Authentication > Settings > Authorized domains và thêm tên miền Vercel của bạn (ví dụ: nuoiconpum.vercel.app).');
      return;
    }

    if (code === 'auth/popup-closed-by-user') {
      // User closed popup manually
      return;
    }

    // Fallback to Redirect for popup-blocked or mobile devices
    try {
      await signInWithRedirect(auth, provider);
    } catch (redirectErr: any) {
      console.error('Google Redirect SignIn Error:', redirectErr);
      alert(`Không thể mở trang đăng nhập Google: ${redirectErr?.message || 'Vui lòng kiểm tra kết nối mạng.'}`);
    }
  }
};

export const signOut = () => fbSignOut(auth);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
