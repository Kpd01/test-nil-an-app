"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGamification } from "@/hooks/use-gamification"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap } from "lucide-react"
import { useUserSession } from "@/hooks/use-user-session"
import { UserHeader } from "@/components/user-header"
import { QuizLeaderboardManager } from "@/lib/quiz-leaderboard"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  basePoints: number
  timeLimit: number
}

const nilanQuestions: Question[] = [
  {
    id: 1,
    question: "When was Nilan born?",
    options: ["June 10, 2024", "June 12, 2024", "June 15, 2024"],
    correctAnswer: 1,
    basePoints: 150,
    timeLimit: 8,
  },
  {
    id: 2,
    question: "What was Nilan's birth weight?",
    options: ["3.6 kg", "3.9 kg", "4.2 kg"],
    correctAnswer: 1,
    basePoints: 200,
    timeLimit: 10,
  },
  {
    id: 3,
    question: "How many teeth does he have as of today?",
    options: ["1", "2", "None yet"],
    correctAnswer: 0,
    basePoints: 150,
    timeLimit: 7,
  },
  {
    id: 4,
    question: "What's Nilan's favorite food?",
    options: ["Banana", "Rice with sambar", "Everything"],
    correctAnswer: 2,
    basePoints: 120,
    timeLimit: 8,
  },
  {
    id: 5,
    question: "What sound did Nilan make first?",
    options: ['"Daaaa!"', '"Aaaeee!"', '"Mmmaaaa"'],
    correctAnswer: 0,
    basePoints: 180,
    timeLimit: 9,
  },
]

export function PartyQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const { userName, clearUser } = useUserSession()
  const { awardPoints } = useGamification(userName || "")
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const [userQuizResult, setUserQuizResult] = useState<any>(null)

  useEffect(() => {
    if (userName) {
      const completed = QuizLeaderboardManager.hasUserCompletedQuiz(userName)
      setHasCompletedQuiz(completed)
      if (completed) {
        const result = QuizLeaderboardManager.getUserQuizResult(userName)
        setUserQuizResult(result)
      }
    }
  }, [userName])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !quizCompleted && questionStartTime > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult && !quizCompleted && questionStartTime > 0) {
      // Time's up - auto submit (even with no answer selected)
      handleTimeUp()
    }
  }, [timeLeft, showResult, quizCompleted, questionStartTime])

  const startQuestion = () => {
    const question = nilanQuestions[currentQuestion]
    setTimeLeft(question.timeLimit)
    setQuestionStartTime(Date.now())
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleStartQuiz = () => {
    startQuestion()
  }

  const calculateScore = (isCorrect: boolean, timeTaken: number, basePoints: number, timeLimit: number) => {
    if (!isCorrect) return 0

    // Time bonus: faster answers get more points
    const timeBonus = Math.max(0, (timeLimit - timeTaken) / timeLimit)
    const speedMultiplier = 1 + timeBonus * 0.5 // Up to 50% bonus for instant answers

    return Math.round(basePoints * speedMultiplier)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    submitAnswer()
  }

  const handleTimeUp = () => {
    submitAnswer()
  }

  const submitAnswer = () => {
    const question = nilanQuestions[currentQuestion]
    const timeTaken = (Date.now() - questionStartTime) / 1000
    const isCorrect = selectedAnswer !== null && selectedAnswer === question.correctAnswer

    setShowResult(true)

    if (selectedAnswer !== null && isCorrect) {
      setCorrectCount(correctCount + 1)
      const score = calculateScore(isCorrect, timeTaken, question.basePoints, question.timeLimit)
      setTotalScore(totalScore + score)
      awardPoints(score, `nilan-quiz-correct-${question.id}`)
    } else if (selectedAnswer !== null) {
      // Small participation points for wrong answers (only if an answer was actually selected)
      awardPoints(10, `nilan-quiz-attempt-${question.id}`)
    }
    // If selectedAnswer is null (no answer selected), no points are awarded
  }

  const handleNextQuestion = () => {
    if (currentQuestion < nilanQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      startQuestion()
    } else {
      // Quiz completed
      setQuizCompleted(true)

      // Calculate total completion time
      const totalCompletionTime = Math.round(
        (Date.now() - (questionStartTime - nilanQuestions[currentQuestion].timeLimit * 1000)) / 1000,
      )

      // Save result to leaderboard
      QuizLeaderboardManager.saveQuizResult({
        playerName: userName || "Anonymous",
        score: totalScore,
        correctAnswers: correctCount,
        totalQuestions: nilanQuestions.length,
        completionTime: totalCompletionTime,
        timestamp: new Date(),
        isPerfectScore: correctCount === nilanQuestions.length,
      })

      // Award completion bonus
      awardPoints(200, "quiz-completed")

      // Award special badges based on performance
      if (correctCount === nilanQuestions.length) {
        awardPoints(500, "quiz-master-achieved")
      } else if (correctCount >= nilanQuestions.length * 0.8) {
        awardPoints(300, "quiz-expert-achieved")
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setTotalScore(0)
    setQuizCompleted(false)
    setCorrectCount(0)
    setTimeLeft(0)
  }

  // Don't show name prompt here - assume user is already set from parent
  if (!userName) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-600 mb-2">No User Found</h3>
          <p className="text-gray-600">Please refresh the page and enter your name.</p>
        </CardContent>
      </Card>
    )
  }

  if (hasCompletedQuiz && userQuizResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <UserHeader userName={userName} onLogout={clearUser} />
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle className="text-2xl">🎯 Quiz Already Completed! 🎯</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="text-6xl mb-4">✅</div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">You've already taken the quiz!</h3>
            <p className="text-gray-600">
              Each player can only take the Nilan Birthday Quiz once to keep it fair for everyone.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
              <h4 className="text-lg font-bold mb-4">Your Quiz Results:</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#e57373]">{userQuizResult.score}</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#8fbc8f]">
                    {userQuizResult.correctAnswers}/{userQuizResult.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#ffb347]">{userQuizResult.completionTime}s</div>
                  <div className="text-sm text-gray-600">Completion Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#9b59b6]">
                    {new Date(userQuizResult.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Date Completed</div>
                </div>
              </div>

              {userQuizResult.isPerfectScore && (
                <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white text-lg px-4 py-2 mt-4">
                  🎯 Perfect Score! 🎯
                </Badge>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                💡 <strong>Tip:</strong> Check out the Leaderboard tab to see how you rank against other players!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardTitle className="text-2xl">🎉 Challenge Complete! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="text-6xl mb-4">🏆</div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-4">Your Results:</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#e57373]">{totalScore}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#9b59b6]">🏆</div>
                  <div className="text-sm text-gray-600">Champion</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#8fbc8f]">
                    {correctCount}/{nilanQuestions.length}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#ffb347]">⭐</div>
                  <div className="text-sm text-gray-600">Great Job!</div>
                </div>
              </div>
            </div>

            {correctCount === nilanQuestions.length && (
              <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white text-lg px-4 py-2">
                🎯 Perfect Score! 🎯
              </Badge>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              🏆 <strong>Quiz Complete!</strong> Your result has been saved to the leaderboard. Check out other party
              activities!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = nilanQuestions[currentQuestion]
  const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0
  const isCorrect = selectedAnswer === question.correctAnswer
  const score =
    showResult && isCorrect ? calculateScore(isCorrect, timeTaken, question.basePoints, question.timeLimit) : 0

  // If quiz hasn't started yet
  if (timeLeft === 0 && !showResult && !quizCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <UserHeader userName={userName} onLogout={clearUser} />
        <CardHeader className="text-center bg-gradient-to-r from-[#ffb347] to-[#e57373] text-white">
          <CardTitle className="text-2xl">🧠 Nilan Birthday Quiz 🧠</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="text-6xl mb-4">🎯</div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Test Your Nilan Knowledge!</h3>
            <p className="text-gray-600">
              Answer {nilanQuestions.length} questions about our birthday boy and earn points for correct answers.
              Faster answers get bonus points!
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Each question has a time limit. Answer quickly for bonus points!
              </p>
            </div>
          </div>
          <Button
            onClick={handleStartQuiz}
            className="bg-gradient-to-r from-[#ffb347] to-[#e57373] hover:from-[#ffa726] hover:to-[#ef5350] text-white text-lg px-8 py-3"
          >
            🚀 Start Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <UserHeader userName={userName} onLogout={clearUser} />
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            Question {currentQuestion + 1} of {nilanQuestions.length}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Score: {totalScore}
            </Badge>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft <= 3
                  ? "bg-red-100 text-red-700"
                  : timeLeft <= 5
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#ffb347] to-[#e57373] h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / nilanQuestions.length) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">{question.question}</h3>
          <div className="text-sm text-gray-500">
            Base Points: {question.basePoints} • Time Limit: {question.timeLimit}s
          </div>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult || timeLeft === 0}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === index
                  ? showResult
                    ? index === question.correctAnswer
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-red-500 bg-red-50 text-red-700"
                    : "border-[#e57373] bg-red-50"
                  : showResult && index === question.correctAnswer
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-[#ffb347] hover:bg-orange-50"
              } ${showResult || timeLeft === 0 ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
              {showResult && index === question.correctAnswer && <span className="float-right text-green-600">✓</span>}
              {showResult && selectedAnswer === index && index !== question.correctAnswer && (
                <span className="float-right text-red-600">✗</span>
              )}
            </button>
          ))}
        </div>

        {showResult && (
          <div
            className={`p-4 rounded-lg border-2 ${
              isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                {isCorrect ? `🎉 Correct! +${score} points` : `❌ Incorrect. +10 points for trying!`}
              </p>
              {isCorrect && (
                <div className="flex items-center gap-2 text-green-600">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">{timeTaken.toFixed(1)}s</span>
                </div>
              )}
            </div>
            {!isCorrect && (
              <p className="text-sm text-gray-600 mt-1">
                The correct answer was: {question.options[question.correctAnswer]}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Speed bonus available: up to {Math.round(question.basePoints * 0.5)} extra points
          </div>

          {!showResult && timeLeft > 0 ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-gradient-to-r from-[#ffb347] to-[#e57373] hover:from-[#ffa726] hover:to-[#ef5350] text-white"
            >
              Submit Answer
            </Button>
          ) : showResult ? (
            <Button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-[#8fbc8f] to-[#7cac7c] hover:from-[#7cac7c] hover:to-[#6b9b6b] text-white"
            >
              {currentQuestion < nilanQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
