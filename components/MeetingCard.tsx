'use client'
import { useTheme } from '@/context/ThemeContext'
import Image from 'next/image'

interface MeetingCardProps {
  icon: string;
  title: string;
  date: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  handleClick: () => void;
  link: string;
  buttonText: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText
}: MeetingCardProps) => {
  const { themeColor } = useTheme();
  
  return (
    <div 
      className="group relative flex flex-col justify-between rounded-2xl p-6 min-h-[280px] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${themeColor}25 0%, ${themeColor}08 100%)`,
        border: `1px solid ${themeColor}40`,
        boxShadow: `0 4px 20px ${themeColor}15`
      }}
    >
      {/* Animated background gradient on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${themeColor}30, transparent 70%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-5">
        {/* Icon with background */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ 
            backgroundColor: `${themeColor}25`,
            border: `1px solid ${themeColor}30`
          }}
        >
          <Image 
            src={icon} 
            alt="meeting" 
            width={24} 
            height={24}
            className="object-contain"
          />
        </div>
        
        {/* Meeting Info */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white line-clamp-1 group-hover:text-opacity-90 transition-all">
            {title}
          </h1>
          <p className="text-sm font-medium" style={{ color: `${themeColor}cc` }}>
            {date}
          </p>
        </div>

        {/* Avatars section - keep your existing avatar implementation */}
        <div className="flex items-center gap-2 mt-2">
          {/* Add your existing avatar rendering logic here */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex gap-3 mt-6">
        {!isPreviousMeeting && (
          <button
            onClick={handleClick}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
            style={{ 
              backgroundColor: themeColor,
              boxShadow: `0 4px 15px ${themeColor}40`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${themeColor}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 15px ${themeColor}40`;
            }}
          >
            {buttonIcon1 && (
              <Image src={buttonIcon1} alt="icon" width={18} height={18} />
            )}
            {buttonText}
          </button>
        )}
        
        <button
          onClick={() => navigator.clipboard.writeText(link)}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
          style={{ 
            borderWidth: '1px',
            borderColor: `${themeColor}60`,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${themeColor}25`;
            e.currentTarget.style.borderColor = themeColor;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = `${themeColor}60`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span className="hidden sm:inline">Copy Link</span>
        </button>
      </div>
    </div>
  )
}

export default MeetingCard