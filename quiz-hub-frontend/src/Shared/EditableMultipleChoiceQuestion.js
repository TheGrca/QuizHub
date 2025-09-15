import { useState } from "react";
const EditableMultipleChoiceQuestion = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState(question?.correctAnswers || []);
  const [points, setPoints] = useState(question?.points || 1);
  const [errors, setErrors] = useState({});

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    // Clear option error when user starts typing
    if (errors[`option${index}`] && value.trim()) {
      const newErrors = { ...errors };
      delete newErrors[`option${index}`];
      setErrors(newErrors);
    }
  };

  const handleCorrectAnswerToggle = (index) => {
    const newCorrectAnswers = correctAnswers.includes(index)
      ? correctAnswers.filter(i => i !== index)
      : [...correctAnswers, index];
    setCorrectAnswers(newCorrectAnswers);
    
    // Clear correct answers error when user selects an answer
    if (errors.correctAnswers && newCorrectAnswers.length > 0) {
      const newErrors = { ...errors };
      delete newErrors.correctAnswers;
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }
    
    options.forEach((option, index) => {
      if (!option.trim()) {
        newErrors[`option${index}`] = `Option ${index + 1} is required`;
      }
    });
    
    if (correctAnswers.length === 0) {
      newErrors.correctAnswers = 'Please select at least one correct answer';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        type: 'MultipleAnswerQuestion',
        text: questionText,
        options,
        correctAnswers,
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options (Check all correct answers)</label>
        {options.map((option, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center">
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
                className={`flex-1 p-2 border rounded focus:ring-2 ${
                  errors[`option${index}`] 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder={`Option ${index + 1}`}
              />
            </div>
            {errors[`option${index}`] && (
              <p className="text-red-500 text-sm mt-1 ml-8">{errors[`option${index}`]}</p>
            )}
          </div>
        ))}
        {errors.correctAnswers && (
          <p className="text-red-500 text-sm mt-2">{errors.correctAnswers}</p>
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

export default EditableMultipleChoiceQuestion;