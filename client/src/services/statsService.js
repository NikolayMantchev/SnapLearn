import api from './api';

/** @returns {Promise<object>} */
export async function getOverview() {
  const { data } = await api.get('/stats/overview');
  return data;
}

/** @returns {Promise<object[]>} */
export async function getHistory() {
  const { data } = await api.get('/stats/history');
  return data;
}
