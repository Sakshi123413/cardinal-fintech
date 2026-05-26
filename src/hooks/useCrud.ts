import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/services/api";
import { toast } from "sonner";

export function useList<T>(key: string, path: string) {
  return useQuery<T[]>({
    queryKey: [key],
    queryFn: async () => {
      const { data } = await api.get(path);
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
}

export function useCrudMutations(key: string, path: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [key] });

  const create = useMutation({
    mutationFn: async (payload: any) => (await api.post(path, payload)).data,
    onSuccess: () => { invalidate(); toast.success("Created successfully"); },
    onError: (e) => toast.error(apiError(e, "Failed to create")),
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: number | string; payload: any }) =>
      (await api.put(`${path}/${id}`, payload)).data,
    onSuccess: () => { invalidate(); toast.success("Updated successfully"); },
    onError: (e) => toast.error(apiError(e, "Failed to update")),
  });

  const remove = useMutation({
    mutationFn: async (id: number | string) => (await api.delete(`${path}/${id}`)).data,
    onSuccess: () => { invalidate(); toast.success("Deleted successfully"); },
    onError: (e) => toast.error(apiError(e, "Failed to delete")),
  });

  return { create, update, remove };
}
