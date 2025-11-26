"use client"
import { useState } from "react"
import HomeCard from "./HomeCard"
import { useRouter } from "next/navigation"
import MeetingModal from "./MeetingModal"
import { useUser } from "@clerk/nextjs"
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk"
import { toast } from "sonner"
import { Textarea } from "./ui/textarea"
import ReactDatePicker from 'react-datepicker';
import { Input } from "./ui/input"

const MeetingTypeList = () => {
  const router=useRouter()
  const[meetingState , setMeetingState]=useState<'isSchdeuleMeeting'|'isJoiningMeeting'|'isInstantMeeting'| undefined>();
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
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`
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
      handleClick={()=>setMeetingState('isJoiningMeeting')}
      className=" bg-green-400"/>

      {!callDetails ?(
        <MeetingModal 
        isOpen = {meetingState === 'isSchdeuleMeeting'}
        onClose ={() => setMeetingState(undefined)}
        title = "Create Meeting"
        handleClick = {createMeeting}>
          <div className="flex flex-col gap-2.5 ">
            <label className="text-base text-normal leading-[22px] text-sky-200">
              Add A Description 
            </label>
            <Textarea  className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0
            " onChange={(e) => setValues({...values , description:e.target.value})}/>
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px] text-sky-200">
              Select Date and Time 
            </label>
            <ReactDatePicker
            selected={values.dateTime}
            onChange={(date) => setValues({...values,
              dateTime : date!
            })} 
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat={'MMMM d, yyyy h:mm a'}
            className="w-full rounded bg-dark-3 p-2 focus:outline-none"/>
          </div>
        </MeetingModal>
      ):(
        <MeetingModal 
        isOpen = {meetingState === 'isSchdeuleMeeting'}
        onClose ={() => setMeetingState(undefined)}
        title = "Meeting Created"
        className = "text-center"
        handleClick = {() => {
          navigator.clipboard.writeText(meetingLink);
          toast.info("Link Copied")
        }}
        image = "/icons/checked.svg"
        buttonIcon="/icons/copy.svg"
        buttonText = "Copy Link"
      />
      )}
      <MeetingModal 
      isOpen = {meetingState === 'isInstantMeeting'}
      onClose ={() => setMeetingState(undefined)}
      title = "Start an Instant Meeting"
      className = "text-center"
      buttonText = "Start Meeting"
      handleClick = {createMeeting}
      />
      <MeetingModal 
      isOpen = {meetingState === 'isJoiningMeeting'}
      onClose ={() => setMeetingState(undefined)}
      title = "Type the Link here"
      className = "text-center"
      buttonText = "Join Meeting"
      handleClick = {()=>router.push(values.link)}
      >
        <Input 
        placeholder="Meeting Link"
        onChange={(e)=>setValues({...values,link:e.target.value})}/> 
      </MeetingModal>
    </section>

  )
}

export default MeetingTypeList