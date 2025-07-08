/* eslint-disable @typescript-eslint/no-explicit-any */

import { routes } from "../constants/routes";

export const LocalStorageGetItem = (name: any) => {
  if (typeof window !== "undefined" && localStorage) {
    const user = localStorage.getItem(name);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const LocalStorageSetItem = (name: any, value: any) => {
  if (typeof window !== "undefined" && localStorage) {
    localStorage.setItem(name, JSON.stringify(value));
    return true;
  }
  return false;
};

export const LocalStorageRemoveItem = (name: any) => {
  if (typeof window !== "undefined" && localStorage) {
    localStorage.removeItem(name);
    return true;
  }
  return false;
};

// export const LogOutHandler = (router: any) => {
//   localStorage.clear();
//   router.push(routes.auth.signIn);
// };

export const SessionStorageGetItem = (name: any) => {
  if (typeof window !== "undefined" && sessionStorage) {
    const item = sessionStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  }
  return null;
};

export const SessionStorageSetItem = (name: any, value: any) => {
  if (typeof window !== "undefined" && sessionStorage) {
    sessionStorage.setItem(name, JSON.stringify(value));
    return true;
  }
  return false;
};

export const SessionStorageRemoveItem = (name: any) => {
  if (typeof window !== "undefined" && sessionStorage) {
    sessionStorage.removeItem(name);
    return true;
  }
  return false;
};

// export const SessionLogOutHandler = (router: any) => {
//   sessionStorage.clear();
//   router.push(routes.auth.signIn);
// };
