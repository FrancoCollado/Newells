"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LeagueType } from "@/lib/players"

interface LeagueTypeFilterProps {
  value: LeagueType | "PRESTAMO" | "LIBRE" | "todas"
  onChange: (value: LeagueType | "PRESTAMO" | "LIBRE" | "todas") => void
}

export function LeagueTypeFilter({ value, onChange }: LeagueTypeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Tipo de liga" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todas">Todas</SelectItem>
        <SelectItem value="AFA">AFA</SelectItem>
        <SelectItem value="ROSARINA">Rosarina</SelectItem>
        <SelectItem value="PRESTAMO">Préstamo</SelectItem>
        <SelectItem value="LIBRE">Libre</SelectItem>
      </SelectContent>
    </Select>
  )
}
