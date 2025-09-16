import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuestionEditForm({ question, onSave, onClose }) {
  const [formData, setFormData] = useState({
    text: '',
    points: 1,
    questionType: 'MultipleChoiceQuestion',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswerIndex: 0,
    correctAnswerIndices: '',
    trueFalseCorrectAnswer: true,
    correctAnswer: ''
  });

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text || '',
        points: question.points || 1,
        questionType: question.questionType || 'MultipleChoiceQuestion',
        option1: question.option1 || '',
        option2: question.option2 || '',
        option3: question.option3 || '',
        option4: question.option4 || '',
        correctAnswerIndex: question.correctAnswerIndex || 0,
        correctAnswerIndices: question.correctAnswerIndices || '',
        trueFalseCorrectAnswer: question.trueFalseCorrectAnswer !== undefined ? question.trueFalseCorrectAnswer : true,
        correctAnswer: question.correctAnswer || ''
      });
    }
  }, [question]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'points' || name === 'correctAnswerIndex' ? parseInt(value) || 0 : 
              value
    }));
  };

 
  const handleMultipleAnswerChange = (optionIndex) => {
    const currentIndices = formData.correctAnswerIndices.split(',').filter(i => i !== '').map(i => parseInt(i));
    const isSelected = currentIndices.includes(optionIndex);
    
    let newIndices;
    if (isSelected) {
      newIndices = currentIndices.filter(i => i !== optionIndex);
    } else {
      newIndices = [...currentIndices, optionIndex];
    }
    
    setFormData(prev => ({
      ...prev,
      correctAnswerIndices: newIndices.sort().join(',')
    }));
  };


  const validateForm = () => {
    if (!formData.text.trim()) {
      toast.error('Question text is required');
      return false;
    }

    if (formData.points < 1) {
      toast.error('Points must be at least 1');
      return false;
    }

    switch (formData.questionType) {
      case 'MultipleChoiceQuestion':
        if (!formData.option1.trim() || !formData.option2.trim() || 
            !formData.option3.trim() || !formData.option4.trim()) {
          toast.error('All options are required for multiple choice questions');
          return false;
        }
        break;
      case 'MultipleAnswerQuestion':
        if (!formData.option1.trim() || !formData.option2.trim() || 
            !formData.option3.trim() || !formData.option4.trim()) {
          toast.error('All options are required for multiple answer questions');
          return false;
        }
        if (!formData.correctAnswerIndices.trim()) {
          toast.error('At least one correct answer must be selected');
          return false;
        }
        break;
      case 'TextInputQuestion':
        if (!formData.correctAnswer.trim()) {
          toast.error('Correct answer is required for text input questions');
          return false;
        }
        break;
    }

    return true;
  };


  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: '#E8E8E8' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#BBBFCA' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#495464' }}>
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:opacity-70"
            style={{ backgroundColor: '#BBBFCA' }}
          >
            <X className="h-6 w-6" style={{ color: '#495464' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-lg font-semibold mb-2" style={{ color: '#495464' }}>
                Question Text
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#F4F4F2',
                  color: '#495464',
                  focusRingColor: '#495464'
                }}
                placeholder="Enter your question..."
              />
            </div>

            {/* Question Type and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold mb-2" style={{ color: '#495464' }}>
                  Question Type
                </label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F4F4F2',
                    color: '#495464',
                    focusRingColor: '#495464'
                  }}
                >
                  <option value="MultipleChoiceQuestion">Single Choice</option>
                  <option value="MultipleAnswerQuestion">Multiple Choice</option>
                  <option value="TrueFalseQuestion">True/False</option>
                  <option value="TextInputQuestion">Text Input</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2" style={{ color: '#495464' }}>
                  Points
                </label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F4F4F2',
                    color: '#495464',
                    focusRingColor: '#495464'
                  }}
                />
              </div>
            </div>

            {/* Question Type Specific Fields */}
            {(formData.questionType === 'MultipleChoiceQuestion' || formData.questionType === 'MultipleAnswerQuestion') && (
              <div>
                <label className="block text-lg font-semibold mb-3" style={{ color: '#495464' }}>
                  Answer Options
                </label>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          name={`option${num}`}
                          value={formData[`option${num}`]}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                          style={{ 
                            backgroundColor: '#F4F4F2',
                            color: '#495464',
                            focusRingColor: '#495464'
                          }}
                          placeholder={`Option ${num}`}
                        />
                      </div>
                      
                      {formData.questionType === 'MultipleChoiceQuestion' && (
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="correctAnswerIndex"
                            value={num - 1}
                            checked={formData.correctAnswerIndex === num - 1}
                            onChange={handleInputChange}
                            className="h-5 w-5"
                            style={{ accentColor: '#495464' }}
                          />
                          <label className="ml-2 text-sm" style={{ color: '#495464' }}>
                            Correct
                          </label>
                        </div>
                      )}
                      
                      {formData.questionType === 'MultipleAnswerQuestion' && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.correctAnswerIndices.split(',').includes((num - 1).toString())}
                            onChange={() => handleMultipleAnswerChange(num - 1)}
                            className="h-5 w-5"
                            style={{ accentColor: '#495464' }}
                          />
                          <label className="ml-2 text-sm" style={{ color: '#495464' }}>
                            Correct
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {formData.questionType === 'MultipleAnswerQuestion' && (
                  <p className="text-sm mt-2" style={{ color: '#495464', opacity: 0.7 }}>
                    Select all correct answers
                  </p>
                )}
              </div>
            )}

            {formData.questionType === 'TrueFalseQuestion' && (
              <div>
                <label className="block text-lg font-semibold mb-3" style={{ color: '#495464' }}>
                  Correct Answer
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trueFalseCorrectAnswer"
                      value="true"
                      checked={formData.trueFalseCorrectAnswer === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, trueFalseCorrectAnswer: true }))}
                      className="h-5 w-5 mr-2"
                      style={{ accentColor: '#495464' }}
                    />
                    <span style={{ color: '#495464' }}>True</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trueFalseCorrectAnswer"
                      value="false"
                      checked={formData.trueFalseCorrectAnswer === false}
                      onChange={(e) => setFormData(prev => ({ ...prev, trueFalseCorrectAnswer: false }))}
                      className="h-5 w-5 mr-2"
                      style={{ accentColor: '#495464' }}
                    />
                    <span style={{ color: '#495464' }}>False</span>
                  </label>
                </div>
              </div>
            )}

            {formData.questionType === 'TextInputQuestion' && (
              <div>
                <label className="block text-lg font-semibold mb-2" style={{ color: '#495464' }}>
                  Correct Answer
                </label>
                <input
                  type="text"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F4F4F2',
                    color: '#495464',
                    focusRingColor: '#495464'
                  }}
                  placeholder="Enter the correct answer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#BBBFCA' }}>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: '#BBBFCA',
              color: '#495464'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 inline-flex items-center"
            style={{ 
              backgroundColor: '#495464',
              color: 'white'
            }}
          >
            <Save className="h-5 w-5 mr-2" />
            {question ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </div>
    </div>
  );
}