'use client';
import { useGetCalls } from '@/hooks/useGetCalls';
import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import MeetingCard from './MeetingCard';
import Loader from './Loader';
import { useTheme } from '@/context/ThemeContext';

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();
  const router = useRouter();
  const { themeColor } = useTheme();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case 'ended':
        return endedCalls;
      case 'recordings':
        return recordings;
      case 'upcoming':
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case 'ended':
        return 'No Previous Calls';
      case 'recordings':
        return 'No Recordings';
      case 'upcoming':
        return 'No Upcoming Calls';
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const callData = await Promise.all(
          callRecordings.map((meeting) => meeting.queryRecordings())
        );
        const recordings = callData
          .filter((call) => call.recordings && call.recordings.length > 0)
          .flatMap((call) => call.recordings);
        setRecordings(recordings);
      } catch (error) {
        console.error('Error fetching recordings:', error);
      }
    };

    if (type === 'recordings') {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  if (isLoading) return <Loader />;

  return (
    <div className="w-full">
      {calls && calls.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {calls.map((meeting: Call | CallRecording) => {
            const isRecording = type === 'recordings';
            const meetingId = (meeting as Call).id;
            const recordingUrl = (meeting as CallRecording).url;

            return (
              <MeetingCard
                key={meetingId || recordingUrl}
                icon={
                  type === 'ended'
                    ? '/icons/previous.svg'
                    : type === 'upcoming'
                      ? '/icons/upcoming.svg'
                      : '/icons/recordings.svg'
                }
                title={
                  (meeting as Call).state?.custom?.description?.substring(0, 25) ||
                  (meeting as CallRecording).filename?.substring(0, 20) ||
                  'Personal Meeting'
                }
                date={
                  (meeting as Call).state?.startsAt?.toLocaleString() ||
                  (meeting as CallRecording).start_time?.toLocaleString() ||
                  new Date().toLocaleString()
                }
                isPreviousMeeting={type === 'ended'}
                buttonIcon1={isRecording ? '/icons/play.svg' : undefined}
                handleClick={
                  isRecording
                    ? () => {
                        if (recordingUrl) {
                          router.push(recordingUrl);
                        }
                      }
                    : () => {
                        if (meetingId) {
                          router.push(`/meeting/${meetingId}`);
                        }
                      }
                }
                link={
                  isRecording
                    ? recordingUrl || ''
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}`
                }
                buttonText={isRecording ? 'Play' : 'Start'}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300"
            style={{ 
              backgroundColor: `${themeColor}15`,
              border: `2px dashed ${themeColor}40`
            }}
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={themeColor}
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h2 
            className="text-2xl font-bold mb-2 transition-colors duration-300"
            style={{ color: themeColor }}
          >
            {noCallsMessage}
          </h2>
          <p className="text-gray-400 text-center max-w-md">
            {type === 'upcoming' 
              ? 'Schedule a new meeting to see it appear here'
              : type === 'ended'
              ? 'Your previous meetings will appear here'
              : 'Your recorded meetings will appear here'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CallList;