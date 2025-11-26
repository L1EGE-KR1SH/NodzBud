export const SignLanguageButton = ({ 
  isActive, 
  onClick 
}: { 
  isActive: boolean; 
  onClick: () => void; 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-2xl w-12 h-12 transition-colors ${
        isActive 
          ? 'bg-blue-500 hover:bg-blue-600' 
          : 'bg-[#19232d] hover:bg-[#4c535b]'
      }`}
      aria-label={isActive ? 'Stop Sign Language' : 'Start Sign Language'}
    >
      <span className="text-2xl">👋</span>
    </button>
  );
};