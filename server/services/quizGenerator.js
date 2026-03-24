import { generateQuizQuestions } from './claudeService.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

export async function generate(userId, uploadId, extractedText, options = {}) {
  const quizData = await generateQuizQuestions(extractedText, options);

  const title = quizData.title || 'Quiz';
  const subject = quizData.subject || null;
  const difficulty = options.difficulty || 'medium';
  const questionsData = quizData.questions || [];

  if (questionsData.length === 0) {
    throw new Error('Keine Fragen generiert');
  }

  const quiz = await Quiz.create({
    user_id: userId,
    upload_id: uploadId,
    title,
    subject,
    difficulty,
  });

  const insertedQuestions = [];
  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    const question = await Question.create({
      quiz_id: quiz._id,
      type: q.type,
      question_text: q.question_text,
      options: q.options || null,
      correct_answer: q.correct_answer,
      explanation: q.explanation || null,
      order_index: i,
    });
    insertedQuestions.push(question);
  }

  return {
    id: quiz._id,
    title,
    subject,
    difficulty,
    uploadId,
    questions: insertedQuestions,
  };
}
