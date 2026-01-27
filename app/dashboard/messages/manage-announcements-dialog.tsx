"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Users, User, Loader2, Megaphone } from "lucide-react"
import { getProfessionalAnnouncementsAction, deleteAnnouncementAction } from "./announcement-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { CreateAnnouncementDialog } from "./create-announcement-dialog"

export function ManageAnnouncementsDialog() {
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()

  // Pagination
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadInitial = () => {
    setLoadingInitial(true)
    setPage(0)
    setHasMore(true)
    getProfessionalAnnouncementsAction(0, 10).then(data => {
      setAnnouncements(data)
      if (data.length < 10) setHasMore(false)
      setLoadingInitial(false)
    })
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    
    const nextPage = page + 1
    const data = await getProfessionalAnnouncementsAction(nextPage, 10)
    
    if (data.length < 10) setHasMore(false)
    
    setAnnouncements(prev => [...prev, ...data])
    setPage(nextPage)
    setLoadingMore(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingInitial) {
          loadMore()
        }
      }, { threshold: 0.1 }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadingInitial])

  useEffect(() => {
    if (open) {
      loadInitial()
    }
  }, [open])

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAnnouncementAction(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Megaphone className="h-4 w-4" />
            Comunicados
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
                <div>
                    <DialogTitle>Mis Comunicados</DialogTitle>
                    <DialogDescription>
                        Administra y crea nuevos anuncios.
                    </DialogDescription>
                </div>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    Nuevo +
                </Button>
            </div>
          </DialogHeader>

          <div className="h-[400px] pr-2 -mr-2">
              <ScrollArea className="h-full">
                  {loadingInitial ? (
                      <div className="flex justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                  ) : announcements.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                          No tienes comunicados activos.
                      </div>
                  ) : (
                      <div className="space-y-3 p-1">
                          {announcements.map((ann) => (
                              <div key={ann.id} className="border rounded-lg p-4 bg-card relative group">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <h4 className="font-bold text-sm">{ann.title}</h4>
                                          <span className="text-[10px] text-muted-foreground">
                                              {format(new Date(ann.created_at), "PPP p", { locale: es })}
                                          </span>
                                      </div>
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-destructive"
                                          onClick={() => handleDelete(ann.id)}
                                          disabled={isPending}
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                      {ann.content}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                      {ann.recipients?.map((rec: any, i: number) => (
                                          <Badge key={i} variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-muted/50">
                                              {rec.division ? (
                                                  <><Users className="h-3 w-3" /> {rec.division}</>
                                              ) : (
                                                  <><User className="h-3 w-3" /> {rec.player?.name || "Jugador"}</>
                                              )}
                                          </Badge>
                                      ))}
                                  </div>
                              </div>
                          ))}
                          {/* Load More Trigger */}
                          <div ref={loadMoreRef} className="py-2 text-center h-8 flex justify-center">
                              {loadingMore && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          </div>
                      </div>
                  )}
              </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <CreateAnnouncementDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={loadInitial} 
      />
    </>
  )
}
