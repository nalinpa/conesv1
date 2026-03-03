import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completionService } from "@/lib/services/completionService";

export function useConeCompletionMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: Parameters<typeof completionService.completeCone>[0]) => {
      const res = await completionService.completeCone(args);
      if (!res.ok) throw new Error(res.err || "Failed to complete cone");
      return res;
    },
    onSuccess: (_, args) => {
      const uid = args.uid;
      const coneId = args.cone.id;

      // 1. Instantly invalidate the global completions list
      // This ensures the Set in useMyCompletions updates across the whole app
      queryClient.invalidateQueries({ queryKey: ["myCompletions", uid] });
      
      // 2. Invalidate the specific volcano details (to update stats like completion counts)
      queryClient.invalidateQueries({ queryKey: ["cone", coneId] });

      // 3. Invalidate global app data (badges/progress tabs)
      queryClient.invalidateQueries({ queryKey: ["appData"] });
    }
  });

  const completeCone = async (args: Parameters<typeof completionService.completeCone>[0]) => {
    try {
      await mutation.mutateAsync(args);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, err: error.message };
    }
  };

  return { 
    completeCone, 
    loading: mutation.isPending,
    err: mutation.error?.message ?? null, 
    reset: mutation.reset 
  };
}