import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Zap, Clock } from 'lucide-react';
import AuthService from '../../Services/AuthService';
import AdminService from '../../Services/AdminService';
import LiveQuizService from '../../Services/LiveQuizService';
import EditableSingleChoiceQuestion from '../../Shared/LiveEditableSingleChoiceQuestion';
import EditableMultipleChoiceQuestion from '../../Shared/LiveEditableMultipleChoiceQuestion';
import EditableTrueFalseQuestion from '../../Shared/LiveEditableTrueFalseQuestion';
import EditableTextInputQuestion from '../../Shared/LiveEditableTextInputQuestion';


const QuestionDisplay = ({ question, index, onEdit, onDelete }) => {
  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'SingleChoiceQuestion': return 'Single Choice';
      case 'MultipleChoiceQuestion': return 'Multiple Choice';
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
            className="text-black-600 hover:text-black-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(index)}
            className="text-black-600 hover:text-black-800 text-sm"
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
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const [user] = useState(AuthService.getCurrentUser());
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
  const [isCreating, setIsCreating] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    initializeWebSocket();
    fetchCategories();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const initializeWebSocket = () => {
    try {
      wsRef.current = new WebSocket(process.env.REACT_APP_WS_URL);

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        
        // Register user as connected
        const message = {
          type: 'USER_CONNECTED',
          payload: {
            userId: user.id.toString(),
            username: user.username
          }
        };
        wsRef.current.send(JSON.stringify(message));
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await AdminService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

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

  const handleCreateLiveQuiz = async () => {
   if (!isQuizValid()) {
    toast.error('Please fill in all quiz details and add at least one question');
    return;
  }
  
  try {
    setIsCreating(true);
    const liveQuizData = {
  name: quizData.name,
  description: quizData.description,
  categoryId: parseInt(quizData.categoryId),
  questions: questions.map((q, index) => {
    const question = {
      type: q.type,
      text: q.text,
      timeToAnswer: q.timeToAnswer,
      options: [],
      correctAnswer: null,
      correctAnswers: [],
      correctAnswerBool: null,
      correctAnswerText: null
    };

if (q.type === 'SingleChoiceQuestion') { 
      question.options = q.options;
      question.correctAnswer = q.correctAnswer;
      question.correctAnswers = [q.correctAnswer];
    } else if (q.type === 'MultipleChoiceQuestion') {  
      question.options = q.options;
      question.correctAnswers = q.correctAnswers;
    } else if (q.type === 'TrueFalseQuestion') {
      question.correctAnswerBool = q.correctAnswer;
      question.options = [];
    } else if (q.type === 'TextInputQuestion') {
      question.correctAnswerText = q.correctAnswer;
      question.options = [];
    }

    return question;
  })
};
    
    const response = await LiveQuizService.createLiveQuiz(liveQuizData);
    
    if (response.success) {
      toast.success('Live quiz room created!');
      navigate(`/live-quiz-room/${response.quizId}`);
    } else {
      throw new Error(response.message || 'Failed to create live quiz');
    }
  } catch (error) {
    console.error('Error creating live quiz:', error);
    toast.error(error.message || 'Failed to create live quiz room');
  } finally {
    setIsCreating(false);
  }
};

  const renderQuestionForm = () => {
    const questionToEdit = editingQuestionIndex >= 0 ? questions[editingQuestionIndex] : null;

    switch (selectedQuestionType) {
      case 'SingleChoiceQuestion':
        return (
          <EditableSingleChoiceQuestion
            question={questionToEdit}
            onSave={handleSaveQuestion}
            onCancel={handleCancelQuestion}
          />
        );
      case 'MultipleChoiceQuestion':
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
                      { type: 'SingleChoiceQuestion', label: 'Single Choice' },
                      { type: 'MultipleChoiceQuestion', label: 'Multiple Choice' },
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
                  disabled={!isQuizValid() || isCreating}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isQuizValid() && !isCreating
                      ? 'text-white hover:opacity-90'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  style={{ 
                    backgroundColor: (isQuizValid() && !isCreating) ? '#495464' : '#BBBFCA'
                  }}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Create Live Quiz
                    </>
                  )}
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