import { Loader2 } from "lucide-react"

export function Loading({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
