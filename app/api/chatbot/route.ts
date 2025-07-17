import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // Call the actual chatbot API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot?prompt=${encodeURIComponent(message)}`, {
        headers: {
          Authorization: `Bearer ${request.headers.get("authorization")?.replace("Bearer ", "")}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.isSuccess) {
          return NextResponse.json({ response: result.data })
        }
      }
    } catch (error) {
      console.error("Chatbot API error:", error)
    }

    // Fallback responses if API fails
    const responses = {
      greeting: "Hello! I'm here to help you with university information, admission requirements, and events.",
      universities:
        "I can help you find information about universities in different regions. Which region are you interested in?",
      admission:
        "For admission information, you can check the admission scores for different majors and years in our database.",
      events:
        "You can browse and register for university events in the Events section. Would you like me to help you find specific events?",
      default: "I'm here to help with university information, admissions, and events. What would you like to know?",
    }

    let response = responses.default

    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      response = responses.greeting
    } else if (lowerMessage.includes("university") || lowerMessage.includes("universities")) {
      response = responses.universities
    } else if (lowerMessage.includes("admission") || lowerMessage.includes("score")) {
      response = responses.admission
    } else if (lowerMessage.includes("event") || lowerMessage.includes("events")) {
      response = responses.events
    }

    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
