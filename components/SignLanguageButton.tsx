export const SignLanguageButton = ({
  isActive,
  onClick,
  disabled = false
}: {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-2xl w-12 h-12 transition-colors ${isActive
        ? 'bg-blue-500 hover:bg-blue-600'
        : 'bg-[#19232d] hover:bg-[#4c535b]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isActive ? 'Stop Sign Language' : 'Start Sign Language'}
    >
      <span className="text-2xl">👋</span>
    </button>
  );
};