import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export async function getIdToken(): Promise<string> {
  // If Firebase is not configured, return a mock token
  if (!auth) {
    console.warn('Firebase not configured, using mock authentication token');
    return 'mock_token_for_development';
  }

  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    return token;
  }

  // Wait for a user to be available (e.g., after login)
  const user = await new Promise<ReturnType<typeof auth.currentUser>>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      unsubscribe();
      if (!u) return reject(new Error('User not authenticated'));
      resolve(u);
    }, (err) => {
      unsubscribe();
      reject(err);
    });
  });

  const token = await user!.getIdToken();
  return token;
}