import api from './api';

/** @returns {Promise<object[]>} */
export async function getDue() {
  const { data } = await api.get('/reviews/due');
  return data;
}

/**
 * @param {string} id
 * @param {number} quality  0-5
 * @returns {Promise<object>}
 */
export async function submitReview(id, quality) {
  const { data } = await api.post(`/reviews/${id}`, { quality });
  return data;
}
