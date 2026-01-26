"use server"

import { getEvaluationsByDivision, saveEvaluation, deleteEvaluation } from "@/lib/evaluations"
import type { Evaluation } from "@/lib/evaluations"

export async function getEvaluationsAction(division: string) {
  console.log("[v0] Obteniendo evaluaciones para división:", division)
  return await getEvaluationsByDivision(division)
}

export async function saveEvaluationAction(evaluation: Omit<Evaluation, "id" | "created_at" | "updated_at">) {
  console.log("[v0] Guardando evaluación:", evaluation.title)
  return await saveEvaluation(evaluation)
}

export async function deleteEvaluationAction(evaluationId: string) {
  console.log("[v0] Eliminando evaluación:", evaluationId)
  return await deleteEvaluation(evaluationId)
}
