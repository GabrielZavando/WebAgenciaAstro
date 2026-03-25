
import { atom } from 'nanostores';
import { onIdTokenChanged, type User } from 'firebase/auth';
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

// Escuchar cambios de autenticación y refresco automático de token
if (typeof window !== 'undefined') {
    // onIdTokenChanged se dispara al loguearse, desloguearse o cuando el token expira y Firebase lo renueva
    onIdTokenChanged(auth, async (user: User | null) => {
        if (user) {
            try {
                // Obtener el token (forzamos refresh si Firebase determinó que está expirando en onIdTokenChanged)
                const tokenResult = await user.getIdTokenResult();
                const role = (tokenResult.claims.role as 'admin' | 'client') || 'client';

                $user.set({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    role
                });

                // IMPORTANTE: No sobrescribir la cookie 'session' aquí si usamos una de larga duración (14 días).
                // El middleware usará preferentemente la de sesión del backend.
                // const token = await user.getIdToken();
                // document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Lax`;
            } catch (e) {
                console.error("Error renovando la sesión:", e);
                // Si falla catastróficamente, mejor borrar cookie por seguridad
                document.cookie = `session=; path=/; max-age=0;`;
            }
        } else {
            $user.set(null);
            // Borrar cookie al hacer logout
            document.cookie = `session=; path=/; max-age=0;`;
        }
        $loading.set(false);
    });
}
