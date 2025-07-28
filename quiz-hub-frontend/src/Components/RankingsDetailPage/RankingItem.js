import {Trophy, Medal, Award, Clock} from 'lucide-react';

const RankingItem = ({ ranking, index, currentUserId }) => {
  const isCurrentUser = ranking.userId === currentUserId;
  
  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`flex items-center p-4 rounded-lg border transition-all ${
        isCurrentUser 
          ? 'bg-blue-50 border-blue-300 shadow-md transform scale-105' 
          : 'bg-white border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-12 h-12 mr-4">
        {getRankIcon(index + 1)}
      </div>

      {/* Profile Picture */}
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
        <img 
          src={`data:image/jpeg;base64,${ranking.profilePicture}`}
          alt={ranking.username}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${ranking.username}&background=random&color=fff&size=48`;
          }}
        />
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex items-center">
          <h3 className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
            {ranking.username}
            {isCurrentUser && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                You
              </span>
            )}
          </h3>
        </div>
        <p className="text-sm text-gray-600">{ranking.email}</p>
      </div>

      {/* Score */}
      <div className="text-center mr-4">
        <div className={`text-xl font-bold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
          {ranking.score}
        </div>
        <div className="text-sm text-gray-600">points</div>
      </div>

      {/* Time */}
      <div className="text-center">
        <div className={`flex items-center text-lg font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-700'}`}>
          <Clock className="h-4 w-4 mr-1" />
          {formatTime(ranking.timeTakenSeconds)}
        </div>
        <div className="text-sm text-gray-600">time</div>
      </div>
    </div>
  );
};

export default RankingItem;