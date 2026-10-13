import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchApplicationsRequest, 
  fetchApplicationDetailsRequest, 
  withdrawApplicationRequest 
} from "../api/applications.api";

// مفاتيح التخزين المؤقت (Query Keys) الخاصة بالطلبات
export const applicationKeys = {
  all: ["applications"],
  lists: () => [...applicationKeys.all, "list"],
  list: (filters) => [...applicationKeys.lists(), { filters }],
  details: () => [...applicationKeys.all, "detail"],
  detail: (id) => [...applicationKeys.details(), id],
};

/**
 * Hook لجلب قائمة الطلبات
 */
export const useApplicationsQuery = (filters = {}) => {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => fetchApplicationsRequest(filters),
    keepPreviousData: true,
  });
};

/**
 * Hook لجلب تفاصيل طلب واحد
 */
export const useApplicationDetailQuery = (applicationId) => {
  return useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: () => fetchApplicationDetailsRequest(applicationId),
    enabled: !!applicationId,
  });
};

/**
 * Hook لسحب طلب توظيف (Mutation)
 */
export const useWithdrawApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawApplicationRequest,
    onSuccess: () => {
      // إعادة تحديث قائمة الطلبات بعد السحب الناجح
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
};