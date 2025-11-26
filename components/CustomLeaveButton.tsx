"use client";

import { useCall } from '@stream-io/video-react-sdk';
import { PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';

const CustomLeaveButton = () => {
  const call = useCall();
  const router = useRouter();

  const handleLeave = async () => {
    try{
      await call?.leave();
      await call?.camera.disable();
      await call?.microphone.disable();
      call?.screenShare.disable();
      router.push('/');

    }catch(e)
    {
      console.error('LeaveError');
      toast.warning('LEAVE_ERROR_2345:CLOSE THE WINDOW!');
    }
  }
  return (
    <button onClick={handleLeave} className='bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2'>
      <PhoneOff size ={20}/>
    </button>
  )
}

export default CustomLeaveButton