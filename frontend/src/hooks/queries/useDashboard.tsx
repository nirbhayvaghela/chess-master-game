import { getDashboardStats } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardDetails = () => {
  const response = useQuery({
    queryKey: ["useGetDashboardDetails"],
    queryFn: async () => {
      const res = await getDashboardStats();
      return res.data.data;
    },
  });
  return response;
};
