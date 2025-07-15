"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentLayout } from "@/components/layouts/student-layout"
import { ApiService, type University } from "@/lib/api"
import { Building2, MapPin } from "lucide-react"

export default function StudentUniversitiesPage() {
  const searchParams = useSearchParams()
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "North")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUniversities()
  }, [selectedRegion, currentPage])

  const fetchUniversities = async () => {
    try {
      const response = await ApiService.getUniversities(currentPage, 12, 0)
      // Filter by region (in a real app, this would be done server-side)
      const filteredUniversities =
        response.data?.items?.filter((uni: University) => uni.region === selectedRegion) || []
      setUniversities(filteredUniversities)
      setTotalPages(Math.ceil(filteredUniversities.length / 12))
    } catch (error) {
      console.error("Failed to fetch universities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeName = (type: number) => {
    switch (type) {
      case 0:
        return "Public"
      case 1:
        return "Private"
      case 2:
        return "International"
      default:
        return "Unknown"
    }
  }

  const getTypeColor = (type: number) => {
    switch (type) {
      case 0:
        return "bg-blue-100 text-blue-800"
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
              <p className="text-gray-600">Explore universities in the {selectedRegion} region</p>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="Middle">Middle</SelectItem>
                <SelectItem value="South">South</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university) => (
              <Card key={university.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Building2 className="h-8 w-8 text-primary" />
                    <Badge className={getTypeColor(university.type)}>{getTypeName(university.type)}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{university.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {university.region}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {university.title && <p className="text-sm text-gray-600 line-clamp-3 mb-4">{university.title}</p>}
                  <Button asChild className="w-full">
                    <Link href={`/student/universities/${university.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {universities.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No universities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No universities are available in the {selectedRegion} region.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
