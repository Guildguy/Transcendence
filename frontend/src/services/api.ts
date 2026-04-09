const API_BASE_URL = "https://ft-trans.42.fr/api/java";

/**
 * Obtém o JWT do localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Salva o JWT no localStorage
 */
export function saveAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

/**
 * Remove o JWT do localStorage
 */
export function clearAuthToken(): void {
  localStorage.removeItem('authToken');
}

/**
 * Interface de opções para requisições customizadas
 */
interface FetchOptions extends RequestInit {
  skipAuth?: boolean; // Pula a adição do token de autenticação
}

/**
 * Wrapper de fetch que adiciona automaticamente o JWT nos headers
 */
export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  console.log(`>>> Chamando API: ${fetchOptions.method || 'GET'} ${url}`); // LOG DE TESTE

  const headers = new Headers(fetchOptions.headers || {});

  if (!skipAuth) {
    const token = getAuthToken();
    console.log(">>> Token recuperado:", token ? "Token encontrado" : "TOKEN VAZIO!"); 
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Log dos headers finais antes do fetch
  console.log(">>> Headers enviados:", Object.fromEntries(headers.entries()));

  return fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
    mode: 'cors',
  });
}

/**
 * Wrapper de fetch para login (sem autenticação)
 */
export async function loginFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  return apiFetch(endpoint, { ...options, skipAuth: true });
}
