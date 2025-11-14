"use client"
import { useState } from "react"
import HomeCard from "./HomeCard"
import { useRouter } from "next/navigation"

const MeetingTypeList = () => {
  const router=useRouter()
  const[meetingState , setMeetingState]=useState<'isSchdeuleMeeting'|'isJoinigMeeting'|'isInstantMeeting'| undefined>()
  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard 
      img="/icons/add-meeting.svg"
      title="New Meeting"
      description="Start a new meeting"
      handleClick={()=>setMeetingState('isJoinigMeeting')}
      className=" bg-orange-400"
      />
      <HomeCard 
      img="/icons/schedule.svg"
      title="Schedule Meeting"
      description="Plan your meeting"
      handleClick={()=>setMeetingState('isSchdeuleMeeting')}
      className=" bg-blue-500"
      />
      <HomeCard
      img="/icons/recordings.svg"
      title="View Recordings"
      description="Check out you recordings"
      handleClick={()=>router.push('/recordings')}
      className=" bg-purple-500"
       />
      <HomeCard 
      img="/icons/join-meeting.svg"
      title="Join Meeting"
      description="Via Invitation Link"
      handleClick={()=>setMeetingState}
      className=" bg-green-400"/>

    
    
    </section>

  )
}

export default MeetingTypeList