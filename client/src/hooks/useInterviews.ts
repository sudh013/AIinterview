import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export function useInterviews() {
  return useQuery({
    queryKey: ["/api/interviews/recent"],
  });
}

export function useInterviewDetails(interviewId: number) {
  return useQuery({
    queryKey: [`/api/interviews/${interviewId}`],
    enabled: !!interviewId,
  });
}

export function useSendInterviewInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { applicantEmail: string; jobId: number }) => {
      const response = await apiRequest("POST", "/api/interviews/invite", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/recent"] });
    },
  });
}
