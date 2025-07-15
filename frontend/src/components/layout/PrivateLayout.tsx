import { routes } from "@/utils/constants/routes";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { NavBar } from "../NavBar/NavBar";
import { useVerifyToken } from "@/hooks/queries/useAuth";
import Loader from "../ui/loader";

export function PrivateLayout() {
  const navigate = useNavigate();
  const { data, isPending } = useVerifyToken();
  console.log(data," data");

  useEffect(() => {
    // const token = Cookie.get("accessToken");
    if (data?.data?.status !==  200) {
      navigate(routes.auth.signIn);
    }
  }, [navigate, data]);

  if (isPending) {
    return <Loader />
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
