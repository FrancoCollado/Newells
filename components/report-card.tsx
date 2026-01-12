"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getRoleLabel } from "@/lib/auth"
import type { Report } from "@/lib/reports"
import { Calendar, User, Paperclip, FileText, Download } from "lucide-react"

interface ReportCardProps {
  report: Report
  showDownload?: boolean
}

export function ReportCard({ report, showDownload = false }: ReportCardProps) {
  const reportDate = new Date(report.date)
  const formattedDate = reportDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const formattedTime = reportDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleDownload = (attachment: { id: string; name: string; url: string; type: string }) => {
    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge>{getRoleLabel(report.professionalRole)}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                {report.professionalName}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formattedDate} - {formattedTime}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none mb-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.content}</p>
        </div>

        {report.attachments && report.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Archivos Adjuntos ({report.attachments.length})
            </h4>
            <div className="space-y-2">
              {report.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{attachment.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {attachment.type}
                  </Badge>
                  {showDownload && (
                    <Button size="sm" variant="ghost" onClick={() => handleDownload(attachment)} className="h-7 px-2">
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
