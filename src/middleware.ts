import { defineMiddleware } from 'astro/middleware';
import { getAdminAuth } from './lib/firebase/server';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, redirect } = context;
    const path = new URL(url).pathname;

    // Rutas protegidas
    const isAdminRoute = path.startsWith('/admin');
    const isDashboardRoute = path.startsWith('/dashboard');

    if (isAdminRoute || isDashboardRoute) {
        const sessionCookie = context.cookies.get('session')?.value;

        if (!sessionCookie) {
            return redirect('/login');
        }

        try {
            // Validar la Session Cookie (creada con createSessionCookie en el backend)
            await getAdminAuth().verifySessionCookie(sessionCookie, true);
        } catch (error) {
            console.error('Error validando token en middleware:', error);
            // Si el token expiró o es inválido, forzamos eliminar cookie y redirigir
            context.cookies.delete('session', { path: '/' });
            return redirect('/login');
        }
    }

    return next();
});
