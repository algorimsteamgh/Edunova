import { quizService } from './service.js';

export const quizController = {
  getByLesson: async (req, res, next) => {
    try {
      const studentId = req.user?.id || null;
      const { lessonId } = req.params;
      const quiz = await quizService.getQuizForLesson(lessonId, studentId);
      res.status(200).json({
        status: 'success',
        data: { quiz },
      });
    } catch (err) {
      next(err);
    }
  },

  submit: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const { quizId } = req.params;
      const { answers } = req.body;
      const result = await quizService.submitQuiz(quizId, studentId, answers);
      res.status(200).json({
        status: 'success',
        message: result.passed ? 'Quiz passed!' : 'Quiz completed. Keep practicing!',
        data: { result },
      });
    } catch (err) {
      next(err);
    }
  },
};

