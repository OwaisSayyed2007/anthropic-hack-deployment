import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: str;
  name?: string;
  role: string;
  role_finalized: boolean;
  picture?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => {
        if (token) localStorage.setItem("auth-token", token);
        else localStorage.removeItem("auth-token");
        set({ token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem("auth-token");
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
