import { api } from "@/services/axios/axiosInstance";

export const fetchApplicationsRequest = async (params = {}) => {
  const response = await api.get("/applications", { params });
  const rawData = response.data?.data ?? response.data;
  
  // التأكد من إرجاع مصفوفة دائماً لتجنب خطأ .filter
  if (Array.isArray(rawData)) return rawData;
  if (Array.isArray(rawData?.items)) return rawData.items;
  if (Array.isArray(rawData?.applications)) return rawData.applications;
  
  return [];
};

export const fetchApplicationDetailsRequest = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}`);
  return response.data?.data ?? response.data;
};

export const withdrawApplicationRequest = async (applicationId) => {
  const response = await api.post(`/applications/${applicationId}/withdraw`);
  return response.data?.data ?? response.data;
};