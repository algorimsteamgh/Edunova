import { bookmarkRepository } from './repository.js';

export const bookmarkController = {
  toggle: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const { lessonId } = req.params;
      const { notes } = req.body || {};
      const result = bookmarkRepository.toggle(studentId, lessonId, notes || '');
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const bookmarks = bookmarkRepository.findAllByStudent(studentId);
      res.status(200).json({
        status: 'success',
        data: { bookmarks },
      });
    } catch (err) {
      next(err);
    }
  },
};

