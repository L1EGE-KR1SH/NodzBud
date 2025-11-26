import { cn } from '@/lib/utils'
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall
} from '@stream-io/video-react-sdk'
import React, { useState, useEffect, useRef } from 'react'
import { SignLanguageButton } from './SignLanguageButton'
import { TranscriptionPanel } from './TranscriptionPanel'
import { useSignLanguageDetection } from '@/hooks/useSignLanguageDetection'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutList, Users } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import EndCallButton from './EndCallButton'
import Loader from './Loader'

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right'

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal')
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left')
  const [showParticipants, setShowParticipants] = useState(false)

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const router = useRouter();
  
  const call = useCall();
  const meetingId = call?.id || 'default-session';

  // ---------------- Sign Language Integration ----------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showSignLanguage, setShowSignLanguage] = useState(false);
  const [videoStatus, setVideoStatus] = useState<'searching' | 'found' | 'not-found'>('searching');
  
  const signLanguage = useSignLanguageDetection(meetingId);

  // Enhanced video element detection
  const findAndSetVideoElement = (): boolean => {
    const videos = document.querySelectorAll('video');
    console.log(`🔍 [Video Search] Found ${videos.length} video elements`);
    
    // Try to find the user's own video (usually has data-testid or specific class)
    let bestVideo: HTMLVideoElement | null = null;
    
    for (const video of videos) {
      const isReady = video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2;
      
      console.log(`📹 Video check:`, {
        width: video.videoWidth,
        height: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        className: video.className,
        id: video.id
      });
      
      if (isReady) {
        // Prefer videos that are playing
        if (!video.paused && !video.muted) {
          bestVideo = video as HTMLVideoElement;
          console.log('✅ Found best video (playing, not muted)');
          break;
        } else if (!bestVideo) {
          bestVideo = video as HTMLVideoElement;
          console.log('✅ Found acceptable video');
        }
      }
    }
    
    if (bestVideo) {
      videoRef.current = bestVideo;
      setVideoStatus('found');
      console.log('✅ Video element set:', {
        width: bestVideo.videoWidth,
        height: bestVideo.videoHeight,
        className: bestVideo.className
      });
      return true;
    }
    
    return false;
  };

  // Continuous video search when call is joined
  useEffect(() => {
    if (callingState !== CallingState.JOINED) {
      // Clear search if not joined
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
      setVideoStatus('searching');
      videoRef.current = null;
      return;
    }

    console.log('📞 Call joined, starting video search...');
    
    // Immediate first attempt after 1 second
    const initialTimeout = setTimeout(() => {
      if (!findAndSetVideoElement()) {
        // Start periodic search if not found immediately
        searchIntervalRef.current = setInterval(() => {
          if (findAndSetVideoElement()) {
            // Found it! Clear the interval
            if (searchIntervalRef.current) {
              clearInterval(searchIntervalRef.current);
              searchIntervalRef.current = null;
            }
          }
        }, 1000); // Check every second
        
        // Give up after 30 seconds
        setTimeout(() => {
          if (searchIntervalRef.current) {
            clearInterval(searchIntervalRef.current);
            searchIntervalRef.current = null;
            if (!videoRef.current) {
              setVideoStatus('not-found');
              console.error('❌ Video element not found after 30 seconds');
            }
          }
        }, 30000);
      }
    }, 1000);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
        searchIntervalRef.current = null;
      }
    };
  }, [callingState]);

 const handleSignLanguageToggle = async () => {
  console.log('🔘 Button clicked, isActive:', signLanguage.isActive);
  
  if (signLanguage.isActive) {
    signLanguage.stopDetection();
    setShowSignLanguage(false);
  } else {
    // 🆕 ADD THESE DEBUG LOGS
    console.log('🔍 Looking for video element...');
    const videos = document.querySelectorAll('video');
    console.log(`Found ${videos.length} video elements:`, videos);
    
    videos.forEach((v, i) => {
      console.log(`Video ${i}:`, {
        width: v.videoWidth,
        height: v.videoHeight,
        readyState: v.readyState,
        paused: v.paused,
        playing: !v.paused && v.readyState > 2
      });
    });
    
    // Find ready video
    let readyVideo = null;
    for (const video of videos) {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        readyVideo = video as HTMLVideoElement;
        console.log('✅ Found ready video:', readyVideo);
        break;
      }
    }
    
    if (!readyVideo) {
      console.error('❌ No ready video found');
      alert('Video not ready. Wait a moment and try again.');
      return;
    }
    
    console.log('🚀 Starting detection with video...');
    signLanguage.startDetection(readyVideo);
    setShowSignLanguage(true);
  }
};
  // -----------------------------------------------------------

  if (callingState !== CallingState.JOINED) return <Loader />

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />
      default:
        return <SpeakerLayout participantsBarPosition="right" />
    }
  }

  return (
    <section className='relative h-screen overflow-hidden pt-4 text-white'>
      <div className='relative flex size-full items-center justify-center'>
        <div className='flex size-full max-w-[1000px] items-center'>
          <CallLayout />
        </div>

        <div
          className={cn(
            "h-[calc(100vh-86px)] ml-2",
            showParticipants ? "block" : "hidden"
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Bottom Panel Controls */}
      <div className='fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap pb-5'>
        <CallControls onLeave={() => router.push('/')} />

        <SignLanguageButton
          isActive={signLanguage.isActive}
          onClick={handleSignLanguageToggle}
          disabled={videoStatus === 'searching' && !videoRef.current}
        />

        <DropdownMenu>
          <div className='flex items-center'>
            <DropdownMenuTrigger className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
              <LayoutList size={20} className='text-white' />
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent className='border-dark-1 bg-dark-1 text-white'>
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index, arr) => (
              <div key={index}>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                >
                  {item}
                </DropdownMenuItem>

                {index < arr.length - 1 && (
                  <DropdownMenuSeparator className='border-dark-1' />
                )}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button onClick={() => setShowParticipants(prev => !prev)}>
          <div className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
            <Users size={20} className='text-white' />
          </div>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>

      {/* Video Status Indicator (Debug - remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className='fixed top-20 right-4 bg-gray-900/90 text-white p-3 rounded-lg text-xs z-50'>
          <div>Video Status: <span className={
            videoStatus === 'found' ? 'text-green-400' :
            videoStatus === 'searching' ? 'text-yellow-400' :
            'text-red-400'
          }>{videoStatus}</span></div>
          <div>Detection: <span className={signLanguage.isActive ? 'text-green-400' : 'text-gray-400'}>
            {signLanguage.isActive ? 'Active' : 'Inactive'}
          </span></div>
          {signLanguage.error && (
            <div className='text-red-400 mt-1'>Error: {signLanguage.error}</div>
          )}
        </div>
      )}

      {/* Transcription Panel */}
      {showSignLanguage && signLanguage.isActive && (
        <TranscriptionPanel
          currentWord={signLanguage.currentWord}
          sentence={signLanguage.sentence}
          refinedText={signLanguage.refinedText}
          lastCharacter={signLanguage.lastCharacter}
          confidence={signLanguage.confidence}
          isConnected={signLanguage.isConnected}
          onClose={() => {
            signLanguage.stopDetection();
            setShowSignLanguage(false);
          }}
          onRefine={signLanguage.refineText}
        />
      )}
    </section>
  )
}

export default MeetingRoom