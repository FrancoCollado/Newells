"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { User } from "@/lib/auth"

interface ProfessionalLayoutProps {
  children: React.ReactNode
  user: User | null
  onLogout: () => void
  onOpenCaptacion?: () => void
  onOpenReadaptacion?: () => void
  onOpenRehabilitacion?: () => void // <--- NUEVA PROP AGREGADA
}

export function ProfessionalLayout({ 
  children, 
  user, 
  onLogout, 
  onOpenCaptacion,
  onOpenReadaptacion,
  onOpenRehabilitacion // <--- NUEVA PROP DESTRUCTURADA
}: ProfessionalLayoutProps) {
  
  return (
    <SidebarProvider>
      <AppSidebar 
        user={user} 
        onLogout={onLogout} 
        onOpenCaptacion={onOpenCaptacion}
        onOpenReadaptacion={onOpenReadaptacion}
        // @ts-ignore - Ignoramos error de TS temporalmente hasta que actualices AppSidebar
        onOpenRehabilitacion={onOpenRehabilitacion} // <--- PASAMOS LA PROP AL SIDEBAR
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-gradient-to-r from-red-700 to-black text-white px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-white hover:bg-white/20" />
            <div className="flex flex-col">
                 <h1 className="text-lg font-bold leading-tight">Newell's Old Boys</h1>
                 <p className="text-xs text-red-100 leading-tight">Sistema de Gestión Deportiva</p>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}