import api from './api';

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

/**
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function register(username, email, password) {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data;
}

/**
 * @returns {Promise<{user: object}>}
 */
export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}
