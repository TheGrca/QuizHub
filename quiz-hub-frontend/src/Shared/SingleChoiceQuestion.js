import { useState } from 'react';

const SingleChoiceQuestion = ({ question, options, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
    if (onAnswer) onAnswer(index);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{question}</h3>
      <div className="space-y-3">
        {options.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="single-choice"
              value={index}
              checked={selectedOption === index}
              onChange={() => handleOptionSelect(index)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              selectedOption === index 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedOption === index && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className={`text-gray-700 ${selectedOption === index ? 'font-medium' : ''}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};