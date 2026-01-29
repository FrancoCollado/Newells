"use server"

import { getRehabilitacionPlanilla as getPlanilla, saveRehabilitacionFields as saveFields } from "./rehabilitacion"

export async function getRehabilitacionPlanillaAction() {
  return await getPlanilla()
}

export async function saveRehabilitacionFieldsAction(id: string, fields: { rtr?: string, rtt?: string, rtp?: string }) {
  return await saveFields(id, fields)
}
