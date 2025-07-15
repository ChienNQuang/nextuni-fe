"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loading } from "@/components/ui/loading"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      switch (user.role) {
        case "Administrator":
          router.replace("/admin/universities")
          break
        case "Staff":
          router.replace("/staff/articles")
          break
        case "Student":
          router.replace("/student")
          break
        default:
          router.replace("/login")
      }
    } else if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  return <Loading />
}
