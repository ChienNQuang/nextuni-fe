"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { AuthService, type User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      AuthService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const tokens = await AuthService.login(email, password)
    localStorage.setItem("token", tokens.accessToken)

    const currentUser = await AuthService.getCurrentUser()
    setUser(currentUser)
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
