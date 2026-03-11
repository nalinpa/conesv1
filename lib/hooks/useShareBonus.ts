import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { shareService } from "@/lib/services/share/shareService";
import { completionService } from "@/lib/services/completionService";

export function useShareBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      previewUri,
      uid,
      coneId,
    }: {
      previewUri: string;
      uid: string | null;
      coneId: string;
    }) => {
      // 1. Trigger the Native Share Sheet
      const res = await shareService.shareImageUriAsync(previewUri);

      if (!res.ok) throw new Error("Share cancelled or failed");

      // 2. If successful, log it in Firebase
      if (uid) {
        await completionService.confirmShareBonus({
          uid,
          coneId,
          platform: "share-frame",
        });
      }

      return res;
    },
    onSuccess: () => {
      // 3. Invalidate the caches automatically when the mutation succeeds!
      queryClient.invalidateQueries({ queryKey: ["myCompletions"] });
      queryClient.invalidateQueries({ queryKey: ["appData"] });
    },
    onError: (error) => {
      Sentry.captureException(error);
    },
  });
}
