
import { defineMiddleware } from 'astro/middleware';

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
    }

    return next();
});
