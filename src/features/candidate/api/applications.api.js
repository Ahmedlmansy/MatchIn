import { api } from "@/services/axios/axiosInstance";

/**
 * Normalize application item - handles company being either a string or an object
 */
const normalizeApplication = (item) => {
  const companyName = typeof item.company === "string"
    ? item.company
    : item.company?.name ?? "Unknown Company";
    
  return {
    ...item,
    company: companyName,
  };
};

/**
 * Normalize applications response
 */
const normalizeApplicationsResponse = (response) => {
  const rawData = response?.data?.data ?? response?.data ?? response;
  
  if (!rawData) return [];
  
  const applications = Array.isArray(rawData) 
    ? rawData 
    : rawData.items ?? rawData.applications ?? [];
    
  return applications.map(normalizeApplication);
};

export const fetchApplicationsRequest = async (params = {}) => {
  const response = await api.get("/applications", { params });
  return normalizeApplicationsResponse(response);
};

export const fetchApplicationDetailsRequest = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}`);
  const data = response.data?.data ?? response.data;
  return normalizeApplication(data);
};

export const withdrawApplicationRequest = async (applicationId) => {
  const response = await api.post(`/applications/${applicationId}/withdraw`);
  return response.data?.data ?? response.data;
};