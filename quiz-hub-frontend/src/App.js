import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Shared/Navbar';
import { Toaster } from 'react-hot-toast';

import LoginPage from './Components/Login/Login';
import RegisterPage from './Components/Register/Register';
import HomePage from './Components/Home/Home';
import MyResultsPage from './Components/MyResults/MyResults';
import AddQuizPage from './Components/AddQuiz/AddQuiz';
import EditQuizPage from './Components/EditQuiz/EditQuiz';
import EditQuizDetails from './Components/EditQuizDetailPage/EditQuizDetailPage';
import RankingsPage from './Components/Rankings/Rankings';
import QuizPage from './Components/Quiz/Quiz'; 
import MyResultDetailPage from './Components/MyResultDetailPage/MyResultDetailPage'
import RankingsDetailPage from './Components/RankingsDetailPage/RankingsDetailPage'
import UserResults from './Components/UserResults/UserResults';
import UserResultsDetailPage from './Components/UserResultsDetailPage/UserResultsDetailPage';
import LiveQuizArena from './Components/LiveQuizArena/LiveQuizArena';
import LiveQuizRoom from './Components/LiveQuizArenaRoom/LiveQuizArenaRoom';
import LiveQuizGame from './Components/LiveQuizArenaGame/LiveQuizArenaGame';
import LiveQuizResults from './Components/LiveQuizArenaResults/LiveQuizArenaResults';
const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

const App = () => {
  const user = getUserFromStorage();
  const token = localStorage.getItem('token');
  const isAuthenticated = token && user;
  const isAdmin = user && user.role === 1;

  // If not authenticated, only show login/register
  if (!isAuthenticated) {
    return (
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // If authenticated, show appropriate routes with navbar
  return (
    <div className="App">
      <Navbar isAdmin={isAdmin} />
      <Routes>
        {isAdmin ? (
          // Admin routes
          <>
            <Route path="/add-quiz" element={<AddQuizPage />} />
            <Route path="/edit-quiz" element={<EditQuizPage />} />
            <Route path="/edit-quiz/:id" element={<EditQuizDetails />} />
            <Route path="/user-results" element={<UserResults/>}/>
            <Route path="/user-results/:id" element={<UserResultsDetailPage/>}/>
            <Route path="/live-quiz-arena" element={<LiveQuizArena/>}/>
            <Route path="/live-quiz-room/:quizName"element={<LiveQuizRoom />} />
            <Route path="/"r element={<Navigate to="/add-quiz" replace />} />
            <Route path="*" element={<Navigate to="/add-quiz" replace />} />
          </>
        ) : (
          // User routes
          <>
  <Route path="/home" element={<HomePage />} />
  <Route path="/my-results" element={<MyResultsPage />} />
  <Route path="/my-results/:id" element={<MyResultDetailPage />} />
  <Route path="/quiz/:id" element={<QuizPage />} />
  <Route path="/rankings" element={<RankingsPage />} />
  <Route path="/rankings/:id" element={<RankingsDetailPage />}/>
   <Route path="/live-quiz-room/:quizName" element={<LiveQuizRoom />} />
               <Route path="/live-quiz-game/:quizId/:questionNumber" element={<LiveQuizGame />} />
               <Route path="/live-quiz-game/:quizId/results" element={<LiveQuizResults />} />
  <Route path="/" element={<Navigate to="/home" replace />} />
  <Route path="*" element={<Navigate to="/home" replace />} />
          </>
        )}
        
        {/* Redirect login/register for authenticated users */}
        <Route path="/login" element={<Navigate to={isAdmin ? "/add-quiz" : "/home"} replace />} />
        <Route path="/register" element={<Navigate to={isAdmin ? "/add-quiz" : "/home"} replace />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;