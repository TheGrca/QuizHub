import { useState } from "react";

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

export default EditableTextInputQuestion;