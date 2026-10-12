import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export interface UserProfile {
  email: string;
  defaultMorning: number;
  defaultEvening: number;
  defaultRate: number;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      email: data.email || '',
      defaultMorning: data.defaultMorning ?? 1.0,
      defaultEvening: data.defaultEvening ?? 0.5,
      defaultRate: data.defaultRate ?? 56,
    };
  }
  return null;
}

export async function updateUserDefaults(
  uid: string,
  defaultMorning: number,
  defaultEvening: number,
  defaultRate?: number
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  const updateData: Record<string, any> = {
    defaultMorning,
    defaultEvening,
  };
  if (defaultRate !== undefined) {
    updateData.defaultRate = defaultRate;
  }
  await setDoc(docRef, updateData, { merge: true });
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
) {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        email: data.email || '',
        defaultMorning: data.defaultMorning ?? 1.0,
        defaultEvening: data.defaultEvening ?? 0.5,
        defaultRate: data.defaultRate ?? 56,
      });
    } else {
      callback(null);
    }
  });
}
