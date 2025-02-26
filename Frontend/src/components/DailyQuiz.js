import React, { useState, useEffect } from "react";
import axios from "axios";

const DailyQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/quiz`
        );
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Daily Football Quiz</h1>
      {showScore ? (
        <div className="text-center">
          <p className="text-xl">
            You scored {score} out of {questions.length}
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <span className="text-lg">
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <p className="text-xl">
              {questions[currentQuestionIndex].questionText}
            </p>
          </div>
          <div>
            {questions[currentQuestionIndex].answerOptions.map(
              (answerOption, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleAnswerOptionClick(answerOption.isCorrect)
                  }
                  className="bg-blue-500 text-white p-2 rounded-lg m-2"
                >
                  {answerOption.answerText}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyQuiz;
