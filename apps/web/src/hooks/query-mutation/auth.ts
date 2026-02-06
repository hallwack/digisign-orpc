import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import type { LoginSchema, RegisterSchema } from "@/routes/_auth/-types";

export function useLoginFn() {
  const navigate = useNavigate();
  const mutation = useMutation<unknown, Error, LoginSchema, unknown>({
    mutationKey: ["login"],
    mutationFn: async (json) => {
      const { data, error } = await authClient.signIn.email({
        email: json.email,
        password: json.password,
      });

      if (error) {
        console.error("Login error:", error);
        throw new Error(error.message);
      }

      return data;
    },

    onSuccess: async () =>
      navigate({
        to: "/dashboard",
      }),
    onError: ({ message }) => toast.error(message ?? "Login failed"),
  });

  return mutation;
}

export function useRegisterFn() {
  const navigate = useNavigate();
  const mutation = useMutation<unknown, Error, RegisterSchema, unknown>({
    mutationKey: ["register"],
    mutationFn: async (json) => {
      const { data, error } = await authClient.signUp.email({
        email: json.email,
        password: json.password,
        name: json.fullName,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },

    onSuccess: async () =>
      navigate({
        to: "/login",
      }),
    onError: ({ message }) => toast.error(message ?? "Register failed."),
  });

  return mutation;
}

export function useLogoutFn() {
  const navigate = useNavigate();
  const mutation = useMutation<unknown, Error, unknown, unknown>({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const response = await authClient.signOut();

      return response;
    },

    onSuccess: async () =>
      navigate({
        to: "/login",
      }),
    onError: () => toast.error("Logout failed."),
  });

  return mutation;
}
