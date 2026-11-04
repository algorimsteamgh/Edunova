import { getDatabase } from '../../database/index.js';
import crypto from 'node:crypto';

export class QuizRepository {
  findQuizByLessonId(lessonId) {
    const db = getDatabase();
    return db.prepare(`SELECT * FROM quizzes WHERE lesson_id = ?`).get(lessonId);
  }

  findQuizById(quizId) {
    const db = getDatabase();
    return db.prepare(`SELECT * FROM quizzes WHERE id = ?`).get(quizId);
  }

  findQuestions(quizId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC
    `).all(quizId);
  }

  findSubmission(quizId, studentId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM quiz_submissions
      WHERE quiz_id = ? AND student_id = ?
      ORDER BY submitted_at DESC LIMIT 1
    `).get(quizId, studentId);
  }

  saveSubmission({ quizId, studentId, score, passed, answersJson }) {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO quiz_submissions (id, quiz_id, student_id, score, passed, answers_json, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, quizId, studentId, score, passed ? 1 : 0, answersJson, now);

    return { id, quiz_id: quizId, student_id: studentId, score, passed: Boolean(passed), submitted_at: now };
  }
}

export const quizRepository = new QuizRepository();

