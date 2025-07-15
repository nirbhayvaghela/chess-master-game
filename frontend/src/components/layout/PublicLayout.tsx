import { useVerifyToken } from "@/hooks/queries/useAuth";
import { routes } from "@/utils/constants/routes";
import cookie from "js-cookie";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Loader from "../ui/loader";

export function PublicLayout() {
  const navigate = useNavigate();

  const { data, isPending } = useVerifyToken();

  useEffect(() => {
    // const token = Cookie.get("accessToken");
    if (data?.data?.status ===  200) {
      navigate(routes.dashboard);
    }
  }, [navigate, data]);

  if (isPending) {
    return <Loader />
  }

  // useEffect(() => {
  //   const token = cookie.get("accessToken");
  //   if (token) {
  //     navigate(routes.dashboard); // Redirect logged-in users away from public-only routes
  //   }
  // }, [navigate]);

  return <Outlet />;
}
