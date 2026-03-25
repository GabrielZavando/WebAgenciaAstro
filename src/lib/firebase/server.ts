import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const getFirebaseAdminApp = () => {
    const apps = getApps();
    if (apps.length === 0) {
        let cred;
        // En Astro, las variables de servidor se acceden vía process.env (Node) o import.meta.env
        // Usamos ambos como fallback por robustez en desarrollo vs build
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || import.meta.env.FIREBASE_SERVICE_ACCOUNT;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY || import.meta.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || import.meta.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID || import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;

        if (serviceAccountJson) {
            try {
                const serviceAccount = JSON.parse(serviceAccountJson);
                cred = cert(serviceAccount);
            } catch (e) {
                console.error('Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', e);
            }
        } else if (privateKey && clientEmail) {
            cred = cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            });
        }
        
        try {
            return initializeApp({
                projectId,
                credential: cred
            });
        } catch (error: any) {
            if (!/already exists/.test(error.message)) {
                console.error('Firebase Admin Error:', error.stack);
            }
            return apps[0] || getApps()[0];
        }
    }
    return apps[0];
};

export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
