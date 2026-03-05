import React, { useState, useMemo } from "react";
import "./TurtleAvatar.css";

function TurtleAvatar({ stressScore = 0, metrics = {}, className = "" }) {
  console.log("Stress score is:", stressScore);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const heartRate = metrics?.heartRate;
  const steps = metrics?.steps;

  // ==========================
  // MOOD LOGIC
  // ==========================
  const mood = useMemo(() => {
    if (heartRate > 120) {
      return {
        color: "#ff1744",
        message: "Whoa! Your heart rate is very high. Slow down.",
        level: "danger",
      };
    }

    if (heartRate > 100) {
      return {
        color: "#ff9800",
        message: "Your heart rate is elevated.",
        level: "alert",
      };
    }

    if (stressScore < 30) {
      return {
        color: "#4CAF50",
        message: "You're calm and thriving.",
        level: "happy",
      };
    }

    if (stressScore < 60) {
      return {
        color: "#2196F3",
        message: "You're steady and balanced.",
        level: "neutral",
      };
    }

    if (stressScore < 80) {
      return {
        color: "#FF9800",
        message: "You're feeling tense.",
        level: "stressed",
      };
    }

    return {
      color: "#F44336",
      message: "Take a deep breath.",
      level: "danger",
    };
  }, [stressScore, heartRate]);


  // ==========================
  // DYNAMIC MOUTH CURVE
  // ==========================
 let mouthCurve;

if (mood.level === "happy") {
  mouthCurve = 88;   // smile
} else if (mood.level === "neutral") {
  mouthCurve = 78;   // flat
} else if (mood.level === "stressed") {
  mouthCurve = 72;   // slight frown
} else if (mood.level === "danger") {
  mouthCurve = 65;   // deeper frown
} else {
  mouthCurve = 78;
}

  const handleWaterQuestion = () => {
    setSelectedAnswer(
      `Based on ${steps || "N/A"} steps, aim for 2-3L of water today.`
    );
  };

  const handleHeartRateQuestion = () => {
    setSelectedAnswer(
      `Heart rate: ${heartRate || "N/A"} bpm. High values can be caused by stress, exercise or caffeine.`
    );
  };

  const handleStressQuestion = () => {
    setSelectedAnswer(
      `Stress score: ${stressScore}. Try breathing exercises and short walks.`
    );
  };

  return (
    <div className={`turtle-avatar-container ${className}`}>
      <button
        className={`turtle-avatar ${mood.level}`}
        style={{
          borderColor: mood.color,
          boxShadow: `
            0 0 20px ${mood.color},
            0 0 40px ${mood.color}66,
            0 0 60px ${mood.color}33
          `,
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        <svg viewBox="0 0 200 200" width="210" height="210">

          {/* Shell (ALWAYS GREEN) */}
          <ellipse
            cx="100"
            cy="115"
            rx="65"
            ry="60"
            fill="#4CAF50"
            stroke="#2e7d32"
            strokeWidth="4"
          />

          {/* Shell pattern */}
          <circle cx="100" cy="115" r="25" fill="rgba(0,0,0,0.1)" />
          <circle cx="75" cy="95" r="15" fill="rgba(0,0,0,0.1)" />
          <circle cx="125" cy="95" r="15" fill="rgba(0,0,0,0.1)" />
          <circle cx="75" cy="135" r="15" fill="rgba(0,0,0,0.1)" />
          <circle cx="125" cy="135" r="15" fill="rgba(0,0,0,0.1)" />

          {/* Head */}
          <circle cx="100" cy="55" r="26" fill="#A5D6A7" />

          {/* Eyes */}
          {mood.level === "danger" ? (
            <>
              <line x1="85" y1="55" x2="95" y2="50" stroke="black" strokeWidth="3" />
              <line x1="105" y1="50" x2="115" y2="55" stroke="black" strokeWidth="3" />
            </>
          ) : (
            <>
              <circle cx="90" cy="50" r="6" fill="black" className="blink" />
              <circle cx="110" cy="50" r="6" fill="black" className="blink" />
            </>
          )}

          {/* Mouth */}
          <path
            d={`M92 78 Q100 ${mouthCurve} 108 78`}
            stroke="black"
            strokeWidth="3"
            fill="transparent"
            className="mouth"
          />

          {/* Legs */}
          <ellipse cx="50" cy="110" rx="20" ry="14" fill="#A5D6A7" />
          <ellipse cx="150" cy="110" rx="20" ry="14" fill="#A5D6A7" />
          <ellipse cx="75" cy="170" rx="18" ry="12" fill="#A5D6A7" />
          <ellipse cx="125" cy="170" rx="18" ry="12" fill="#A5D6A7" />

          {/* Tail */}
          <polygon points="100,180 94,195 106,195" fill="#A5D6A7" />

          {/* Sweat */}
          {mood.level === "danger" && (
            <ellipse
              cx="130"
              cy="40"
              rx="6"
              ry="10"
              fill="#4FC3F7"
              className="sweat"
            />
          )}

          {/* Sparkles */}
          {mood.level === "happy" && (
            <>
              <circle cx="40" cy="40" r="4" fill="#FFD700" className="sparkle" />
              <circle cx="165" cy="60" r="3" fill="#FFD700" className="sparkle delay" />
            </>
          )}

          {/* Heartbeat */}
          {mood.level === "alert" && (
            <polyline
              points="60,20 75,20 85,10 95,30 105,15 115,20 140,20"
              fill="none"
              stroke="white"
              strokeWidth="3"
              className="heartbeat"
            />
          )}
        </svg>
      </button>

      <div className="turtle-message" style={{ color: mood.color }}>
        {selectedAnswer || mood.message}
      </div>

      {isDialogOpen && (
        <div className="turtle-dialog">
          <button
            onClick={() => {
              setIsDialogOpen(false);
              setSelectedAnswer("");
            }}
          >
            Close
          </button>
          <button onClick={handleWaterQuestion}>Water intake?</button>
          <button onClick={handleHeartRateQuestion}>Heart rate?</button>
          <button onClick={handleStressQuestion}>Lower stress?</button>
        </div>
      )}
    </div>
  );
}

export default TurtleAvatar;