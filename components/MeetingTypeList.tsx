"use client"
import { useState } from "react"
import HomeCard from "./HomeCard"
import { useRouter } from "next/navigation"
import MeetingModal from "./MeetingModal"
import { useUser } from "@clerk/nextjs"
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk"
import { toast } from "sonner"

const MeetingTypeList = () => {
  const router=useRouter()
  const[meetingState , setMeetingState]=useState<'isSchdeuleMeeting'|'isJoinigMeeting'|'isInstantMeeting'| undefined>();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
      dateTime : new Date(),
      description : '',
      link: ''
    })
  const [callDetails, setcallDetails] = useState<Call>()
  const createMeeting = async () => {
    if(!client || !user) return;

    try{
      if(!values.dateTime){
        toast.error("Please select a date and time")
        return
      }
      const id =  crypto.randomUUID();
      const call = client.call('default', id);

      if(!call)  throw new Error("failed")

      const startsAt = values.dateTime.toISOString() || 
      new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data : {
          starts_at: startsAt,
          custom: {
            description
          }
        }
      })

     setcallDetails(call);
     if(!values.description){
      router.push(`/meeting/${call.id}`)
      toast.success("MEETING CREATED SUCCESSFULLY :)")
     }
    }catch(error){
      console.log(error);
      toast.error("FAILED TO CREATE MEETING")
    }
  }
  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard 
      img="/icons/add-meeting.svg"
      title="New Meeting"
      description="Start a new meeting"
      handleClick={()=>setMeetingState('isInstantMeeting')}
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

    
      <MeetingModal 
      isOpen = {meetingState === 'isInstantMeeting'}
      onClose ={() => setMeetingState(undefined)}
      title = "Start an instant Meeting"
      className = "text-center"
      buttonText = "Start Meeting"
      handleClick = {createMeeting}
      />
    </section>

  )
}

export default MeetingTypeList