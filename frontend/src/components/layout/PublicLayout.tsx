import { routes } from "@/utils/constants/routes";
import cookie from "js-cookie";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export function PublicLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = cookie.get("token");
    if (token) {
      navigate(routes.dashboard); // Redirect logged-in users away from public-only routes
    }
  }, [navigate]);

  return <Outlet />;
}
