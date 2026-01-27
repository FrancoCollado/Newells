import { getPlayerAnnouncementsAction } from "./announcement-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Megaphone } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function AnnouncementsFeed({ playerId, division }: { playerId: string, division: string }) {
  const announcements = await getPlayerAnnouncementsAction(playerId, division)

  if (announcements.length === 0) return null

  return (
    <div className="max-w-4xl mx-auto mb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      {announcements.map(ann => (
        <Card key={ann.id} className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-l-4 border-l-amber-500 border-y-amber-200/50 border-r-amber-200/50 shadow-sm">
          <CardContent className="p-4 flex gap-4 items-start">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-full shrink-0 shadow-inner">
               <Megaphone className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
               <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 text-base leading-none pt-1">{ann.title}</h4>
                    {ann.creator && (
                        <p className="text-[11px] text-amber-700/70 dark:text-amber-400/70 mt-1 font-medium capitalize">
                            {ann.creator.role} • {ann.creator.name}
                        </p>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-amber-800/60 dark:text-amber-400/60 uppercase tracking-wider bg-amber-100/50 dark:bg-amber-900/20 px-2 py-0.5 rounded-sm whitespace-nowrap">
                    {format(new Date(ann.created_at), "d MMM", { locale: es })}
                  </span>
               </div>
               <p className="text-sm text-amber-800/90 dark:text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                 {ann.content}
               </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
