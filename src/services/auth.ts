import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export async function signUpUser(email: string, pass: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Create initial user document with defaults
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    email: user.email,
    defaultMorning: 1.0,
    defaultEvening: 0.5,
    defaultRate: 56,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function signInUser(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function changeUserPassword(currentPass: string, newPass: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user found.');
  }

  // Re-authenticate before updating password
  const credential = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await updatePassword(user, newPass);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
