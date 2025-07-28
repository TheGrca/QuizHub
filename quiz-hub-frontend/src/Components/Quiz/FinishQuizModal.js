import { CheckCircle } from 'lucide-react';

const FinishQuizModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-100 rounded-full p-3">
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Finish Quiz?
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to finish the quiz? You cannot change your answers after submitting.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Quiz
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Finish Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishQuizModal;