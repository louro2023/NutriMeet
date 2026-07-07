export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function fetchJson(path: string, options: RequestInit = {}) {
  const headers: Record<string,string> = {};
  // include admin token from localStorage if present
  try {
    const tok = localStorage.getItem('adminToken');
    if (tok) headers['x-admin-token'] = tok;
  } catch(e) {}

  if (options.headers) {
    const optHeaders = options.headers as Record<string,string>;
    Object.assign(headers, optHeaders);
  }

  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    let payload: any = null;
    try { payload = await res.json(); } catch(e) {}
    throw new ApiError(res.status, payload?.error || `Fetch error ${res.status}`, payload);
  }
  return res.json();
}

export const getNutritionists = () => fetchJson('/api/nutritionists');
export const getNutritionist = (id: string) => fetchJson(`/api/nutritionists/${id}`);
export const getSpecialties = () => fetchJson('/api/specialties');
export const getApproaches = () => fetchJson('/api/approaches');
export const getStates = () => fetchJson('/api/states');
export const getTestimonials = () => fetchJson('/api/testimonials');
export const getFaqs = () => fetchJson('/api/faqs');
export const getSubscriptions = () => fetchJson('/api/subscriptions');
export const getHealth = () => fetchJson('/api/health');
export const loginAdmin = (email: string, password: string) => fetchJson('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }), headers: { 'Content-Type': 'application/json' } });
export const createSubscription = (body: any) => fetchJson('/api/subscriptions', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });

export const updateSubscriptionStatus = (id: string, status: string) => fetchJson(`/api/subscriptions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } });
export const updateNutritionist = (id: string, body: any) => fetchJson(`/api/nutritionists/${id}`, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
export const createNutritionist = (body: any) => fetchJson('/api/nutritionists', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
export const deleteNutritionist = (id: string) => fetchJson(`/api/nutritionists/${id}`, { method: 'DELETE' });
export const deleteAllNutritionists = () => fetchJson('/api/nutritionists', { method: 'DELETE' });
export const deleteAllSubscriptions = () => fetchJson('/api/subscriptions', { method: 'DELETE' });
export const updateList = (key: string, value: any[]) => fetchJson(`/api/lists/${key}`, { method: 'PUT', body: JSON.stringify({ value }), headers: { 'Content-Type': 'application/json' } });
