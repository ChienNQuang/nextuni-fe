"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, MessageCircle, Bot, User } from "lucide-react"
import { ApiService } from "@/lib/api"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your NextUni assistant. How can I help you with university information, admissions, or events today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue.trim()
    setInputValue("")
    setLoading(true)

    try {
      // Call your API service
      const response = await ApiService.chatbot(currentInput)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data || "I'm sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Chatbot error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className={`rounded-full h-16 w-16 shadow-2xl transition-all duration-300 hover:scale-110 ${
            isOpen 
              ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-7 w-7 text-white" />
          ) : (
            <MessageCircle className="h-7 w-7 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] animate-in slide-in-from-bottom-2 duration-300">
          <Card className="h-full flex flex-col shadow-2xl border-0 bg-white backdrop-blur-lg overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex-shrink-0">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <span>NextUni Assistant</span>
              </CardTitle>
              <p className="text-sm text-blue-100">Ask me anything about universities!</p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-4 pr-1">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex w-full ${message.isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-start space-x-2 max-w-[280px] sm:max-w-[320px] ${message.isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                          message.isUser 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        }`}>
                          {message.isUser ? (
                            <User className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <Bot className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                        
                        {/* Message bubble */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div
                            className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed break-words ${
                              message.isUser 
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm" 
                                : "bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{message.text}</div>
                          </div>
                          <div className={`text-xs text-gray-500 mt-1 px-1 ${message.isUser ? "text-right" : "text-left"}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {loading && (
                    <div className="flex justify-start w-full">
                      <div className="flex items-start space-x-2 max-w-[280px] sm:max-w-[320px]">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2.5">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                            <div 
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div 
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input area */}
              <div className="p-3 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="flex-1 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={loading || !inputValue.trim()}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 py-2 flex-shrink-0"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick suggestions */}
                {messages.length === 1 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      "Universities",
                      "Events", 
                      "Admissions",
                      "How to apply?"
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInputValue(suggestion)}
                        className="text-xs bg-white border border-gray-300 rounded-full px-2.5 py-1 hover:bg-gray-50 transition-colors flex-shrink-0"
                        disabled={loading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}