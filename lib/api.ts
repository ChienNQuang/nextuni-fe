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
  universityType: UniversityType
  isDeleted: boolean
  code?: string
  address?: string
  email?: string
  websiteUrl?: string
  facebookUrl?: string
}

export interface Major {
  id: string
  name: string
  code: string
  universityId: string
  isDeleted: boolean
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
  gpaScore: number
  examScore: number
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

export interface PaginatedResult<T> {
  isSuccess: boolean
  data: {
    items: T[]
    pageNumber: number
    totalPages: number
    totalCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
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

  // Universities - Updated to handle both paginated and non-paginated requests
  static async getUniversities(pageNumber = 1, pageSize = 10, queryFilter = 0): Promise<ApiResult<PaginatedResult<University>>> {
    const url = pageNumber && pageSize 
      ? `/universities?pageNumber=${pageNumber}&pageSize=${pageSize}&queryFilter=${queryFilter}`
      : '/universities';
    return this.request<PaginatedResult<University>>(url);
  }

  static async getUniversityById(id: string): Promise<ApiResult<University>> {
    return this.request(`/universities/${id}`)
  }

  static async getUniversityConsellingArticles(universityId: string, status: string, pageNumber = 1, pageSize = 10) {
    return this.request(
      `/universities/${universityId}/university-counselling-articles/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  }

  // Staff management
  static async getStaffByUniversity(universityId: string) {
    return this.request<{
      id: string
      email: string
      firstName: string
      lastName: string
      phoneNumber: string
      universityId: string
    }>(`/universities/${universityId}/staff`)
  }

  static async createStaffAccount(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    universityId: string
  }) {
    return this.request('/staffs/create-account', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  static async deleteStaffAccount(universityId: string) {
    return this.request(`/universities/${universityId}/staff-account`, {
      method: 'DELETE'
    })
  }

  static async createUniversity(data: Partial<University>) {
    return this.request("/universities", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async updateUniversity(id: string, data: Partial<University>) {
    return this.request('/universities', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...data
      }),
    });
  }

  /**
   * Toggle university active status
   * @param id University ID
   * @returns Promise with the API response
   */
  static async toggleUniversityStatus(id: string) {
    return this.request(`/universities/status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Majors
  static async createMajor(data: {
    code: string;
    name: string;
    universityId: string;
    title?: string;
    content?: string;
  }): Promise<ApiResult<string>> {
    return this.request('/majors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getMajorsByUniversity(universityId: string, pageNumber = 1, pageSize = 10): Promise<PaginatedResult<Major>> {
    return this.request(`/admin/universities/${universityId}/majors?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async getAdmissionScores(universityId: string, year: string) {
    return this.request(`/universities/${universityId}/majors/admission-scores/${year}`)
  }

  static async updateAdmissionScores(year: string, scores: Array<{ majorId: string; gpaScore: number; examScore: number }>) {
    return this.request(`/majors/admission-scores/${year}`, {
      method: 'POST',
      body: JSON.stringify({ admissionScores: scores })
    })
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
  static async getAdminUniversities(pageNumber = 1, pageSize = 10, queryFilter = 0): Promise<PaginatedResult<University>> {
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
  static async getAdminSubjects(pageNumber = 1, pageSize = 10): Promise<PaginatedResult<Subject>> {
    return this.request(`/admin/subjects?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async getSubjects(pageNumber = 1, pageSize = 10): Promise<PaginatedResult<Subject>> {
    return this.request(`/subjects?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async createSubject(data: { name: string }) {
    return this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  static async updateSubject(id: string, data: { name: string }) {
    return this.request(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  static async deleteSubject(id: string) {
    return this.request(`/subjects/${id}`, {
      method: 'DELETE'
    })
  }

  // Subject Groups
  static async getAdminSubjectGroups(pageNumber = 1, pageSize = 10): Promise<PaginatedResult<SubjectGroup>> {
    return this.request(`/admin/subject-groups?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async getSubjectGroups(pageNumber = 1, pageSize = 10): Promise<PaginatedResult<SubjectGroup>> {
    return this.request(`/subject-groups?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  static async createSubjectGroup(data: { code: string; subjectIds: string[] }) {
    return this.request("/subject-groups", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async updateSubjectGroup(id: string, data: { code: string; subjectIds: string[] }) {
    return this.request(`/subject-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  static async deleteSubjectGroup(id: string) {
    return this.request(`/subject-groups/${id}`, {
      method: 'DELETE'
    })
  }

  // University Introduction Blog
  static async getUniversityIntroductionBlog(universityId: string) {
    return this.request<{ title: string; content: string } | null>(
      `/universities/${universityId}/introduction-blog`
    )
  }

  static async createUniversityIntroductionBlog(data: {
    universityId: string;
    title: string;
    content: string;
  }) {
    return this.request<{ id: string }>(
      `/universities/${data.universityId}/introduction-blog`,
      {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          content: data.content
        })
      }
    )
  }

  // Major Introduction Blog
  static async getMajorIntroductionBlog(majorId: string) {
    return this.request<{ title: string; content: string } | null>(
      `/majors/${majorId}/introduction-blog`
    )
  }

  static async createMajorIntroductionBlog(data: {
    majorId: string;
    title: string;
    content: string;
  }) {
    return this.request<{ id: string }>(
      `/majors/${data.majorId}/introduction-blog`,
      {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          content: data.content
        })
      }
    )
  }

  static async updateMasterCounsellingArticle(id: string, data: { title: string; content: string }) {
    return this.request(`/master-counselling-articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Master Counselling Articles
  static async getMasterCounsellingArticles(pageNumber = 1, pageSize = 10): Promise<ApiResult<PaginatedResult<CounsellingArticle>>> {
    return this.request(`/master-counselling-articles?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  static async createMasterCounsellingArticle(data: { title: string; content: string }) {
    return this.request<{ id: string }>("/master-counselling-articles", {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Chatbot
  static async chatbot(prompt: string) {
    return this.request("/chatbot", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    })
  }
}
