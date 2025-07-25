const MultipleChoiceQuestion = ({ question, options, onAnswer }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionToggle = (index) => {
    const newSelected = selectedOptions.includes(index)
      ? selectedOptions.filter(i => i !== index)
      : [...selectedOptions, index];
    
    setSelectedOptions(newSelected);
    if (onAnswer) onAnswer(newSelected);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{question}</h3>
      <div className="space-y-3">
        {options.map((option, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.includes(index)}
              onChange={() => handleOptionToggle(index)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
              selectedOptions.includes(index)
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            }`}>
              {selectedOptions.includes(index) && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-gray-700 ${selectedOptions.includes(index) ? 'font-medium' : ''}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};