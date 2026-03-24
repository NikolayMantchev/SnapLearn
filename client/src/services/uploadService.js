import api from './api';

/**
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export async function create(formData) {
  const { data } = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** @returns {Promise<object[]>} */
export async function getAll() {
  const { data } = await api.get('/uploads');
  return data;
}

/**
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getById(id) {
  const { data } = await api.get(`/uploads/${id}`);
  return data;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function remove(id) {
  await api.delete(`/uploads/${id}`);
}
