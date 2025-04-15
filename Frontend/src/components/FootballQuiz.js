import { useState, useEffect, useCallback } from "react";
import { Trophy, Timer, Award, RotateCcw, ChevronRight } from "lucide-react";

const questions = [
  {
    question: "Who won the FIFA World Cup 2022?",
    options: ["France", "Brazil", "Argentina", "Croatia"],
    answer: "Argentina",
    explanation:
      "Argentina won the 2022 FIFA World Cup, defeating France in the final on penalties.",
  },
  {
    question: "Which player has won the most Ballon d'Or awards?",
    options: [
      "Cristiano Ronaldo",
      "Lionel Messi",
      "Michel Platini",
      "Johan Cruyff",
    ],
    answer: "Lionel Messi",
    explanation:
      "Lionel Messi has won the Ballon d'Or a record 8 times (2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023).",
  },
  {
    question: "Which club has won the most UEFA Champions League titles?",
    options: ["Liverpool", "Real Madrid", "Bayern Munich", "AC Milan"],
    answer: "Real Madrid",
    explanation:
      "Real Madrid has won the UEFA Champions League/European Cup 14 times, more than any other club.",
  },
  {
    question: "Who is the all-time top scorer in FIFA World Cup history?",
    options: ["Miroslav Klose", "Ronaldo Nazário", "Pelé", "Just Fontaine"],
    answer: "Miroslav Klose",
    explanation:
      "Miroslav Klose holds the record with 16 World Cup goals across four tournaments (2002-2014).",
  },
  {
    question: "Which country hosted the first FIFA World Cup?",
    options: ["Brazil", "Uruguay", "Italy", "France"],
    answer: "Uruguay",
    explanation: "Uruguay hosted and won the first FIFA World Cup in 1930.",
  },
  {
    question:
      "Who holds the record for most goals in a single Premier League season (38 games)?",
    options: ["Mohamed Salah", "Alan Shearer", "Erling Haaland", "Harry Kane"],
    answer: "Erling Haaland",
    explanation:
      "Erling Haaland scored 36 goals in the 2022-23 Premier League season, breaking the previous record.",
  },
  {
    question: "Which team was the first to win the Premier League?",
    options: ["Manchester United", "Liverpool", "Arsenal", "Blackburn Rovers"],
    answer: "Manchester United",
    explanation:
      "Manchester United won the first Premier League title in the 1992-93 season.",
  },
  {
    question: "Who scored the famous 'Hand of God' goal?",
    options: ["Pelé", "Diego Maradona", "Michel Platini", "Johan Cruyff"],
    answer: "Diego Maradona",
    explanation:
      "Diego Maradona scored the controversial 'Hand of God' goal against England in the 1986 World Cup quarter-final.",
  },
  {
    question: "Which player has made the most Premier League appearances?",
    options: ["Ryan Giggs", "Gareth Barry", "Frank Lampard", "James Milner"],
    answer: "Gareth Barry",
    explanation:
      "Gareth Barry holds the record with 653 Premier League appearances.",
  },
  {
    question:
      "Which team went unbeaten for an entire Premier League season in 2003-04?",
    options: ["Manchester United", "Chelsea", "Arsenal", "Liverpool"],
    answer: "Arsenal",
    explanation:
      "Arsenal's 'Invincibles' went unbeaten for all 38 games in the 2003-04 season.",
  },
];

export default function FootballQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const handleAnswer = useCallback(
    (selectedOption) => {
      setIsTimerRunning(false);
      setSelectedAnswer(selectedOption);
      setShowExplanation(true);

      if (selectedOption === questions[currentQuestion].answer) {
        setScore(score + 1);
        setStreak(streak + 1);
        setBestStreak(Math.max(bestStreak, streak + 1));
      } else {
        setStreak(0);
      }
    },
    [currentQuestion, score, streak, bestStreak]
  );

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0 && !showExplanation) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !showExplanation) {
      handleAnswer(null);
    }
    return () => clearInterval(interval);
  }, [timer, isTimerRunning, showExplanation, handleAnswer]);

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setTimer(30);
    setIsTimerRunning(true);

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimer(30);
    setIsTimerRunning(true);
    setStreak(0);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect! You're a football expert! 🏆";
    if (percentage >= 80) return "Excellent! You really know your football! 🌟";
    if (percentage >= 60)
      return "Good job! You've got solid football knowledge! 👏";
    if (percentage >= 40) return "Not bad! Keep learning about football! 📚";
    return "Keep practicing! The beautiful game has so much to teach! ⚽";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-xl">
        {showScore ? (
          <div className="text-center space-y-6">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <div className="space-y-2">
              <p className="text-2xl">
                Your Score: {score} / {questions.length}
              </p>
              <p className="text-lg text-gray-300">
                ({Math.round((score / questions.length) * 100)}%)
              </p>
              <p className="text-yellow-400 mt-4">{getScoreMessage()}</p>
            </div>
            <div className="flex justify-center space-x-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-400">Best Streak</p>
                <p className="text-xl font-bold text-yellow-400">
                  {bestStreak}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Questions</p>
                <p className="text-xl font-bold text-blue-400">
                  {questions.length}
                </p>
              </div>
            </div>
            <button
              onClick={restartQuiz}
              className="mt-6 bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-lg">
                  Score: {score}/{currentQuestion}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-blue-400" />
                <span
                  className={`text-lg ${
                    timer <= 5 ? "text-red-500" : "text-gray-300"
                  }`}
                >
                  {timer}s
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-400" />
                <span className="text-lg">Streak: {streak}</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-full bg-gray-700 h-2 rounded-full mb-6">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      ((currentQuestion + 1) / questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <h2 className="text-xl font-semibold mb-6">
                {currentQuestion + 1}. {questions[currentQuestion].question}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestion].options.map((option) => {
                  let buttonClass =
                    "text-left px-6 py-4 rounded-lg transition-all duration-200 ";
                  if (!showExplanation) {
                    buttonClass += "bg-gray-700 hover:bg-gray-600";
                  } else {
                    if (option === questions[currentQuestion].answer) {
                      buttonClass += "bg-green-600";
                    } else if (option === selectedAnswer) {
                      buttonClass += "bg-red-600";
                    } else {
                      buttonClass += "bg-gray-700 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => !showExplanation && handleAnswer(option)}
                      className={buttonClass}
                      disabled={showExplanation}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {showExplanation && (
              <div className="mt-6 space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300">
                    {questions[currentQuestion].explanation}
                  </p>
                </div>
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>
                    {currentQuestion === questions.length - 1
                      ? "Show Results"
                      : "Next Question"}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
