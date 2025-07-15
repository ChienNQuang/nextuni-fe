"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ApiService } from "@/lib/api"
import { Plus, Search, Eye, Edit, Power } from "lucide-react"
import { toast } from "sonner"

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUniversities()
  }, [currentPage, filterStatus])

  const fetchUniversities = async () => {
    try {
      setLoading(true)
      const queryFilter = filterStatus === "all" ? 0 : Number.parseInt(filterStatus)
      const response = await ApiService.getAdminUniversities(currentPage, 10, queryFilter)
      setUniversities(response.data?.items || [])
      setTotalPages(response.data?.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch universities:", error)
      toast.error("Failed to fetch universities")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (isDeleted: boolean) => {
    return isDeleted ? <Badge variant="secondary">Inactive</Badge> : <Badge variant="default">Active</Badge>
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

  const filteredUniversities = universities.filter((university) =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
            <p className="text-gray-600">Manage universities and their information</p>
          </div>
          <Link href="/admin/universities/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create University
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search universities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="0">Active</SelectItem>
                  <SelectItem value="1">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Universities List */}
        <Card>
          <CardHeader>
            <CardTitle>Universities ({filteredUniversities.length})</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `Showing ${filteredUniversities.length} universities`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUniversities.map((university) => (
                  <div
                    key={university.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{university.name}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {university.region} • {getTypeName(university.universityType)}
                            </span>
                            {getStatusBadge(university.isDeleted)}
                          </div>
                        </div>
                      </div>
                      {university.address && <p className="text-sm text-gray-600 mt-2">{university.address}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/universities/${university.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Power className="mr-2 h-4 w-4" />
                        {university.isDeleted ? "Activate" : "Deactivate"}
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredUniversities.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No universities found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
