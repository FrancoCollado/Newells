"use client"

import { ProfessionalLayout } from "@/components/professional-layout"
import { logout, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function MessagesClientLayout({ children, user }: { children: React.ReactNode; user: User }) {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <ProfessionalLayout user={user} onLogout={handleLogout}>
      {children}
    </ProfessionalLayout>
  )
}
