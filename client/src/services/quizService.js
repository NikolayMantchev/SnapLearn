import api from './api';

/**
 * @param {string} uploadId
 * @param {{ numQuestions?: number, difficulty?: string }} options
 * @returns {Promise<object>}
 */
export async function generate(uploadIds, options = {}) {
  // Support single ID or array of IDs
  const ids = Array.isArray(uploadIds) ? uploadIds : [uploadIds];
  const { data } = await api.post('/quizzes/generate', { uploadIds: ids, uploadId: ids[0], ...options });
  return data;
}

/** @returns {Promise<object[]>} */
export async function getAll() {
  const { data } = await api.get('/quizzes');
  return data;
}

/**
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getById(id) {
  const { data } = await api.get(`/quizzes/${id}`);
  return data;
}

/**
 * @param {string} quizId
 * @param {object[]} answers
 * @returns {Promise<object>}
 */
export async function submit(quizId, answers) {
  const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return data;
}
