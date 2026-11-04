import React, { useState, useEffect } from 'react';
import { quizApi } from '../services/api';
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, ChevronRight } from 'lucide-react';

export default function KnowledgeCheckQuiz({ lessonId, onPassed }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});

    quizApi
      .getByLesson(lessonId)
      .then((res) => {
        setQuiz(res.data.quiz || null);
      })
      .catch((err) => {
        console.warn('No quiz available for lesson:', err.message);
        setQuiz(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lessonId]);

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '60px', marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ height: '60px' }} />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const handleSelectOption = (questionId, optionKey) => {
    if (result) return; // Locked once submitted
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await quizApi.submit(quiz.id, answers);
      const data = res.data;
      setResult(data);
      if (data.passed && onPassed) {
        onPassed(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAnswers({});
    setError('');
  };

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        marginTop: '2rem',
      }}
    >
      {/* Quiz Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HelpCircle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
              {quiz.title}
            </h3>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Passing Threshold: <strong>{quiz.passing_threshold_percent || 70}%</strong> • {quiz.questions.length} Questions
            </div>
          </div>
        </div>

        {result && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: result.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: result.passed ? '#10b981' : '#ef4444',
              border: `1px solid ${result.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {result.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>
              Score: {result.score} / {result.totalQuestions} ({result.scorePercent}%) — {result.passed ? 'PASSED' : 'TRY AGAIN'}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {quiz.questions.map((q, qIndex) => {
            const questionResult = result?.breakdown?.find((b) => b.questionId === q.id);
            const isCorrect = questionResult?.isCorrect;

            return (
              <div
                key={q.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${
                    questionResult
                      ? isCorrect
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                      : 'var(--border-subtle)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.975rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{qIndex + 1}.</span>
                    {q.question_text}
                  </div>
                  {questionResult && (
                    <div style={{ flexShrink: 0 }}>
                      {isCorrect ? (
                        <CheckCircle2 size={20} color="#10b981" />
                      ) : (
                        <XCircle size={20} color="#ef4444" />
                      )}
                    </div>
                  )}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = q[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null;

                    const isSelected = answers[q.id] === optKey;
                    const isOfficialCorrect = questionResult?.correctOption === optKey;
                    let optionBg = 'rgba(255, 255, 255, 0.03)';
                    let optionBorder = 'var(--border-subtle)';

                    if (result) {
                      if (isOfficialCorrect) {
                        optionBg = 'rgba(16, 185, 129, 0.15)';
                        optionBorder = 'rgba(16, 185, 129, 0.5)';
                      } else if (isSelected && !isCorrect) {
                        optionBg = 'rgba(239, 68, 68, 0.15)';
                        optionBorder = 'rgba(239, 68, 68, 0.5)';
                      }
                    } else if (isSelected) {
                      optionBg = 'rgba(99, 102, 241, 0.15)';
                      optionBorder = 'var(--primary)';
                    }

                    return (
                      <label
                        key={optKey}
                        onClick={() => handleSelectOption(q.id, optKey)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          background: optionBg,
                          border: `1px solid ${optionBorder}`,
                          cursor: result ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          value={optKey}
                          checked={isSelected}
                          onChange={() => handleSelectOption(q.id, optKey)}
                          disabled={Boolean(result)}
                          style={{ accentColor: 'var(--primary)', cursor: result ? 'default' : 'pointer' }}
                        />
                        <span style={{ fontWeight: 700, minWidth: '20px', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {optKey}.
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', flex: 1 }}>
                          {optText}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Explanation on submission */}
                {questionResult && questionResult.explanation && (
                  <div
                    style={{
                      marginTop: '0.9rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      borderLeft: `3px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                    }}
                  >
                    <strong>Explanation:</strong> {questionResult.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit or Retake Footer */}
        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          {result ? (
            <button
              type="button"
              onClick={handleRetake}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RotateCcw size={16} />
              <span>Retake Quiz</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-glow"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.75rem' }}
            >
              <span>{submitting ? 'Submitting...' : 'Submit Answers'}</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

