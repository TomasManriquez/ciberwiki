import { defineMiddleware } from "astro:middleware";
import { isProtectedRoute } from "./consts/auth";

export const onRequest = defineMiddleware(async (context, next) => {
    const { request, cookies, redirect } = context;
    const url = new URL(request.url);

    // 1. Check if route is protected
    if (isProtectedRoute(url.pathname)) {
        const token = cookies.get("auth_token");

        // 2. If no token, redirect to login
        if (!token || !token.value) {
            console.log(`🔒 Unauthenticated access to ${url.pathname}. Redirecting to /login`);
            return redirect("/login");
        }
    }

    return next();
});
