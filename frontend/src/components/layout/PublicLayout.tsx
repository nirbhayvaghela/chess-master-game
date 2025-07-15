import { routes } from "@/utils/constants/routes";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LocalStorageGetItem } from "@/utils/helpers/storageHelper";

export function PublicLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // const token = Cookie.get("accessToken");
    const token = LocalStorageGetItem("userData")?.accessToken;
    if (token) {
      navigate(routes.dashboard);
    }
  }, [navigate])

  return <Outlet />;
}
