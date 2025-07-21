"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { Chatbot } from "@/components/chatbot"
import { Home, Building2, Calendar, BookOpen, Menu, X, LogOut, User } from "lucide-react"

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedArticleSource, setSelectedArticleSource] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleUniversitiesClick = () => {
    if (!selectedRegion) {
      setSelectedRegion("North")
    }
    router.push(`/student/universities?region=${selectedRegion || 0}`)
  }

  const handleAdmissionInfoClick = () => {
    if (!selectedArticleSource) {
      setSelectedArticleSource("system")
    }
    router.push(`/student/admission-info?source=${selectedArticleSource || "system"}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/student" className="text-2xl font-bold text-blue-600">
                NextUni
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/student"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/student" ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Home className="inline-block w-4 h-4 mr-2" />
                Home
              </Link>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={handleUniversitiesClick} className="text-gray-700 hover:text-blue-600">
                  <Building2 className="inline-block w-4 h-4 mr-2" />
                  Universities
                </Button>
              </div>

              <Link
                href="/student/events"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname.startsWith("/student/events")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Events
              </Link>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={handleAdmissionInfoClick}
                  className="text-gray-700 hover:text-blue-600"
                >
                  <BookOpen className="inline-block w-4 h-4 mr-2" />
                  Admission Info
                </Button>
              </div>

              <div>
                <Button variant="ghost" onClick={() => router.push('/student/my-events')} className="text-gray-700 hover:text-blue-600">
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  My Events
                </Button>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-blue-600">NextUni</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            <Link
              href="/student"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="mr-3 h-6 w-6" />
              Home
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                handleUniversitiesClick()
                setSidebarOpen(false)
              }}
              className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Building2 className="mr-3 h-6 w-6" />
              Universities
            </Button>
            <Link
              href="/student/events"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setSidebarOpen(false)}
            >
              <Calendar className="mr-3 h-6 w-6" />
              Events
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                handleAdmissionInfoClick()
                setSidebarOpen(false)
              }}
              className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <BookOpen className="mr-3 h-6 w-6" />
              Admission Info
            </Button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main>{children}</main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
