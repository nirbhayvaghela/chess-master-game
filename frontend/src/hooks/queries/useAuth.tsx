import { SignInSchemaType, SignUpSchemaType } from "@/schemas/auth.schema";
import { logOut, signIn, signUp, verifyToken } from "@/services/auth.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useSignIn = () => {
  const response = useMutation({
    mutationKey: ["useSignIn"],
    mutationFn: async (body: SignInSchemaType) => {
      const res = await signIn(body);
      return res;
    },
  });
  return response;
};

export const useSignUp = () => {
  const response = useMutation({
    mutationKey: ["useSignUp"],
    mutationFn: async (body: SignUpSchemaType) => {
      const res = await signUp(body);
      return res;
    },
  });
  return response;
};

export const useLogOut = () => {
  const response = useMutation({
    mutationKey: ["useLogOut"],
    mutationFn: async (body: { userId: number }) => {
      const res = await logOut(body);
      return res;
    },
  });
  return response;
};

export const useVerifyToken = () => {
  const response = useQuery({
    queryKey: ["useVerifyToken"],
    queryFn: async () => {
      const res = await verifyToken();
      return res;
    }
  });
  return response;
}