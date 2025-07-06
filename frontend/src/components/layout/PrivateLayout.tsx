import { routes } from "@/utils/constants/routes";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { NavBar } from "../NavBar/NavBar";

export function PrivateLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookie.get("token");
    if (!token) {
      navigate(routes.auth.signIn);
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
