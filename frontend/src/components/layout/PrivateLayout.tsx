import { Outlet, useNavigate } from "react-router-dom";
import { NavBar } from "../NavBar/NavBar";
import { useVerifyToken } from "@/hooks/queries/useAuth";
import Loader from "../ui/loader";
import { useEffect } from "react";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";
import { routes } from "@/utils/constants/routes";

export function PrivateLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // const token = Cookie.get("accessToken");
    const token = LocalStorageGetItem("userData")?.accessToken;
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
