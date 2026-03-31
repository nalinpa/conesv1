import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";

import { moderationService } from "@/lib/services/moderationService";
import { useSession } from "@/lib/providers/SessionProvider";

export function useReportContent() {
  return useMutation({
    mutationFn: moderationService.reportReview,
    onError: (error) => {
      Sentry.captureException(error);
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  return useMutation({
    mutationFn: moderationService.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers", uid] });
    },
    onError: (error) => {
      Sentry.captureException(error);
    },
  });
}

export function useBlockedUsers() {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  return useQuery({
    queryKey: ["blockedUsers", uid],
    queryFn: () => moderationService.getMyBlockedUids(uid!),
    enabled: !!uid,
    initialData: [],
    staleTime: 1000 * 60 * 5,
  });
}
