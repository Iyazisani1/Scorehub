import { useState } from "react";

const questions = [
  {
    question: "Who won the FIFA World Cup 2018?",
    options: ["Germany", "Brazil", "France", "Argentina"],
    answer: "France",
  },
  {
    question: "Which player has won the most Ballon d'Or awards?",
    options: ["Cristiano Ronaldo", "Lionel Messi", "Pele", "Maradona"],
    answer: "Lionel Messi",
  },
  {
    question: "Which club has won the most UEFA Champions League titles?",
    options: ["Liverpool", "Real Madrid", "Bayern Munich", "Barcelona"],
    answer: "Real Madrid",
  },
  {
    question: "Who holds the record for most goals in a calendar year?",
    options: [
      "Cristiano Ronaldo",
      "Lionel Messi",
      "Robert Lewandowski",
      "Gerd Muller",
    ],
    answer: "Lionel Messi",
  },
  {
    question: "Which country hosted the first FIFA World Cup?",
    options: ["Brazil", "Uruguay", "Italy", "Germany"],
    answer: "Uruguay",
  },
  {
    question: "Which club did Cristiano Ronaldo join in 2021?",
    options: ["Manchester United", "Juventus", "Real Madrid", "PSG"],
    answer: "Manchester United",
  },
  {
    question: "Who is known as the 'King of Football'?",
    options: ["Diego Maradona", "Pele", "Johan Cruyff", "Zinedine Zidane"],
    answer: "Pele",
  },
  {
    question: "Which team won the Premier League in 2020?",
    options: ["Manchester City", "Chelsea", "Liverpool", "Arsenal"],
    answer: "Liverpool",
  },
  {
    question: "Who scored the infamous 'Hand of God' goal?",
    options: ["Pele", "Diego Maradona", "Zico", "Ronaldinho"],
    answer: "Diego Maradona",
  },
  {
    question:
      "What is the maximum number of substitutions allowed in a football match?",
    options: ["3", "5", "4", "6"],
    answer: "5",
  },
];

export default function FootballQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswer = (selectedOption) => {
    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-md text-center">
        {showScore ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Your Score: {score} / {questions.length}
            </h2>
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setScore(0);
                setShowScore(false);
              }}
              className="bg-blue-500 px-4 py-2 rounded-lg mt-4 hover:bg-blue-700"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {questions[currentQuestion].question}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-800"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
