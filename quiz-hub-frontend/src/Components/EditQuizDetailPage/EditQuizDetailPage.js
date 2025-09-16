import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Edit3, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from '../../Services/AuthService';
import AdminService from '../../Services/AdminService';
import QuestionEditForm from './QuestionEditForm';

export default function EditQuizDetails() {
  // Get quiz ID from URL
  const getQuizIdFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
  };

  const quizId = getQuizIdFromUrl();
  const [quiz, setQuiz] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    difficulty: 0,
    timeLimitMinutes: 10,
    questions: []
  });

  // Navigate function
  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Fetch quiz details for editing
  const fetchQuizDetails = async () => {
    try {
      console.log('Fetching quiz details for ID:', quizId);
      const quizDetails = await AdminService.getQuizForEdit(quizId);
      console.log('Quiz details received:', quizDetails);
      
      setQuiz(quizDetails);
      setFormData({
        name: quizDetails.name || '',
        description: quizDetails.description || '',
        categoryId: quizDetails.categoryId || '',
        difficulty: quizDetails.difficulty || 0,
        timeLimitMinutes: quizDetails.timeLimitMinutes || 10,
        questions: quizDetails.questions || []
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      setError(error.message || 'Failed to fetch quiz details');
      toast.error(error.message || 'Failed to fetch quiz details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await AdminService.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!AuthService.isAuthenticated() || !AuthService.isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      navigateTo('/login');
      return;
    }

    fetchQuizDetails();
    fetchCategories();
  }, [quizId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' || name === 'difficulty' || name === 'timeLimitMinutes' 
        ? parseInt(value) 
        : value
    }));
  };

const handleSaveQuiz = async () => {
    if (!formData.name.trim()) {
      toast.error('Quiz name is required');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('Quiz must have at least one question');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        difficulty: formData.difficulty,
        timeLimitMinutes: formData.timeLimitMinutes,
        questions: formData.questions.map(q => ({
          id: q.id || null,
          text: q.text,
          points: q.points,
          questionType: q.questionType,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          correctAnswerIndex: q.correctAnswerIndex,
          correctAnswerIndices: q.correctAnswerIndices,
          trueFalseCorrectAnswer: q.trueFalseCorrectAnswer,
          correctAnswer: q.correctAnswer
        }))
      };

      console.log('Saving quiz with data:', updateData);
      await AdminService.updateQuizWithEdit(quizId, updateData);
      toast.success('Quiz updated successfully');
      navigateTo('/edit-quiz');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(error.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

const handleQuestionSave = (questionData) => {
    if (editingQuestionIndex !== null) {
      // Update existing question
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((q, index) => 
          index === editingQuestionIndex ? { ...questionData, id: q.id } : q
        )
      }));
      toast.success('Question updated');
    } else {
      // Add new question
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...questionData, id: null }]
      }));
      toast.success('Question added');
    }
    
    setShowQuestionForm(false);
    setEditingQuestionIndex(null);
  };

const handleDeleteQuestion = (index) => {
  setQuestionToDelete(index);
  setShowDeleteQuestionModal(true);
};

const confirmDeleteQuestion = () => {
  setShowDeleteQuestionModal(false);
  setIsDeletingQuestion(true);
  
  setTimeout(() => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== questionToDelete)
    }));
    toast.success('Question deleted');
    setIsDeletingQuestion(false);
    setQuestionToDelete(null);
  }, 300); // Small delay to show the deleting state
};

const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };


  //modal for deleting question
  const DeleteQuestionModal = ({ isOpen, onClose, onConfirm, questionIndex, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        style={{ backgroundColor: '#E8E8E8' }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertTriangle 
              className="h-6 w-6" 
              style={{ color: '#495464' }}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#495464' }}>
              Delete Question
            </h2>
            <p className="text-sm" style={{ color: '#495464', opacity: 0.8 }}>
              Are you sure you want to delete <span className="font-medium">Question {questionIndex + 1}</span>?
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" style={{ color: '#495464' }} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-lg font-medium border hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{ color: '#495464', borderColor: '#495464' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDeleting 
                ? 'cursor-not-allowed opacity-50' 
                : 'hover:opacity-90'
            }`}
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

  //modal for deleting quiz
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, quizName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        style={{ backgroundColor: '#E8E8E8' }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertTriangle 
              className="h-6 w-6" 
              style={{ color: '#495464' }} 
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#495464' }}>
              Delete Quiz
            </h2>
            <p className="text-sm" style={{ color: '#495464', opacity: 0.8 }}>
              Are you sure you want to delete <span className="font-medium">"{quizName}"</span>?
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" style={{ color: '#495464' }} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-lg font-medium border hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{ color: '#495464', borderColor: '#495464' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isDeleting 
                ? 'cursor-not-allowed opacity-50' 
                : 'hover:opacity-90'
            }`}
            style={{ 
              backgroundColor: '#495464', 
              color: 'white'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

const handleDeleteQuiz = async () => {
    setShowDeleteModal(false);
      setIsDeleting(true);
      
      try {
        await AdminService.deleteQuizCompletely(quizId);
        toast.success('Quiz deleted successfully');
        navigateTo('/edit-quiz');
      } catch (error) {
        toast.error(error.message || 'Failed to delete quiz');
      } finally {
        setIsDeleting(false);
      }
};

  const getDifficultyName = (difficulty) => {
    switch (difficulty) {
      case 0: return 'Easy';
      case 1: return 'Medium';
      case 2: return 'Hard';
      default: return 'Easy';
    }
};

  // Get question type display name
  const getQuestionTypeDisplay = (questionType) => {
    switch (questionType) {
      case 'MultipleChoiceQuestion': return 'Single Choice';
      case 'MultipleAnswerQuestion': return 'Multiple Choice';
      case 'TrueFalseQuestion': return 'True/False';
      case 'TextInputQuestion': return 'Text Input';
      default: return questionType;
    }
  };

  // For page loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4"
            style={{ borderColor: '#495464' }}
          ></div>
          <p className="text-lg" style={{ color: '#495464' }}>Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#BBBFCA',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#E8E8E8' }}>
          <AlertTriangle className="h-16 w-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <p className="text-lg mb-2" style={{ color: '#495464' }}>Error Loading Quiz</p>
          <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>{error}</p>
          <button
            onClick={() => navigateTo('/edit-quiz')}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#BBBFCA',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigateTo('/edit-quiz')}
              className="p-2 rounded-lg transition-all duration-200 hover:opacity-70 mr-4"
              style={{ backgroundColor: '#E8E8E8' }}
            >
              <ArrowLeft className="h-6 w-6" style={{ color: '#495464' }} />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#495464' }}>
                Edit Quiz: {quiz?.name}
              </h1>
              <p className="text-lg" style={{ color: '#495464', opacity: 0.7 }}>
                Modify quiz details and manage questions
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
              style={{ 
                backgroundColor: '#353b42ff',
                color: 'white'
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Quiz
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center disabled:opacity-50"
              style={{ 
                backgroundColor: '#495464',
                color: 'white'
              }}
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Details Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#E8E8E8' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: '#495464' }}>
                Quiz Details
              </h2>
              
              <div className="space-y-4">
                {/* Quiz Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#495464' }}>
                    Quiz Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F4F4F2',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                    placeholder="Enter quiz name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#495464' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F4F4F2',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                    placeholder="Enter quiz description"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#495464' }}>
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F4F4F2',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#495464' }}>
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F4F4F2',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                  >
                    <option value={0}>Easy</option>
                    <option value={1}>Medium</option>
                    <option value={2}>Hard</option>
                  </select>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#495464' }}>
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    value={formData.timeLimitMinutes}
                    onChange={handleInputChange}
                    min="1"
                    max="180"
                    className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F4F4F2',
                      color: '#495464',
                      focusRingColor: '#495464'
                    }}
                  />
                </div>

                {/* Quiz Stats */}
                <div className="pt-4 border-t" style={{ borderColor: '#BBBFCA' }}>
                  <div className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                    <p className="mb-1">Questions: {formData.questions.length}</p>
                    <p className="mb-1">Category: {quiz?.categoryName}</p>
                    <p>Difficulty: {getDifficultyName(formData.difficulty)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#E8E8E8' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: '#495464' }}>
                  Questions ({formData.questions.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingQuestionIndex(null);
                    setShowQuestionForm(true);
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
                  style={{ 
                    backgroundColor: '#495464',
                    color: 'white'
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              {formData.questions.length > 0 ? (
                <div className="space-y-4">
                  {formData.questions.map((question, index) => (
                    <div 
                      key={question.id || index}
                      className="p-4 rounded-lg border-2"
                      style={{ backgroundColor: '#F4F4F2', borderColor: '#BBBFCA' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium px-2 py-1 rounded" 
                                  style={{ backgroundColor: '#BBBFCA', color: '#495464' }}>
                              {getQuestionTypeDisplay(question.questionType)}
                            </span>
                            <span className="text-sm" style={{ color: '#495464', opacity: 0.7 }}>
                              {question.points} point{question.points !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="font-medium" style={{ color: '#495464' }}>
                            Q{index + 1}: {question.text}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditQuestion(index)}
                            className="p-2 rounded transition-all duration-200 hover:opacity-70"
                            style={{ backgroundColor: '#495464' }}
                          >
                            <Edit3 className="h-4 w-4" style={{ color: 'white' }} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(index)}
                            className="p-2 rounded transition-all duration-200 hover:opacity-70"
                            style={{ backgroundColor: '#BBBFCA' }}
                          >
                            <Trash2 className="h-4 w-4" style={{ color: 'white' }} />
                          </button>
                        </div>
                      </div>

                      {/* Question Details */}
                      <div className="text-sm" style={{ color: '#495464', opacity: 0.8 }}>
                        {question.questionType === 'MultipleChoiceQuestion' && (
                          <div>
                            <p className="mb-1">Options:</p>
                            <ul className="list-disc list-inside ml-2">
                              <li className={question.correctAnswerIndex === 0 ? 'font-semibold' : ''}>
                                {question.option1} {question.correctAnswerIndex === 0 && '✓'}
                              </li>
                              <li className={question.correctAnswerIndex === 1 ? 'font-semibold' : ''}>
                                {question.option2} {question.correctAnswerIndex === 1 && '✓'}
                              </li>
                              <li className={question.correctAnswerIndex === 2 ? 'font-semibold' : ''}>
                                {question.option3} {question.correctAnswerIndex === 2 && '✓'}
                              </li>
                              <li className={question.correctAnswerIndex === 3 ? 'font-semibold' : ''}>
                                {question.option4} {question.correctAnswerIndex === 3 && '✓'}
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {question.questionType === 'MultipleAnswerQuestion' && (
                          <div>
                            <p className="mb-1">Options:</p>
                            <ul className="list-disc list-inside ml-2">
                              {[question.option1, question.option2, question.option3, question.option4].map((option, i) => (
                                <li key={i} className={question.correctAnswerIndices?.includes(i.toString()) ? 'font-semibold' : ''}>
                                  {option} {question.correctAnswerIndices?.includes(i.toString()) && '✓'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {question.questionType === 'TrueFalseQuestion' && (
                          <p>Correct Answer: <strong>{question.trueFalseCorrectAnswer ? 'True' : 'False'}</strong></p>
                        )}
                        
                        {question.questionType === 'TextInputQuestion' && (
                          <p>Correct Answer: <strong>{question.correctAnswer}</strong></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Plus className="h-16 w-16 mx-auto mb-4" style={{ color: '#495464', opacity: 0.3 }} />
                  <p className="text-lg mb-2" style={{ color: '#495464' }}>No questions yet</p>
                  <p className="text-sm mb-4" style={{ color: '#495464', opacity: 0.7 }}>
                    Add your first question to get started
                  </p>
                  <button
                    onClick={() => {
                      setEditingQuestionIndex(null);
                      setShowQuestionForm(true);
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
                    style={{ 
                      backgroundColor: '#22c55e',
                      color: 'white'
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Edit Modal */}
      {showQuestionForm && (
        <QuestionEditForm
          question={editingQuestionIndex !== null ? formData.questions[editingQuestionIndex] : null}
          onSave={handleQuestionSave}
          onClose={() => {
            setShowQuestionForm(false);
            setEditingQuestionIndex(null);
          }}
        />
      )}

      {/* Quiz Delete modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteQuiz}
        quizName={quiz?.name}
        isDeleting={isDeleting}
      />

      {/* Question Delete modal */}
      <DeleteQuestionModal
          isOpen={showDeleteQuestionModal}
          onClose={() => {
            setShowDeleteQuestionModal(false);
            setQuestionToDelete(null);
          }}
          onConfirm={confirmDeleteQuestion}
          questionIndex={questionToDelete}
          isDeleting={isDeletingQuestion}
        />
    </div>
  );
}