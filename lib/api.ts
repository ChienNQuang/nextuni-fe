export enum UniversityRegion {
  North = 0,
  Middle = 1,
  South = 2,
}

export enum UniversityType {
  Public = 0,
  Private = 1,
  International = 2,
}

export interface University {
  id: string
  name: string
  region: UniversityRegion
  type: UniversityType
  status: number
  title?: string
  content?: string
}

export interface Major {
  id: string
  name: string
  universityId: string
  title?: string
  content?: string
  status: number
}

export interface Subject {
  id: string
  name: string
  status: number
}

export interface SubjectGroup {
  id: string
  name: string
  subjects: Subject[]
}

export interface AdmissionScore {
  majorId: string
  majorName: string
  year: number
  minScore: number
  maxScore: number
}

export interface CounsellingArticle {
  id: string
  title: string
  content: string
  status: "Draft" | "Pending" | "Published"
  universityId?: string
}

export interface Event {
  name: string
  id: string
  title: string
  content: string
  status: number
  universityId: string
  startDate: string
  endDate: string
}

export interface ApiResult<T> {
  isSuccess: boolean
  data: T
}

export class ApiService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.nextuni.com"

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`)

    const result = await response.json()

    // Handle ApiResult wrapper
    if (!result.isSuccess) {
      throw new Error("API request failed")
    }

    return result // Return the full result, components will access .data
  }

  // Universities - Updated to handle queryFilter parameter
  static async getUniversities(pageNumber = 1, pageSize = 10, queryFilter = 0) {
    return this.request(`/universities?pageNumber=${pageNumber}&pageSize=${pageSize}&queryFilter=${queryFilter}`)
  }

  static async getUniversityById(id: string) {
    return this.request(`/universities/${id}`)
  }

  static async getUniversityConsellingArticles(universityId: string, status: string, pageNumber = 1, pageSize = 10) {
    return this.request(
      `/universities/${universityId}/university-counselling-articles/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  }

  static async createUniversity(data: Partial<University>) {
    return this.request("/universities", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Majors
  static async getMajorsByUniversity(universityId: string, pageNumber = 1, pageSize = 10) {
    return this.request(`/universities/${universityId}/majors?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async getAdmissionScores(universityId: string, year: string) {
    return this.request(`/universities/${universityId}/majors/admission-scores/${year}`)
  }

  // Events - Updated to use correct endpoints
  static async getEvents(status?: string, pageNumber = 1, pageSize = 10) {
    const endpoint = status ? `/events/${status}` : "/events"
    return this.request(`${endpoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async getEventById(id: string) {
    return this.request(`/event-by-id/${id}`)
  }

  static async createEvent(data: any) {
    return this.request("/events", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async registerForEvent(eventId: string) {
    return this.request(`/event-registrations/${eventId}`, {
      method: "POST",
    })
  }

  static async cancelEvent(eventId: string) {
    return this.request(`/events/cancel/${eventId}`, {
      method: "PUT",
    })
  }

  // Counselling Articles
  static async getCounsellingArticles(status?: string, pageNumber = 1, pageSize = 10) {
    const endpoint = status ? `/university-counselling-articles/${status}` : "/university-counselling-articles"
    return this.request(`${endpoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async getStaffCounsellingArticles(status: string, pageNumber = 1, pageSize = 10) {
    return this.request(
      `/staff/university-counselling-articles/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  }

  static async createCounsellingArticle(data: any) {
    return this.request("/university-counselling-articles", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async submitArticle(articleId: string) {
    return this.request(`/university-counselling-articles/submit/${articleId}`, {
      method: "PUT",
    })
  }

  static async approveArticle(articleId: string) {
    return this.request(`/university-counselling-articles/approve/${articleId}`, {
      method: "PUT",
    })
  }

  static async rejectArticle(articleId: string) {
    return this.request(`/university-counselling-articles/reject/${articleId}`, {
      method: "PUT",
    })
  }

  // Staff Events
  static async getStaffEvents(universityId: string, status: string, pageNumber = 1, pageSize = 10) {
    return this.request(
      `/staff/universities/${universityId}/events/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  }

  // Admin endpoints
  static async getAdminUniversities(pageNumber = 1, pageSize = 10, queryFilter = 0) {
    return this.request(`/admin/universities?pageNumber=${pageNumber}&pageSize=${pageSize}&queryFilter=${queryFilter}`)
  }

  static async getAdminEvents(status: string, pageNumber = 1, pageSize = 10) {
    return this.request(`/admin/events/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async getAdminCounsellingArticles(status: string, pageNumber = 1, pageSize = 10) {
    return this.request(
      `/admin/university-counselling-articles/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  }

  // Subjects
  static async getSubjects(pageNumber = 1, pageSize = 10) {
    return this.request(`/subjects?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async createSubject(data: { name: string }) {
    return this.request("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Subject Groups
  static async getSubjectGroups(pageNumber = 1, pageSize = 10) {
    return this.request(`/subject-groups?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async createSubjectGroup(data: { code: string; subjectIds: string[] }) {
    return this.request("/subject-groups", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Master Counselling Articles
  static async getMasterCounsellingArticles(pageNumber = 1, pageSize = 10) {
    return this.request(`/master-counselling-articles?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async createMasterCounsellingArticle(data: { title: string; content: string }) {
    return this.request("/master-counselling-articles", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Staff management
  static async getStaffByUniversity(universityId: string) {
    return this.request(`/universities/${universityId}/staff`)
  }

  static async createStaffAccount(data: any) {
    return this.request("/staffs/create-account", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async deleteStaffAccount(universityId: string) {
    return this.request(`/universities/${universityId}/staff-account`, {
      method: "DELETE",
    })
  }

  // Chatbot
  static async chatbot(prompt: string) {
    return this.request(`/chatbot?prompt=${encodeURIComponent(prompt)}`)
  }
}
