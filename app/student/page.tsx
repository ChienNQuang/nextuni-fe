"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentLayout } from "@/components/layouts/student-layout"
import { ApiService, University, Event, SubjectGroup, CounsellingArticle, UniversityRegion } from "@/lib/api"
import { Calendar, MapPin, Users, BookOpen, ArrowRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentHomePage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([])
  const [articles, setArticles] = useState<CounsellingArticle[]>([])
  const [loading, setLoading] = useState(true)

  const [universitiesQueryFilter, setUniversitiesQueryFilter] = useState(0)

  useEffect(() => {
    fetchHomeData()
    fetchUniversities()
  }, [])

  useEffect(() => {
    fetchUniversities()
  }, [universitiesQueryFilter])

  const fetchUniversities = async () => {
    try {
      const universitiesRes = await ApiService.getUniversities(1, 4, universitiesQueryFilter)
      setUniversities(universitiesRes.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch universities:", error)
    }
  }

  const fetchHomeData = async () => {
    try {
      const [eventsRes, subjectGroupsRes, articlesRes] = await Promise.all([
        ApiService.getEvents("Published", 1, 4),
        ApiService.getSubjectGroups(1, 4),
        ApiService.getMasterCounsellingArticles(1, 4),
      ])

      setEvents(eventsRes.data?.items || [])
      setSubjectGroups(subjectGroupsRes.data?.items || [])
      setArticles(articlesRes.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch home data:", error)
    } finally {
      setLoading(false)
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

  function getRegionName(region: UniversityRegion): string{
    switch (region) {
      case UniversityRegion.North:
        return "North"
      case UniversityRegion.Middle:
        return "Middle"
      case UniversityRegion.South:
        return "South"
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to NextUni</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your comprehensive guide to university admissions, events, and academic information in Vietnam.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Universities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Featured Universities
                  </CardTitle>
                  <CardDescription>Top universities in the North region</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={universitiesQueryFilter.toString()} onValueChange={(value) => setUniversitiesQueryFilter(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">North</SelectItem>
                      <SelectItem value="2">Middle</SelectItem>
                      <SelectItem value="3">South</SelectItem>
                    </SelectContent>
                  </Select>
                  <Link href="/student/universities?region=North">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {universities.slice(0, 4).map((university) => (
                  <Link href={`/student/universities/${university.id}`} key={university.id} >

                  <div  className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{university.name}</h4>
                      <p className="text-sm text-gray-600">{getRegionName(university.region)}</p>
                    </div>
                    <Badge variant="outline">{university.universityType === 0 ? "Public" : "Private"}</Badge>
                  </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Latest university events and activities</CardDescription>
                </div>
                <Link href="/student/events">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(0, 4).map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{event.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="mr-1 h-4 w-4" />
                      {new Date(event.startDate).toLocaleDateString()}
                      {event.address && (
                        <>
                          <MapPin className="ml-3 mr-1 h-4 w-4" />
                          {event.address}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Subject Combinations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Popular Subject Combinations
                  </CardTitle>
                  <CardDescription>Most common subject groups for admissions</CardDescription>
                </div>
                <Link href="/student/subject-groups">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectGroups.slice(0, 4).map((group) => (
                  <div key={group.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{group.code}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {group.subjects?.map((subject: any) => (
                        <Badge key={subject.id} variant="secondary">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advisory Articles */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Advisory Articles
                  </CardTitle>
                  <CardDescription>Latest guidance and tips from our system</CardDescription>
                </div>
                <Link href="/student/admission-info?source=system">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles.slice(0, 4).map((article) => (
                  <div key={article.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{article.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">System</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  )
}
