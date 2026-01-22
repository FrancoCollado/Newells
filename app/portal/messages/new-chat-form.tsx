"use client"

import { Button } from "@/components/ui/button"
import { createConversationAction } from "./actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const AREAS = [
  "medica",
  "tecnica",
  "psicologia",
  "nutricion",
  "fisioterapia",
  "kinesiologia"
]

export function NewChatForm() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleCreate = async (area: string) => {
    setLoading(area)
    try {
      const conv = await createConversationAction(area)
      router.push(`/portal/messages/${conv.id}`)
    } catch (error) {
      console.error("Failed to create chat", error)
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 py-4">
      {AREAS.map((area) => (
        <Button
          key={area}
          variant="outline"
          className="h-20 flex flex-col gap-2 capitalize"
          onClick={() => handleCreate(area)}
          disabled={!!loading}
        >
          {loading === area ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <span className="font-semibold">{area}</span>
          )}
        </Button>
      ))}
    </div>
  )
}
