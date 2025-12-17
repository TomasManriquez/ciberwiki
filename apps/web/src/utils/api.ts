
export const API_URL = "http://localhost:3000";

/**
 * serverFetch
 * Helper for making authenticated requests from Astro SSR (Server Side).
 * It forwards the cookie from the Astro Context to the API.
 */
export async function serverFetch(Astro: any, endpoint: string, options: RequestInit = {}) {
    const token = Astro.cookies.get("auth_token")?.value;

    // Ensure headers object exists
    const headers = new Headers(options.headers || {});

    // If token exists, pass it as a Cookie header to the API (or Authorization header if API supports it)
    // Since API middleware looks for 'auth_token' cookie or Bearer token, we can use Cookie header to simulate browser behavior
    if (token) {
        headers.append("Cookie", `auth_token=${token}`);
        headers.append("Authorization", `Bearer ${token}`); // Redundant/Safe backup
    }

    const config = {
        ...options,
        headers
    };

    return fetch(`${API_URL}${endpoint}`, config);
}
