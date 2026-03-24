/**
 * SM-2 spaced repetition algorithm.
 *
 * Given a quality rating (0-5), the current ease factor, interval, and
 * repetition count, compute the next review schedule.
 *
 * @param {number} quality - Rating from 0 (complete failure) to 5 (perfect).
 * @param {number} easeFactor - Current ease factor (>= 1.3).
 * @param {number} interval - Current interval in days.
 * @param {number} repetitions - Number of consecutive correct repetitions.
 * @returns {{ easeFactor: number, interval: number, repetitions: number, nextReview: string }}
 */
export const calculateNextReview = (quality, easeFactor, interval, repetitions) => {
  let newEF = easeFactor;
  let newInterval = interval;
  let newReps = repetitions;

  if (quality >= 3) {
    // Correct response
    if (newReps === 0) newInterval = 1;
    else if (newReps === 1) newInterval = 6;
    else newInterval = Math.round(newInterval * newEF);
    newReps += 1;
  } else {
    // Incorrect response -- reset
    newReps = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEF = newEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    interval: newInterval,
    repetitions: newReps,
    nextReview: nextReview.toISOString(),
  };
};
