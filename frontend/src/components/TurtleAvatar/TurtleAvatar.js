import React from 'react';
import './TurtleAvatar.css';

const TURTLE_MOODS = {
  happy: {
    color: '#4CAF50',
    face: '😊',
    message: 'Great job! Your health metrics look excellent!',
  },
  neutral: {
    color: '#2196F3',
    face: '😐',
    message: 'Keep going! Your health is stable.',
  },
  worried: {
    color: '#FF9800',
    face: '😟',
    message: 'Take it easy! Your stress levels are elevated.',
  },
  stressed: {
    color: '#F44336',
    face: '😰',
    message: 'Please rest! Your stress is high.',
  },
};

const QA_DATABASE = [
  {
    question: 'How much water should I drink?',
    answer: (metrics) =>
      `Based on your activity (${metrics?.steps || 'N/A'} steps), aim for 2-3 liters of water daily.`,
  },
  {
    question: 'Why is my heart rate high?',
    answer: (metrics) =>
      `Your current heart rate is ${metrics?.heartRate || 'N/A'} bpm. High heart rate can be caused by stress, exercise, or caffeine. If it persists, consult a doctor.`,
  },
  {
    question: 'How to lower stress?',
    answer: (metrics) => {
      const stress = metrics?.stressScore || 50;
      if (stress < 30)
        return 'Your stress is low! Keep up the good work with regular breaks and exercise.';
      if (stress < 60)
        return 'Try deep breathing exercises, take short walks, and ensure 7-8 hours of sleep.';
      return 'Your stress is high. Consider meditation, yoga, or speaking with a healthcare provider.';
    },
  },
];

function TurtleAvatar({ stressScore, metrics, className }) {
  const [selectedQuestion, setSelectedQuestion] = React.useState(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Determine mood based on stress score
  const getMood = () => {
    if (stressScore < 30) return TURTLE_MOODS.happy;
    if (stressScore < 50) return TURTLE_MOODS.neutral;
    if (stressScore < 70) return TURTLE_MOODS.worried;
    return TURTLE_MOODS.stressed;
  };

  const mood = getMood();

  const handleQuestionClick = (qa) => {
    setIsAnimating(true);
    setSelectedQuestion(qa);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className={`turtle-avatar-container ${className || ''}`}>
      <div
        className={`turtle-avatar ${isAnimating ? 'turtle-bounce' : ''}`}
        style={{ borderColor: mood.color }}
      >
        <div className="turtle-shell">
          <svg viewBox="0 0 120 120" className="turtle-svg">
            {/* Turtle shell - hexagonal pattern like emoji */}
            <ellipse cx="60" cy="65" rx="40" ry="35" fill="#6B8E23" />
            
            {/* Shell pattern - hexagons */}
            <polygon points="60,45 70,50 70,60 60,65 50,60 50,50" fill="#556B2F" opacity="0.8" />
            <polygon points="45,55 55,50 55,60 45,65 35,60 35,55" fill="#556B2F" opacity="0.6" />
            <polygon points="75,55 85,50 85,60 75,65 65,60 65,55" fill="#556B2F" opacity="0.6" />
            <polygon points="45,70 55,65 55,75 45,80 35,75 35,70" fill="#556B2F" opacity="0.6" />
            <polygon points="75,70 85,65 85,75 75,80 65,75 65,70" fill="#556B2F" opacity="0.6" />
            
            {/* Shell rim */}
            <ellipse cx="60" cy="65" rx="40" ry="35" fill="none" stroke="#4A5D23" strokeWidth="2" />

            {/* Head - rounded like emoji */}
            <ellipse cx="60" cy="35" rx="14" ry="12" fill="#8FBC8F" />
            <circle cx="56" cy="33" r="2.5" fill="#000" />
            <circle cx="64" cy="33" r="2.5" fill="#000" />
            <ellipse cx="60" cy="38" rx="3" ry="1.5" fill="#000" opacity="0.6" />

            {/* Front legs */}
            <ellipse cx="40" cy="60" rx="8" ry="6" fill="#8FBC8F" transform="rotate(-20 40 60)" />
            <ellipse cx="80" cy="60" rx="8" ry="6" fill="#8FBC8F" transform="rotate(20 80 60)" />

            {/* Back legs */}
            <ellipse cx="35" cy="85" rx="9" ry="6" fill="#8FBC8F" transform="rotate(-30 35 85)" />
            <ellipse cx="85" cy="85" rx="9" ry="6" fill="#8FBC8F" transform="rotate(30 85 85)" />

            {/* Tail */}
            <ellipse cx="60" cy="98" rx="4" ry="6" fill="#8FBC8F" />
          </svg>
        </div>
        <div className="turtle-mood-indicator" style={{ color: mood.color, fontSize: '1.5rem', textAlign: 'center', marginTop: '0.5rem' }}>
          {mood.face}
        </div>
      </div>

      <div className="turtle-message" style={{ color: mood.color }}>
        {selectedQuestion ? selectedQuestion.answer(metrics) : mood.message}
      </div>

      <div className="turtle-qa">
        <div className="qa-label">Ask me:</div>
        {QA_DATABASE.map((qa, index) => (
          <button
            key={index}
            className="qa-button"
            onClick={() => handleQuestionClick(qa)}
            style={{ borderColor: mood.color }}
            aria-label={qa.question}
          >
            {qa.question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TurtleAvatar;
