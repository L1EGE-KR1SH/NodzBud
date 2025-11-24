import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export const useGetCalls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const client = useStreamVideoClient();
  const { user } = useUser();

  useEffect(() => {
    const loadCalls = async () => {
      if (!client || !user?.id) {
        console.log("Client or user not ready:", { client: !!client, userId: user?.id });
        return;
      }

      setIsLoading(true);
      try {
        const { calls } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: -1 }],
          filter_conditions: {
            starts_at: { $exists: true },
            $or: [
              { created_by_user_id: user.id },
              { members: { $in: [user.id] } },
            ],
          },
        });

        console.log("Fetched calls:", calls);
        setCalls(calls);
      } catch (error) {
        console.error("Error fetching calls:", error);
        setCalls([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, user?.id]);

  const now = new Date();

  const endedCalls = calls.filter(({ state }: Call) => {
    const startsAt = state?.startsAt ? new Date(state.startsAt) : null;
    const endedAt = state?.endedAt ? new Date(state.endedAt) : null;

    // A call is ended if it has started and ended, or if it started in the past
    return (startsAt && startsAt < now) || !!endedAt;
  });

  const upcomingCalls = calls.filter(({ state }: Call) => {
    const startsAt = state?.startsAt ? new Date(state.startsAt) : null;
    // A call is upcoming if it starts in the future
    return startsAt && startsAt > now;
  });

  console.log("All calls:", calls.length);
  console.log("Ended calls:", endedCalls.length);
  console.log("Upcoming calls:", upcomingCalls.length);

  return {
    endedCalls,
    upcomingCalls,
    callRecordings: calls,
    isLoading,
  };
};