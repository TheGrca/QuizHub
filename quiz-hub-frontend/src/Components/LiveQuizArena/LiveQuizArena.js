import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Settings, Save, X, Edit3, Zap, Clock } from 'lucide-react';
import AuthService from '../../Services/AuthService';
import AdminService from '../../Services/AdminService';

// Editable Single Choice Question Component for Live Quiz
const EditableSingleChoiceQuestion = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || 0);
  const [timeToAnswer, setTimeToAnswer] = useState(question?.timeToAnswer || 30);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    if (questionText.trim() && options.every(opt => opt.trim())) {
      onSave({
        type: 'MultipleChoiceQuestion',
        text: questionText,
        options,
        correctAnswer,
        timeToAnswer: parseInt(timeToAnswer)
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter your question..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="radio"
              name="correct-answer"
              checked={correctAnswer === index}
              onChange={() => setCorrectAnswer(index)}
              className="mr-3"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder={`Option ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time to Answer (seconds)</label>
        <input
          type="number"
          value={timeToAnswer}
          onChange={(e) => setTimeToAnswer(e.target.value)}
          min="10"
          max="120"
          className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#495464' }}
        >
          Save Question
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Editable Multiple Choice Question Component for Live Quiz
const EditableMultipleChoiceQuestion = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState(question?.correctAnswers || []);
  const [timeToAnswer, setTimeToAnswer] = useState(question?.timeToAnswer || 30);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerToggle = (index) => {
    const newCorrectAnswers = correctAnswers.includes(index)
      ? correctAnswers.filter(i => i !== index)
      : [...correctAnswers, index];
    setCorrectAnswers(newCorrectAnswers);
  };

  const handleSave = () => {
    if (questionText.trim() && options.every(opt => opt.trim()) && correctAnswers.length > 0) {
      onSave({
        type: 'MultipleAnswerQuestion',
        text: questionText,
        options,
        correctAnswers,
        timeToAnswer: parseInt(timeToAnswer)
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter your question..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options (Check all correct answers)</label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={correctAnswers.includes(index)}
              onChange={() => handleCorrectAnswerToggle(index)}
              className="mr-3"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder={`Option ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time to Answer (seconds)</label>
        <input
          type="number"
          value={timeToAnswer}
          onChange={(e) => setTimeToAnswer(e.target.value)}
          min="10"
          max="120"
          className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#495464' }}
        >
          Save Question
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Editable True/False Question Component for Live Quiz
const EditableTrueFalseQuestion = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer ?? true);
  const [timeToAnswer, setTimeToAnswer] = useState(question?.timeToAnswer || 30);

  const handleSave = () => {
    if (questionText.trim()) {
      onSave({
        type: 'TrueFalseQuestion',
        text: questionText,
        correctAnswer,
        timeToAnswer: parseInt(timeToAnswer)
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter your question..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="trueFalse"
              checked={correctAnswer === true}
              onChange={() => setCorrectAnswer(true)}
              className="mr-2"
            />
            True
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="trueFalse"
              checked={correctAnswer === false}
              onChange={() => setCorrectAnswer(false)}
              className="mr-2"
            />
            False
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time to Answer (seconds)</label>
        <input
          type="number"
          value={timeToAnswer}
          onChange={(e) => setTimeToAnswer(e.target.value)}
          min="10"
          max="120"
          className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#495464' }}
        >
          Save Question
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Editable Text Input Question Component for Live Quiz
const EditableTextInputQuestion = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || '');
  const [timeToAnswer, setTimeToAnswer] = useState(question?.timeToAnswer || 30);

  const handleSave = () => {
    if (questionText.trim() && correctAnswer.trim()) {
      onSave({
        type: 'TextInputQuestion',
        text: questionText,
        correctAnswer,
        timeToAnswer: parseInt(timeToAnswer)
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter your question..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Enter the correct answer..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time to Answer (seconds)</label>
        <input
          type="number"
          value={timeToAnswer}
          onChange={(e) => setTimeToAnswer(e.target.value)}
          min="10"
          max="120"
          className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#495464' }}
        >
          Save Question
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Question Display Component for Live Quiz
const QuestionDisplay = ({ question, index, onEdit, onDelete }) => {
  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'MultipleChoiceQuestion': return 'Single Choice';
      case 'MultipleAnswerQuestion': return 'Multiple Choice';
      case 'TrueFalseQuestion': return 'True/False';
      case 'TextInputQuestion': return 'Text Input';
      default: return type;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(index)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(index)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-gray-700 mb-2">{question.text}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Type: {getQuestionTypeLabel(question.type)}</span>
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {question.timeToAnswer}s
        </span>
      </div>
    </div>
  );
};

// Main Live Quiz Arena Component
const LiveQuizArena = () => {
  const [quizData, setQuizData] = useState({
    name: '',
    description: '',
    categoryId: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState('');
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await AdminService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddQuestion = () => {
    setShowQuestionForm(true);
    setEditingQuestionIndex(-1);
  };

  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setSelectedQuestionType(questions[index].type);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = (questionData) => {
    if (editingQuestionIndex >= 0) {
      setQuestions(prev => prev.map((q, i) => i === editingQuestionIndex ? questionData : q));
    } else {
      setQuestions(prev => [...prev, questionData]);
    }
    setShowQuestionForm(false);
    setSelectedQuestionType('');
    setEditingQuestionIndex(-1);
  };

  const handleCancelQuestion = () => {
    setShowQuestionForm(false);
    setSelectedQuestionType('');
    setEditingQuestionIndex(-1);
  };

  const isQuizValid = () => {
    return quizData.name.trim() && 
           quizData.description.trim() && 
           quizData.categoryId && 
           questions.length > 0;
  };

  

  const handleCreateLiveQuiz = () => {
    if (!isQuizValid()) return;
    
    // Create WebSocket connection to C# backend
    const ws = new WebSocket('ws://localhost:5175/ws'); // Updated to correct port
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      
      // Send live quiz data to all connected users
      const liveQuizData = {
        type: 'LIVE_QUIZ_CREATED',
        payload: {
          quizData: {
            name: quizData.name,
            description: quizData.description,
            categoryId: quizData.categoryId
          },
          questions: questions.map(q => ({
            type: q.type,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            correctAnswers: q.correctAnswers,
            timeToAnswer: q.timeToAnswer
          })),
          adminId: AuthService.getCurrentUser().id.toString()
        }
      };
      
  console.log('Sending message:', liveQuizData);
  
  ws.send(JSON.stringify(liveQuizData));
  
  // Check if message was sent
  setTimeout(() => {
    console.log('WebSocket readyState after sending:', ws.readyState);
  }, 100);
      toast.success('Live quiz room created!');
      
      const quizName = quizData.name.replace(/\s+/g, '-').toLowerCase();
      navigateTo(`/live-quiz-room/${quizName}`);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Failed to create live quiz room');
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  };

  // Navigate function
  const navigateTo = (path) => {
    window.location.href = path;
  };

  const renderQuestionForm = () => {
    const questionToEdit = editingQuestionIndex >= 0 ? questions[editingQuestionIndex] : null;

    switch (selectedQuestionType) {
      case 'MultipleChoiceQuestion':
        return (
          <EditableSingleChoiceQuestion
            question={questionToEdit}
            onSave={handleSaveQuestion}
            onCancel={handleCancelQuestion}
          />
        );
      case 'MultipleAnswerQuestion':
        return (
          <EditableMultipleChoiceQuestion
            question={questionToEdit}
            onSave={handleSaveQuestion}
            onCancel={handleCancelQuestion}
          />
        );
      case 'TrueFalseQuestion':
        return (
          <EditableTrueFalseQuestion
            question={questionToEdit}
            onSave={handleSaveQuestion}
            onCancel={handleCancelQuestion}
          />
        );
      case 'TextInputQuestion':
        return (
          <EditableTextInputQuestion
            question={questionToEdit}
            onSave={handleSaveQuestion}
            onCancel={handleCancelQuestion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Zap className="h-8 w-8 mr-3" style={{ color: '#495464' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
              Live Quiz Arena
            </h1>
          </div>
          <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
            Create a live quiz with real-time competition
          </p>
        </div>

        {/* Main Content */}
        <div className="pb-8">
          <div 
            className="w-full rounded-2xl shadow-lg p-8 space-y-8"
            style={{ backgroundColor: '#E8E8E8' }}
          >
            {/* Quiz Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#495464' }}>
                Live Quiz Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#495464' }}>
                    Quiz Name
                  </label>
                  <input
                    type="text"
                    value={quizData.name}
                    onChange={(e) => handleQuizDataChange('name', e.target.value)}
                    className="w-full p-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'white',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                    placeholder="Enter live quiz name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#495464' }}>
                    Category
                  </label>
                  <select
                    value={quizData.categoryId}
                    onChange={(e) => handleQuizDataChange('categoryId', e.target.value)}
                    className="w-full p-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'white',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#495464' }}>
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => handleQuizDataChange('description', e.target.value)}
                  className="w-full p-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: 'white',
                    color: '#495464',
                    focusRingColor: '#495464'
                  }}
                  rows={3}
                  placeholder="Enter live quiz description..."
                />
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold" style={{ color: '#495464' }}>
                  Questions ({questions.length}/20)
                </h2>
                {questions.length < 20 && (
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#495464' }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                )}
              </div>

              {/* Question Type Selection */}
              {showQuestionForm && !selectedQuestionType && (
                <div 
                  className="p-6 rounded-lg mb-6"
                  style={{ backgroundColor: 'white' }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#495464' }}>
                    Select Question Type
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { type: 'MultipleChoiceQuestion', label: 'Single Choice' },
                      { type: 'MultipleAnswerQuestion', label: 'Multiple Choice' },
                      { type: 'TrueFalseQuestion', label: 'True/False' },
                      { type: 'TextInputQuestion', label: 'Text Input' }
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => setSelectedQuestionType(type)}
                        className="p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                        style={{ 
                          backgroundColor: '#E8E8E8',
                          borderColor: '#495464',
                          borderOpacity: 0.2,
                          color: '#495464'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCancelQuestion}
                    className="mt-4 px-4 py-2 rounded-lg font-medium border hover:bg-gray-50 transition-colors"
                    style={{ color: '#495464', borderColor: '#495464' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Question Form */}
              {showQuestionForm && selectedQuestionType && (
                <div className="mb-6">
                  {renderQuestionForm()}
                </div>
              )}

              {/* Questions List */}
              {questions.length > 0 && (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionDisplay
                      key={index}
                      question={question}
                      index={index}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                </div>
              )}

              {questions.length === 0 && !showQuestionForm && (
                <div className="text-center py-12">
                  <Zap className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.5 }} />
                  <p className="text-lg mb-2" style={{ color: '#495464' }}>
                    No questions added yet
                  </p>
                  <p className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                    Click "Add Question" to create your first live quiz question
                  </p>
                </div>
              )}
            </div>

            {/* Create Live Quiz Button */}
            {questions.length > 0 && (
              <div className="flex justify-end pt-6 border-t" style={{ borderColor: '#495464', borderOpacity: 0.2 }}>
                <button
                  onClick={handleCreateLiveQuiz}
                  disabled={!isQuizValid()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isQuizValid()
                      ? 'text-white hover:opacity-90'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  style={{ 
                    backgroundColor: isQuizValid() ? '#495464' : '#BBBFCA'
                  }}
                >
                  <Zap className="h-4 w-4" />
                  Create Live Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQuizArena;