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
  const [selectedRegion, setSelectedRegion] = useState(
    searchParams.get("region") ? parseInt(searchParams.get("region")!) : 0
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [allUniversities, setAllUniversities] = useState<University[]>([])

  const itemsPerPage = 12

  useEffect(() => {
    fetchUniversities()
  }, [])

  useEffect(() => {
    // Reset to page 1 when region changes
    setCurrentPage(1)
    filterAndPaginateUniversities()
  }, [selectedRegion, allUniversities])

  useEffect(() => {
    filterAndPaginateUniversities()
  }, [currentPage])

  const fetchUniversities = async () => {
    try {
      setLoading(true)
      // Fetch all universities (you might want to implement server-side filtering)
      const response = await ApiService.getUniversities(1, 1000, 0) // Fetch a large number to get all
      setAllUniversities(response.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch universities:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndPaginateUniversities = () => {
    // Filter universities by selected region
    const filteredUniversities = allUniversities.filter(
      (uni: University) => Number(uni.region) === selectedRegion
    )

    // Calculate pagination
    const totalFilteredItems = filteredUniversities.length
    const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage)
    setTotalPages(calculatedTotalPages)

    // Get universities for current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUniversities = filteredUniversities.slice(startIndex, endIndex)

    setUniversities(paginatedUniversities)
  }

  const getRegionName = (region: number) => {
    switch (region) {
      case 0:
        return "North"
      case 1:
        return "Middle"
      case 2:
        return "South"
      default:
        return "Unknown"
    }
  }

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(parseInt(newRegion))
    // currentPage will be reset to 1 in the useEffect
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
              <p className="text-gray-600">Explore universities in the {getRegionName(selectedRegion)} region</p>
            </div>
            <Select value={selectedRegion.toString()} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">North</SelectItem>
                <SelectItem value="1">Middle</SelectItem>
                <SelectItem value="2">South</SelectItem>
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
                    {getRegionName(Number(university.region))}
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

          {universities.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No universities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No universities are available in the {getRegionName(selectedRegion)} region.
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