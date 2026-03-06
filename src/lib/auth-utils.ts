import { signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth } from "./firebase/client";

/**
 * Inicia sesión usando Firebase Auth y sincroniza el token con las cookies
 * para habilitar SSR (Server-Side Rendering).
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  // 1. Iniciar sesión en Firebase (Client SDK)
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // 2. Obtener el token JWT de Firebase
  const token = await user.getIdToken();
  
  // 3. Guardar el token en una cookie para que Astro (SSR) pueda leerlo
  document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;
  
  return user;
}

/**
 * Cierra sesión en Firebase Auth y limpia la cookie de sesión.
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
  document.cookie = 'session=; path=/; max-age=0; SameSite=Strict; Secure';
  window.location.href = '/login';
}

/**
 * Refresca el token actual de Firebase y actualiza la cookie.
 * Útil cuando el token expiró (dura 1 hr por defecto).
 */
export async function refreshSessionParams(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  const token = await user.getIdToken(true);
  document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;
  
  return token;
}

/**
 * Obtiene el token actual del usuario logueado en Firebase.
 */
export async function getCurrentToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const user = auth.currentUser;
    if (user) {
      user.getIdToken().then(resolve).catch(() => resolve(null));
    } else {
      resolve(null);
    }
  });
}
