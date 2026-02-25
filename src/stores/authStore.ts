
import { atom } from 'nanostores';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/firebase/client';

export type UserProfile = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: 'admin' | 'client'; // Custom claim or from firestore
};

export const $user = atom<UserProfile | null>(null);
export const $loading = atom<boolean>(true);

// Escuchar cambios de autenticación
if (typeof window !== 'undefined') {
    onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
            // Obtener el token para saber el rol (claims)
            const tokenResult = await user.getIdTokenResult();
            const role = (tokenResult.claims.role as 'admin' | 'client') || 'client';

            $user.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role
            });

            // Setear cookie para middleware SSR (importante para protección de rutas)
            // Token expira en 1 hora, idealmente usar mecanismo de refresh o session cookies de Firebase
            const token = await user.getIdToken();
            document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Lax`;
            
        } else {
            $user.set(null);
            // Borrar cookie
             document.cookie = `session=; path=/; max-age=0;`;
        }
        $loading.set(false);
    });
}
