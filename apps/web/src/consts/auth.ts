
export const PUBLIC_ROUTES = ['/login', '/', '/api/auth/google', '/api/auth/google/callback'];

export const isProtectedRoute = (pathname: string) => {
    // Static assets
    if (pathname.startsWith('/_astro') || pathname.startsWith('/favicon.ico')) return false;

    // Public routes
    if (PUBLIC_ROUTES.includes(pathname)) return false;

    return true;
};
