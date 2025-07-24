import React from 'react';

const QuizBox = ({ quiz }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
      style={{ backgroundColor: '#F5F5F5' }}
    >
      {/* Quiz Name */}
      <h3 className="text-xl font-bold mb-2" style={{ color: '#495464' }}>
        {quiz.name}
      </h3>
      
      {/* Quiz Description */}
      <p className="text-sm mb-4 line-clamp-3" style={{ color: '#495464', opacity: 0.8 }}>
        {quiz.description}
      </p>
      
      {/* Quiz Details */}
      <div className="flex flex-wrap gap-2">
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#495464', color: '#FFFFFF' }}
        >
          {quiz.category}
        </span>
        
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: quiz.difficulty === 'Easy' ? '#4CAF50' : 
                           quiz.difficulty === 'Medium' ? '#FF9800' : '#F44336',
            color: '#FFFFFF'
          }}
        >
          {quiz.difficulty}
        </span>
        
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#E8E8E8', color: '#495464' }}
        >
          {quiz.numberOfQuestions} Questions
        </span>
        
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#E8E8E8', color: '#495464' }}
        >
          {quiz.timeToFinish} min
        </span>
      </div>
    </div>
  );
};

export default QuizBox;