"use client"

import * as React from "react"
import {
  MessageSquare,
  Settings,
  Stethoscope,
  Activity,
  Search,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ChevronUp,
  User2,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { hasPermission } from "@/lib/rbac"
import { getRoleLabel } from "@/lib/auth"
import { User } from "@/lib/auth"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null
  onLogout: () => void
  onOpenCaptacion?: () => void
  onOpenReadaptacion?: () => void
}

export function AppSidebar({ user, onLogout, onOpenCaptacion, onOpenReadaptacion, ...props }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  if (!user) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border bg-sidebar-accent/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent cursor-default">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-700 text-white">
                  <span className="font-bold text-lg">N</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">Newell's Old Boys</span>
                  <span className="truncate text-xs text-muted-foreground">Gestión Deportiva</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => router.push("/dashboard")} 
                  isActive={pathname === "/dashboard"}
                  tooltip="Dashboard"
                  className="data-[active=true]:bg-red-50 data-[active=true]:text-red-700 data-[active=true]:font-medium transition-all"
                >
                  <LayoutDashboard className="text-muted-foreground group-data-[active=true]:text-red-700" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => router.push("/dashboard/messages")}
                  isActive={pathname?.startsWith("/dashboard/messages")}
                  tooltip="Mensajes"
                  className="data-[active=true]:bg-red-50 data-[active=true]:text-red-700 data-[active=true]:font-medium transition-all"
                >
                  <MessageSquare className="text-muted-foreground group-data-[active=true]:text-red-700" />
                  <span>Mensajes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {hasPermission(user?.role, "access_manager_panel") && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => router.push("/manager")}
                    isActive={pathname?.startsWith("/manager")}
                    tooltip="Gestión"
                    className="data-[active=true]:bg-red-50 data-[active=true]:text-red-700 data-[active=true]:font-medium transition-all"
                  >
                    <Settings className="text-muted-foreground group-data-[active=true]:text-red-700" />
                    <span>Gestión</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {hasPermission(user?.role, "view_injured_players") && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => router.push("/injured-players")}
                    isActive={pathname?.startsWith("/injured-players")}
                    tooltip="Lesiones"
                    className="data-[active=true]:bg-red-50 data-[active=true]:text-red-700 data-[active=true]:font-medium transition-all"
                  >
                    <Stethoscope className="text-muted-foreground group-data-[active=true]:text-red-700" />
                    <span>Lesiones</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                 <SidebarMenuButton 
                    onClick={() => router.push("/areas")}
                    isActive={pathname?.startsWith("/areas")}
                    tooltip="Áreas"
                    className="data-[active=true]:bg-red-50 data-[active=true]:text-red-700 data-[active=true]:font-medium transition-all"
                  >
                    <Activity className="text-muted-foreground group-data-[active=true]:text-red-700" />
                    <span>Áreas</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Herramientas Específicas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
               {(user?.role === "captacion" || user?.role === "dirigente") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onOpenCaptacion} tooltip="Captación">
                      <Search className="text-muted-foreground" />
                      <span>Captación</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
               )}
               
               <SidebarMenuItem>
                  <SidebarMenuButton onClick={onOpenReadaptacion} tooltip="Readaptación">
                    <HeartPulse className="text-muted-foreground" />
                    <span>Readaptación</span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar-accent/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.photo || ""} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-red-100 text-red-700 font-bold">
                        {user.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{getRoleLabel(user.role)}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              >
                <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}