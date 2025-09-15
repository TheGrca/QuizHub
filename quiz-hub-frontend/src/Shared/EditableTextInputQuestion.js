import { useState } from "react";

const EditableTextInputQuestion = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || '');
  const [points, setPoints] = useState(question?.points || 1);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }
    
    if (!correctAnswer.trim()) {
      newErrors.correctAnswer = 'Correct answer is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        type: 'TextInputQuestion',
        text: questionText,
        correctAnswer,
        points: parseInt(points)
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
        <textarea
          value={questionText}
          onChange={(e) => {
            setQuestionText(e.target.value);
            if (errors.questionText && e.target.value.trim()) {
              const newErrors = { ...errors };
              delete newErrors.questionText;
              setErrors(newErrors);
            }
          }}
          className={`w-full p-3 border rounded-lg focus:ring-2 ${
            errors.questionText 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          rows={2}
          placeholder="Enter your question..."
        />
        {errors.questionText && (
          <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => {
            setCorrectAnswer(e.target.value);
            if (errors.correctAnswer && e.target.value.trim()) {
              const newErrors = { ...errors };
              delete newErrors.correctAnswer;
              setErrors(newErrors);
            }
          }}
          className={`w-full p-2 border rounded focus:ring-2 ${
            errors.correctAnswer 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter the correct answer..."
        />
        {errors.correctAnswer && (
          <p className="text-red-500 text-sm mt-1">{errors.correctAnswer}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          min="1"
          max="10"
          className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
export default EditableTextInputQuestion;