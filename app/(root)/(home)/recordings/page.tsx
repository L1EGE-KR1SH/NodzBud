// Recordings.tsx
'use client'
import CallList from '@/components/CallList'
import React from 'react'
import { useTheme } from '@/context/ThemeContext'

const Recordings = () => {
  const { themeColor } = useTheme();
  
  return (
    <section className='flex size-full flex-col gap-10 text-white'>
      <div className="relative">
        <h1 
          className='text-4xl font-bold transition-colors duration-300'
          style={{ 
            color: themeColor,
            textShadow: `0 0 40px ${themeColor}30`
          }}
        >
          Recordings
        </h1>
        <div 
          className="absolute -bottom-2 left-0 h-1 rounded-full transition-all duration-300"
          style={{ 
            width: '120px',
            backgroundColor: themeColor,
            boxShadow: `0 0 20px ${themeColor}60`
          }}
        />
      </div>
      <CallList type='recordings' />
    </section>
  )
}

export default Recordings