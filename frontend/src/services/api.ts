const API_BASE_URL = 'http://0.0.0.0:8080';

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

  // Monta a URL completa
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Inicializa headers
  const headers = new Headers(fetchOptions.headers || {});

  // Adiciona o JWT se não for para pular autenticação
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Garante que Content-Type seja JSON se tiver body
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Faz a requisição com os headers atualizados
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
}

/**
 * Wrapper de fetch para login (sem autenticação)
 */
export async function loginFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  return apiFetch(endpoint, { ...options, skipAuth: true });
}
