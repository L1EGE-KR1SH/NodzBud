'use client'
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react'

const Table = ({ title, description }: { title: string; description: string }) => (
  <div className="glassmorphism rounded-lg p-4 flex flex-col items-start gap-2">
    <h1 className="text-base font-medium lg:text-xl xl:min-w-32" style={{ color: '#000000' }}>{title}:</h1>
    <h1 className="text-base font-medium break-all" style={{ color: '#000000' }}>{description}</h1>
  </div>
)

const ColorPaletteSelector = ({ onColorChange, currentColor }: { onColorChange: (color: string) => void; currentColor: string }) => {
  const shades = ['#9B7EBD', '#778873', '#F1F3E0', '#8FABD4', '#696969'];
  const shadeNames = ['Purple', 'Sage', 'Cream', 'Blue', 'Charcoal'];

  return (
    <div className="glassmorphism rounded-lg p-4">
      <div className="flex flex-col items-start gap-2 mb-6">
        <h1 className="text-base font-medium lg:text-xl" style={{ color: '#000000' }}>Theme Color</h1>
      </div>
      <div className="flex flex-wrap gap-3">
        {shades.map((shade, idx) => (
          <button
            key={shade}
            onClick={() => onColorChange(shade)}
            className="relative transition-transform hover:scale-110"
            title={shadeNames[idx]}
          >
            <div
              className="w-12 h-12 rounded-full shadow-lg transition-all border-2"
              style={{
                backgroundColor: shade,
                borderColor: currentColor === shade ? 'white' : 'rgba(255,255,255,0.2)',
                boxShadow: currentColor === shade ? `0 0 12px ${shade}` : 'none',
              }}
            />
            <p className="text-xs mt-2 text-center" style={{ color: '#000000' }}>{shadeNames[idx]}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

const PersonalRoom = () => {
  const { user, isLoaded } = useUser();
  const [themeColor, setThemeColor] = useState('#696969');
  
  const shades = ['#9B7EBD', '#778873', '#F1F3E0', '#8FABD4', '#696969'];
  const darkerShades = ['#6B4E8D', '#4F5847', '#C8CAB8', '#5F7BA4', '#404040'];
  const lighterShades = ['#D4C5E2', '#A5B89D', '#F8FAF5', '#C7D9E8', '#888888'];
  
  const getButtonColor = () => {
    const index = shades.indexOf(themeColor);
    return index !== -1 ? darkerShades[index] : '#333333';
  };

  const getButtonHoverColor = () => {
    const index = shades.indexOf(themeColor);
    return index !== -1 ? lighterShades[index] : '#666666';
  };

  if (!isLoaded) {
    return <div className='text-white'>Loading...</div>;
  }

  if (!user) {
    return <div className='text-white'>Please sign in</div>;
  }

  const displayName = user.username || user.firstName || user.emailAddresses?.[0]?.emailAddress || 'User';
  const meetingId = user?.id;
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`

  const startRoom = async () => {}

  const handleCopyInvitation = () => {
    navigator.clipboard.writeText(meetingLink).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  }

  return (
    <section className='flex size-full flex-col gap-10 p-10' style={{ backgroundColor: themeColor }}>
      <h1 className='text-3xl font-bold' style={{ color: '#000000' }}>Personal Room</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title="Topic" description={`${displayName}'s Meeting Room`} />
        <Table title="Meeting ID" description={meetingId!} />
        <Table title="Invite Link" description={meetingLink} />
        <ColorPaletteSelector onColorChange={setThemeColor} currentColor={themeColor} />
      </div>
      <div className='flex gap-5'>
        <Button 
          className="glassmorphism transition-all duration-200 active:scale-95 active:brightness-110" 
          onClick={startRoom}
          style={{ backgroundColor: getButtonColor(), color: 'white' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = getButtonHoverColor();
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = getButtonColor();
            e.currentTarget.style.color = 'white';
          }}
        >
          Start Button
        </Button>
        <Button 
          className="glassmorphism transition-all duration-200 active:scale-95 active:brightness-110" 
          onClick={handleCopyInvitation}
          style={{ backgroundColor: getButtonColor(), color: 'white' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = getButtonHoverColor();
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = getButtonColor();
            e.currentTarget.style.color = 'white';
          }}
        >
          Copy Invitation
        </Button>
      </div>
    </section>
  )
}

export default PersonalRoom