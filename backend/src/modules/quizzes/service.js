import { quizRepository } from './repository.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

export class QuizService {
  async getQuizForLesson(lessonId, studentId = null) {
    const quiz = quizRepository.findQuizByLessonId(lessonId);
    if (!quiz) {
      return null;
    }

    const questions = quizRepository.findQuestions(quiz.id);
    const submission = studentId ? quizRepository.findSubmission(quiz.id, studentId) : null;

    // Do NOT leak correct_option_index unless student has submitted
    const hasSubmitted = Boolean(submission);
    const parsedQuestions = questions.map((q) => {
      const options = typeof q.options_json === 'string' ? JSON.parse(q.options_json || '[]') : q.options_json;
      return {
        id: q.id,
        questionText: q.question_text,
        options,
        position: q.position,
        ...(hasSubmitted ? {
          correctOptionIndex: q.correct_option_index,
          explanation: q.explanation,
        } : {}),
      };
    });

    return {
      id: quiz.id,
      lessonId: quiz.lesson_id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passing_score,
      questionsCount: questions.length,
      questions: parsedQuestions,
      latestSubmission: submission ? {
        score: submission.score,
        passed: Boolean(submission.passed),
        submittedAt: submission.submitted_at,
        answers: typeof submission.answers_json === 'string' ? JSON.parse(submission.answers_json || '{}') : submission.answers_json,
      } : null,
    };
  }

  async submitQuiz(quizId, studentId, submittedAnswers = {}) {
    const quiz = quizRepository.findQuizById(quizId);
    if (!quiz) {
      throw new NotFoundError(`Quiz not found: ${quizId}`);
    }

    const questions = quizRepository.findQuestions(quiz.id);
    if (!questions.length) {
      throw new BadRequestError('Quiz has no questions configured');
    }

    let correctCount = 0;
    const results = questions.map((q) => {
      const studentAnswer = submittedAnswers[q.id];
      const isCorrect = studentAnswer !== undefined && Number(studentAnswer) === Number(q.correct_option_index);
      if (isCorrect) correctCount++;

      const options = typeof q.options_json === 'string' ? JSON.parse(q.options_json || '[]') : q.options_json;
      return {
        questionId: q.id,
        questionText: q.question_text,
        options,
        selectedAnswer: studentAnswer,
        correctAnswer: q.correct_option_index,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passing_score;

    const submission = quizRepository.saveSubmission({
      quizId: quiz.id,
      studentId,
      score,
      passed,
      answersJson: JSON.stringify(submittedAnswers),
    });

    return {
      ...submission,
      totalQuestions: questions.length,
      correctCount,
      passingScore: quiz.passing_score,
      results,
    };
  }
}

export const quizService = new QuizService();

