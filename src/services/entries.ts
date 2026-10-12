import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { deriveStatus, EntryData } from '../utils/calculations';

export async function saveEntry(
  uid: string,
  dateKey: string,
  morning: number,
  evening: number
): Promise<void> {
  const m = Math.round(Number(morning) * 100) / 100;
  const e = Math.round(Number(evening) * 100) / 100;
  const status = deriveStatus(m, e);

  const entryRef = doc(db, 'users', uid, 'entries', dateKey);
  await setDoc(
    entryRef,
    {
      morning: m,
      evening: e,
      status,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeToEntries(
  uid: string,
  callback: (entries: Record<string, EntryData>) => void
) {
  const entriesCol = collection(db, 'users', uid, 'entries');
  return onSnapshot(entriesCol, (snapshot) => {
    const data: Record<string, EntryData> = {};
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      data[docSnap.id] = {
        morning: d.morning ?? 0,
        evening: d.evening ?? 0,
        status: d.status,
        updatedAt: d.updatedAt,
      };
    });
    callback(data);
  });
}
