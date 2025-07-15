export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: "Administrator" | "Staff" | "Student"
  universityId?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.nextuni.com"

  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const result = await response.json()

    if (!result.isSuccess) {
      throw new Error("Login failed")
    }

    return result.data
  }

  static async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }

    const result = await response.json()

    if (!result.isSuccess) {
      throw new Error("Registration failed")
    }
  }

  static async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No token found")
    }

    const response = await fetch(`${this.baseUrl}/users/current-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get current user")
    }

    const result = await response.json()

    if (!result.isSuccess) {
      throw new Error("Failed to get current user")
    }

    return result.data
  }

  static logout() {
    localStorage.removeItem("token")
  }
}
