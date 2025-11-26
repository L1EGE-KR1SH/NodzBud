"use client";
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk'
import React from 'react'
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
    const call = useCall();
    const { useLocalParticipant } = useCallStateHooks();
    const LocalParticipant = useLocalParticipant();
    const router = useRouter();



    const isMeetingOwner = LocalParticipant && call?.state.createdBy && LocalParticipant.userId === call.state.createdBy.id;
    if(!isMeetingOwner) return null;
    const handleEnd = async () => {
    try {
      await call.endCall();
      await call.camera?.disable();
      await call.microphone?.disable();
      router.push('/');
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  };
    return(
        <Button onClick={handleEnd} className='bg-red-500'>Close Meeting</Button>
    )
}

export default EndCallButton