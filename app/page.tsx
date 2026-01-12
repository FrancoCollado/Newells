"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
    checkUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
    </div>
  )
}
