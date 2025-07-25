const TextInputQuestion = ({ question, placeholder, onAnswer }) => {
  const [answer, setAnswer] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAnswer(value);
    if (onAnswer) onAnswer(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{question}</h3>
      <textarea
        value={answer}
        onChange={handleInputChange}
        placeholder={placeholder || "Type your answer here..."}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={3}
      />
    </div>
  );
};