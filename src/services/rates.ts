import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

export async function saveMonthRate(
  uid: string,
  monthKey: string,
  ratePerLitre: number
): Promise<void> {
  const rate = Number(ratePerLitre) || 0;
  const rateRef = doc(db, 'users', uid, 'rates', monthKey);
  await setDoc(
    rateRef,
    {
      ratePerLitre: rate,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeToRates(
  uid: string,
  callback: (rates: Record<string, number>) => void
) {
  const ratesCol = collection(db, 'users', uid, 'rates');
  return onSnapshot(ratesCol, (snapshot) => {
    const data: Record<string, number> = {};
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      data[docSnap.id] = d.ratePerLitre ?? 0;
    });
    callback(data);
  });
}
