import React, { useState, useMemo } from "react";
import "./TurtleAvatar.css";

function TurtleAvatar({ stressScore = 0, metrics = {}, className = "" }) {
  console.log("Stress score is:", stressScore);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userInput, setUserInput] = useState("");

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

  // ==========================
  // PERSONALIZED RECOMMENDATIONS
  // ==========================
  const generateWaterResponse = () => {
    const stepsNum = Number(steps) || 0;
    const activityLevel = stepsNum > 10000 ? "high" : stepsNum > 5000 ? "moderate" : "low";
    
    const responses = {
      high: [
        `With ${stepsNum} steps, you're very active! Drink 3-4 liters of water today. 💧`,
        `${stepsNum} steps is awesome! Stay hydrated with 3.5 liters of water. 🏃`,
        `You're crushing it with ${stepsNum} steps! Keep hydrated—3-4 liters needed. 💪`,
      ],
      moderate: [
        `${stepsNum} steps—nice! Aim for 2.5-3 liters of water today. 💧`,
        `Good activity level at ${stepsNum} steps. Drink about 2.5 liters to stay hydrated.`,
        `You're doing well with ${stepsNum} steps. Keep yourself hydrated with 2-3 liters. 💚`,
      ],
      low: [
        `${stepsNum} steps today. Drink at least 2 liters of water and move more! 🐢`,
        `You're at ${stepsNum} steps. Stay hydrated with 2 liters and try to move around.`,
        `${stepsNum} steps is a start! Drink water and consider a short walk. 🚶`,
      ],
    };
    
    const responseArray = responses[activityLevel];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const generateHeartRateResponse = () => {
    const hr = Number(heartRate) || 0;
    
    if (hr > 120) {
      const responses = [
        `Your heart rate is ${hr} bpm—slow down! Rest, breathe deeply, and drink water. 🧘`,
        `${hr} bpm is high. Take a break and try some deep breathing exercises.`,
        `Your heart is racing at ${hr} bpm. Relax and practice calm breathing. You're okay! 💚`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (hr > 100) {
      const responses = [
        `${hr} bpm is a bit elevated. You might be stressed. Take a few deep breaths.`,
        `Your heart rate is ${hr} bpm. Try some relaxation—you're likely stressed or caffeinated.`,
        `${hr} bpm is slightly high. Wind down and give yourself a break. 💨`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (hr > 80) {
      const responses = [
        `${hr} bpm is normal and healthy! You're doing great. 💓`,
        `Your heart rate is ${hr} bpm—nice and normal. Keep it up!`,
        `${hr} bpm is perfect. Your heart is happy! 💚`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        `${hr} bpm—wow! You're super calm and relaxed. Keep it up! 🧘`,
        `Your heart rate is ${hr} bpm. You're in a very peaceful state. Amazing! ✨`,
        `${hr} bpm is beautifully calm. You're doing perfectly well! 🌟`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const generateStressResponse = () => {
    const stressNum = Number(stressScore) || 0;
    
    if (stressNum < 30) {
      const responses = [
        `Stress at ${stressNum}—you're crushing it! Stay calm and keep it up! 🌟`,
        `${stressNum} stress score is amazing! You're thriving. 💪`,
        `You're at ${stressNum}—phenomenal! Keep maintaining this peace. ✨`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (stressNum < 60) {
      const responses = [
        `${stressNum} is moderate and manageable. Try some meditation to lower it more. 🧘`,
        `Stress at ${stressNum}—you're handling it well. Keep being steady! 💚`,
        `You're at ${stressNum}. Try breathing exercises to bring it down even lower.`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (stressNum < 80) {
      const responses = [
        `${stressNum} is elevated. Take a walk, stretch, and breathe deeply. 🚶`,
        `Stress at ${stressNum}—time to relax! Try yoga or stepping outside. 🧘`,
        `You're carrying tension at ${stressNum}. Self-care time! Take a break. 💆`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        `${stressNum} is critical. Breathe deeply, walk outside, and reach out to someone. 🐢❤️`,
        `Stress at ${stressNum}—please destress now. Meditate or talk to a friend.`,
        `${stressNum} is too high. Take action now—breathe, move, and get support. You matter! 💚`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  // ==========================
  // DAILY SUMMARY
  // ==========================
  const generateDailySummary = () => {
    const stressNum = Number(stressScore) || 0;
    const hrNum = Number(heartRate) || 0;
    const stepsNum = Number(steps) || 0;
    
    let stressStatus = "Good 🌟";
    if (stressNum > 80) stressStatus = "High 🔴";
    else if (stressNum > 60) stressStatus = "Moderate 🟡";
    else if (stressNum < 30) stressStatus = "Excellent 🟢";

    let hrStatus = "Normal 💚";
    if (hrNum > 120) hrStatus = "High ⚠️";
    else if (hrNum > 100) hrStatus = "Elevated 🟡";
    else if (hrNum < 60) hrStatus = "Low 💙";

    let stepsStatus = "Good 👟";
    if (stepsNum < 3000) stepsStatus = "Low 📉";
    else if (stepsNum < 7000) stepsStatus = "Fair 📊";
    else if (stepsNum >= 10000) stepsStatus = "Excellent 🎯";

    return `📊 Today's Summary: Stress: ${stressStatus} | Heart: ${hrStatus} | Steps: ${stepsNum} (${stepsStatus})`;
  };

  // ==========================
  // MONTHLY SUMMARY
  // ==========================
  const generateMonthlySummary = () => {
    const stressNum = Number(stressScore) || 0;
    const stepsNum = Number(steps) || 0;
    
    const predictedMonthlySteps = Math.round(stepsNum * 30);
    const avgStress = stressNum; // Current as baseline
    
    let trend = "Keep going! 💪";
    if (stressNum < 40) trend = "Amazing month ahead! 🌟";
    else if (stressNum > 70) trend = "Focus on relaxation this month. 🧘";

    return `📈 Monthly Outlook: Avg Stress ~${avgStress} | Est. Steps: ${predictedMonthlySteps.toLocaleString()} | ${trend}`;
  };

  // ==========================
  // INTELLIGENT QUESTION HANDLER
  // ==========================
  const generateSmartResponse = (question) => {
    const lowerQ = question.toLowerCase();
    
    // Daily Summary
    if (lowerQ.match(/daily|today|summary|stats|overview|today'?s/)) {
      if (lowerQ.match(/monthly|month|30 days/)) {
        return generateMonthlySummary();
      }
      return generateDailySummary();
    }
    
    // Monthly Summary
    if (lowerQ.match(/monthly|month|30 days|this month|progress|month'?s/)) {
      return generateMonthlySummary();
    }
    
    // Water/Hydration related
    if (lowerQ.match(/water|hydrat|drink|thirst|quench|fluid/)) {
      return generateWaterResponse();
    }
    
    // Heart rate related
    if (lowerQ.match(/heart|pulse|bpm|cardio|heartbeat|racing|pounding/)) {
      return generateHeartRateResponse();
    }
    
    // Stress related
    if (lowerQ.match(/stress|anxious|tense|worry|nervous|calm|relax|peace|uptight|pressure/)) {
      return generateStressResponse();
    }
    
    // Sleep/Tiredness related
    if (lowerQ.match(/sleep|rest|tired|fatigue|insomnia|nap|wake|sleepy|exhausted|doze|snooze/)) {
      const responses = [
        `Aim for 7-9 hours of sleep. Keep your room cool and dark, and avoid screens 30 minutes before bed! 😴`,
        `Trouble sleeping? Try meditation, a warm bath, or some light stretching before bed.`,
        `Your sleep schedule matters. Go to bed at the same time each night to help your body relax. 🛌`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Exercise/Activity/Movement related
    if (lowerQ.match(/exercise|workout|active|activity|fitness|walk|run|gym|train|sport|move|movement/)) {
      const stepsNum = Number(steps) || 0;
      const responses = [
        `Great! You're at ${stepsNum} steps. Aim for 10,000 daily. Even a 15-minute walk helps! 🏃`,
        `Exercise for 30 minutes today. It'll boost your mood and lower stress. You can do it! 💪`,
        `Try walking, dancing, yoga, or any activity you enjoy. The best exercise is the one you'll actually do! 🚶`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Food/Nutrition/Eating related
    if (lowerQ.match(/food|eat|nutrition|diet|hungry|snack|meal|healthy|appetite|starving|breakfast|lunch|dinner/)) {
      const responses = [
        `Eat balanced meals with fruits, veggies, protein, and whole grains. Avoid too much sugar and caffeine. 🥗`,
        `Eat when you're hungry, stop when you're full. And eat mindfully—put your phone away! 🍎`,
        `Stay away from processed foods. Fresh, whole foods will give you better energy and mood. 🥕`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Headaches/Pain
    if (lowerQ.match(/headache|head pain|migraine|ache|hurt|pain|sore|throbbing/)) {
      const responses = [
        `Drink water, rest in a quiet dark room, and try some deep breathing. If it persists, see a doctor. 💧`,
        `Headaches often come from dehydration or stress. Hydrate and take a short break! 🧘`,
        `Try a cold compress or massage your temples. Relax and let your body recover.`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Energy/Fatigue/Low mood
    if (lowerQ.match(/energy|tired|low|fatigue|sluggish|unmotivated|sad|depressed|down|blue|lethargic|drained/)) {
      const responses = [
        `Low energy? Try moving your body, drink water, and get outside for some sunlight! ☀️`,
        `Eat something nutritious and take a short walk. Movement and fresh air boost energy. 🚶`,
        `Make sure you're sleeping enough. Poor sleep kills energy. Get those 8 hours! 😴`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Breathing exercises/Anxiety/Panic
    if (lowerQ.match(/breath|breathing|anxiety|panic|overwhelm|overwhelmed|freaking|shortness|hyperventil/)) {
      const responses = [
        `Box breathing: In for 4, hold 4, out for 4, hold 4. Repeat 5 times. You'll feel calm! 🧘`,
        `Slow, deep breaths through your nose. Count to 4 on the way in, 6 on the way out. 💨`,
        `Breathe slowly and bring your awareness to your body. You're safe. It will pass. ✨`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Meditation/Mindfulness
    if (lowerQ.match(/meditat|mindful|focus|concentrat|mental|mental health|mind|clear|clarity/)) {
      const responses = [
        `Start with 5 minutes daily. Sit quietly, focus on your breath. Let thoughts pass without judgment. 🧘‍♀️`,
        `Try a body scan—focus on each body part from head to toe. Super grounding! 🌿`,
        `Even 3 minutes of mindfulness helps. You'll feel clearer and calmer afterward. 🕉️`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Mood/Happiness
    if (lowerQ.match(/mood|happy|sad|upset|irritable|grumpy|cranky|annoyed|frustrated/)) {
      const responses = [
        `Move your body—exercise is a mood booster! Even 10 minutes of walking helps. 🏃`,
        `Spend time with people you love. Connection is powerful for your mood. 💚`,
        `Your mood improves with sleep, exercise, and sunlight. Do one of these now! ☀️`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Motivation/Encouragement
    if (lowerQ.match(/motivat|encour|support|struggling|difficult|hard|can't|cannot|help me|advice|tips/)) {
      const responses = [
        `You've got this! Small steps every day add up. Be proud of yourself! 💪`,
        `Take it one day at a time. Some days are harder—that's normal. Keep going! 🌟`,
        `You're doing great by checking in with me. Self-care is the first step! 💚`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // General wellness/How are you
    if (lowerQ.match(/how.*feel|feeling|doing|health|well|okay|status|best|worst|metrics|measurement/)) {
      const stressNum = Number(stressScore) || 0;
      const hrNum = Number(heartRate) || 0;
      
      let assessment = "";
      if (stressNum < 30 && hrNum < 100) {
        assessment = "You're doing amazing! Stress is low and heart rate is steady. Keep it up! 🌟";
      } else if (stressNum < 60 && hrNum < 100) {
        assessment = "You're managing well! Everything looks balanced. Maybe take it easy today. 💚";
      } else if (stressNum < 80) {
        assessment = "You're a bit stressed. Try some breathing exercises or a walk to relax. 🧘";
      } else {
        assessment = "Your stress is high. Take a break now and do something calming for yourself. 🐢❤️";
      }
      
      return assessment;
    }

    // Posture/Body/Physical complaints
    if (lowerQ.match(/posture|back|neck|shoulder|sore|stiff|tension|ache|stretch|flexibility|sore muscles/)) {
      const responses = [
        `Stretch regularly! Try yoga or simple shoulder rolls. Fix your sitting posture too. 🧘`,
        `Tension? Do some light stretching and massage the sore area. Heat can help too! 🔥`,
        `Move around every hour. Sitting too long hurts your body. Stand up and stretch! 🚶`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Anxiety/Worry/Mental wellness
    if (lowerQ.match(/worry|anxious|nervous|tension|stress|fear|concerned|scared|worried|apprehensive/)) {
      const responses = [
        `What you're feeling is valid. Practice deep breathing and remind yourself: this will pass. 💚`,
        `Anxiety feeds on isolation. Talk to someone you trust or call a friend. 📞`,
        `Channel that energy into action or exercise. Moving your body helps process worry. 💪`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Focus/Concentration/Brain fog
    if (lowerQ.match(/focus|concentrat|brain fog|can't think|forgetful|confused|scatter|distract/)) {
      const responses = [
        `Hydrate and take a 10-minute walk. Brain fog often comes from dehydration. 💧`,
        `Turn off notifications and work in 25-minute blocks. Your focus will improve quickly! ⏱️`,
        `Eat a balanced snack and get some fresh air. Your brain needs oxygen and fuel! 🧠`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Hope/Future/Goals
    if (lowerQ.match(/hope|future|goal|dream|hope|better|improve|change|transform|habit/)) {
      const responses = [
        `Every day is a fresh start! Set one small health goal for today and crush it! 🎯`,
        `Change happens slowly. Be patient with yourself. You're already doing better by caring! 🌱`,
        `Build habits one at a time. Start with one healthy behavior this week. You've got this! 💪`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Sickness/Illness/Feeling unwell
    if (lowerQ.match(/sick|ill|cold|flu|fever|cough|sneeze|nausea|vomit|unwell|virus|ache|chills/)) {
      const responses = [
        `Rest, hydrate, and eat nutritious food. If it gets worse, see a doctor. Get well soon! 🏥`,
        `Sleep is your best medicine right now. Give your body time to recover. 😴`,
        `Drink lots of water and warm tea. Stay warm and avoid spreading it to others! 🍵`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Caffeine/Substances
    if (lowerQ.match(/caffeine|coffee|energy drink|tea|soda|sugar|alcohol|cigarette|nicotine/)) {
      const responses = [
        `Limit caffeine after 2pm—it messes with sleep! Drink water instead for sustained energy. 💧`,
        `Too much sugar causes energy crashes. Stick to whole foods for stable energy. 🥗`,
        `Cut back gradually if you're on too much caffeine. Your body will thank you! ☕`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Default response for anything else
    const defaultResponses = [
      `I'm here to help with your health! Ask about stress, exercise, sleep, nutrition, energy, or how you're feeling. What's on your mind? 💚`,
      `Great question! Tell me more about your health and I'll do my best to help you out. 🐢`,
      `I'm your wellness buddy! Ask me anything about feeling better. What can I help with today? 💪`,
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendQuestion = () => {
    if (!userInput.trim()) return;
    
    const response = generateSmartResponse(userInput);
    setSelectedAnswer(response);
    setUserInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendQuestion();
    }
  };

  return (
    <div className={`turtle-avatar-container ${className}`}>
      {selectedAnswer && (
        <div className="turtle-response-bubble">
          {selectedAnswer}
        </div>
      )}
      
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
        {!selectedAnswer && mood.message}
      </div>

      <div className="turtle-input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          className="turtle-input"
        />
        <button onClick={handleSendQuestion} className="turtle-send-btn">
          Send
        </button>
      </div>
    </div>
  );
}

export default TurtleAvatar;