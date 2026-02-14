import { createServerClient } from "@/lib/supabase"

export type MedicalRecord = {
  id: string
  playerId: string

  // Personal Information
  birthDate?: string
  birthPlaceCity?: string
  birthPlaceProvince?: string
  birthPlaceCountry?: string
  currentAddressCity?: string
  currentAddressProvince?: string
  currentAddressCountry?: string
  dni?: string
  passport?: string
  phoneLandline?: string
  phoneMobile?: string
  socialSecurityType?: string
  socialSecurityNumber?: string
  primaryDoctorName?: string
  primaryDoctorPhone?: string

  // Allergies and Medication
  allergies?: string
  currentMedication?: string
  currentIllnesses?: string

  // Family Context
  livingWithFather?: boolean
  livingWithMother?: boolean
  livingWithSiblings?: boolean
  livingWithPartner?: boolean
  livingWithOthers?: string
  relationshipStatus?: string
  economicSupport?: string
  religion?: string

  // Family History
  familyHistoryCardiac?: boolean
  familyHistoryCancer?: boolean
  familyHistoryEmotional?: boolean
  familyHistoryHeadaches?: boolean
  familyHistoryAnemia?: boolean
  familyHistoryAllergiesAsthma?: boolean
  familyHistoryEpilepsy?: boolean
  familyHistoryDiabetes?: boolean
  familyHistoryStomach?: boolean
  familyHistoryRenal?: boolean
  familyHistorySuddenDeath?: boolean
  familyHistoryGenetic?: boolean
  familyHistoryHypertension?: boolean
  familyHistoryComments?: string

  // Personal History
  personalPathological?: Array<{ condition: string; details: string }>
  personalSurgical?: Array<{ procedure: string; details: string }>
  personalInjuries?: Array<{ injury: string; details: string }>
  personalComments?: string

  // Sports History
  sportsHistory?: Array<{
    sport: string
    ageStarted: number
    duration: string
    competitive: boolean
    observations: string
  }>

  // Medical Examination
  examiningDoctor?: string
  examDate?: string
  bloodPressure?: string
  heartRate?: number
  respiratoryRate?: number
  heightCm?: number
  weightKg?: number
  pieHabil?: string
  examinationStudies?: string

  // Central Nervous System
  cnsAnomalies?: string

  // Eyes, Ears, Nose, Throat
  visualAcuityLeft?: string
  visualAcuityRight?: string
  colorVision?: string
  ocularMovements?: string
  visualField?: string
  dominantEye?: string
  earCondition?: string
  noseCondition?: string
  neckThyroid?: string
  dentalPieces?: string
  earCanal?: string
  laterality?: string
  pupils?: string
  tympanicMembranes?: string
  neckLymphNodes?: string
  isocoricReactive?: string
  tonsils?: string
  dentalPiecesCondition?: string
  dentures?: string
  gums?: string
  entAnomalies?: string

  // Respiratory
  lungsCondition?: string
  chestSymmetry?: string
  chestAuscultation?: string
  upperAirwayPermeability?: string
  peakFlow?: string
  chestExpansion?: string
  respiratoryAnomalies?: string

  // Cardiovascular
  peripheralPulseRhythm?: string
  carotidPulse?: string
  radialPulse?: string
  pedalPulse?: string
  tibialPulse?: string
  precordialSounds?: string
  abnormalSounds?: string
  apicalRhythm?: string
  fremitus?: string
  cardiovascularAnomalies?: string
  cardiovascularPathologies?: string

  // Skin
  skinLesions?: string
  skinTrophism?: string
  varicoseVeins?: boolean
  hernias?: boolean
  skinAnomalies?: string

  // Physical Examination Protocol
  examinationGenitals?: string
  abdPared?: string
  abdSensibilidad?: string
  abdOrganomegalia?: string
  abdMasas?: string
  posturaIdeal?: boolean
  posturaCifolordotica?: boolean
  posturaEspaldaRecta?: boolean
  posturaEspaldaArqueada?: boolean
  posturaEscoleosis?: boolean
  posturaDefectuosaCabezaHombros?: boolean
  posturaDefectuosaColumnaPelvis?: boolean
  posturaDefectuosaPiernaRodillaPie?: boolean
  troncoExtensoresEspalda?: string
  troncoFlexoresLaterales?: string
  troncoFlexoresOblicuos?: string
  troncoFlexoresAnteriores?: string
  flexLongitudFlexoresCadera?: string
  flexLongitudIsquiosurales?: string
  flexInclinacionAdelante?: string
  flexAmplitudMovimientoTronco?: string
  flexLongitudFlexoresPlantares?: string
  flexTensorFasciaLata?: string
  flexLongitudGlenohumerales?: string
  flexLongitudRotadoresHombro?: string
  flexExtensionFlexionCervical?: string
  movRotacionCaderas?: string
  movCuclillas?: string
  movBisagraCadera?: string
  movCuadripediaFlexoExtension?: string
  movCuadripediaTorsion?: string
  examinationObservations?: string

  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

function mapDbToMedicalRecord(dbRecord: any): MedicalRecord {
  return {
    id: dbRecord.id,
    playerId: dbRecord.player_id,
    birthDate: dbRecord.birth_date,
    birthPlaceCity: dbRecord.birth_place_city,
    birthPlaceProvince: dbRecord.birth_place_province,
    birthPlaceCountry: dbRecord.birth_place_country,
    currentAddressCity: dbRecord.current_address_city,
    currentAddressProvince: dbRecord.current_address_province,
    currentAddressCountry: dbRecord.current_address_country,
    dni: dbRecord.dni,
    passport: dbRecord.passport,
    phoneLandline: dbRecord.phone_landline,
    phoneMobile: dbRecord.phone_mobile,
    socialSecurityType: dbRecord.social_security_type,
    socialSecurityNumber: dbRecord.social_security_number,
    primaryDoctorName: dbRecord.primary_doctor_name,
    primaryDoctorPhone: dbRecord.primary_doctor_phone,
    allergies: dbRecord.allergies,
    currentMedication: dbRecord.current_medication,
    currentIllnesses: dbRecord.current_illnesses,
    livingWithFather: dbRecord.living_with_father,
    livingWithMother: dbRecord.living_with_mother,
    livingWithSiblings: dbRecord.living_with_siblings,
    livingWithPartner: dbRecord.living_with_partner,
    livingWithOthers: dbRecord.living_with_others,
    relationshipStatus: dbRecord.relationship_status,
    economicSupport: dbRecord.economic_support,
    religion: dbRecord.religion,
    familyHistoryCardiac: dbRecord.family_history_cardiac,
    familyHistoryCancer: dbRecord.family_history_cancer,
    familyHistoryEmotional: dbRecord.family_history_emotional,
    familyHistoryHeadaches: dbRecord.family_history_headaches,
    familyHistoryAnemia: dbRecord.family_history_anemia,
    familyHistoryAllergiesAsthma: dbRecord.family_history_allergies_asthma,
    familyHistoryEpilepsy: dbRecord.family_history_epilepsy,
    familyHistoryDiabetes: dbRecord.family_history_diabetes,
    familyHistoryStomach: dbRecord.family_history_stomach,
    familyHistoryRenal: dbRecord.family_history_renal,
    familyHistorySuddenDeath: dbRecord.family_history_sudden_death,
    familyHistoryGenetic: dbRecord.family_history_genetic,
    familyHistoryHypertension: dbRecord.family_history_hypertension,
    familyHistoryComments: dbRecord.family_history_comments,
    personalPathological: dbRecord.personal_pathological,
    personalSurgical: dbRecord.personal_surgical,
    personalInjuries: dbRecord.personal_injuries,
    personalComments: dbRecord.personal_comments,
    sportsHistory: dbRecord.sports_history,
    examiningDoctor: dbRecord.examining_doctor,
    examDate: dbRecord.exam_date,
    bloodPressure: dbRecord.blood_pressure,
    heartRate: dbRecord.heart_rate,
    respiratoryRate: dbRecord.respiratory_rate,
    heightCm: dbRecord.height_cm,
    weightKg: dbRecord.weight_kg,
    pieHabil: dbRecord.pie_habil,
    examinationStudies: dbRecord.examination_studies,
    cnsAnomalies: dbRecord.cns_anomalies,
    visualAcuityLeft: dbRecord.visual_acuity_left,
    visualAcuityRight: dbRecord.visual_acuity_right,
    colorVision: dbRecord.color_vision,
    ocularMovements: dbRecord.ocular_movements,
    visualField: dbRecord.visual_field,
    dominantEye: dbRecord.dominant_eye,
    earCondition: dbRecord.ear_condition,
    noseCondition: dbRecord.nose_condition,
    neckThyroid: dbRecord.neck_thyroid,
    dentalPieces: dbRecord.dental_pieces,
    earCanal: dbRecord.ear_canal,
    laterality: dbRecord.laterality,
    pupils: dbRecord.pupils,
    tympanicMembranes: dbRecord.tympanic_membranes,
    neckLymphNodes: dbRecord.neck_lymph_nodes,
    isocoricReactive: dbRecord.isocoric_reactive,
    tonsils: dbRecord.tonsils,
    dentalPiecesCondition: dbRecord.dental_pieces_condition,
    dentures: dbRecord.dentures,
    gums: dbRecord.gums,
    entAnomalies: dbRecord.ent_anomalies,
    lungsCondition: dbRecord.lungs_condition,
    chestSymmetry: dbRecord.chest_symmetry,
    chestAuscultation: dbRecord.chest_auscultation,
    upperAirwayPermeability: dbRecord.upper_airway_permeability,
    peakFlow: dbRecord.peak_flow,
    chestExpansion: dbRecord.chest_expansion,
    respiratoryAnomalies: dbRecord.respiratory_anomalies,
    peripheralPulseRhythm: dbRecord.peripheral_pulse_rhythm,
    carotidPulse: dbRecord.carotid_pulse,
    radialPulse: dbRecord.radial_pulse,
    pedalPulse: dbRecord.pedal_pulse,
    tibialPulse: dbRecord.tibial_pulse,
    precordialSounds: dbRecord.precordial_sounds,
    abnormalSounds: dbRecord.abnormal_sounds,
    apicalRhythm: dbRecord.apical_rhythm,
    fremitus: dbRecord.fremitus,
    cardiovascularAnomalies: dbRecord.cardiovascular_anomalies,
    cardiovascularPathologies: dbRecord.cardiovascular_pathologies,
    skinLesions: dbRecord.skin_lesions,
    skinTrophism: dbRecord.skin_trophism,
    varicoseVeins: dbRecord.varicose_veins,
    hernias: dbRecord.hernias,
    skinAnomalies: dbRecord.skin_anomalies,
    examinationGenitals: dbRecord.examination_genitals,
    abdPared: dbRecord.abd_pared,
    abdSensibilidad: dbRecord.abd_sensibilidad,
    abdOrganomegalia: dbRecord.abd_organomegalia,
    abdMasas: dbRecord.abd_masas,
    posturaIdeal: dbRecord.postura_ideal,
    posturaCifolordotica: dbRecord.postura_cifolordotica,
    posturaEspaldaRecta: dbRecord.postura_espalda_recta,
    posturaEspaldaArqueada: dbRecord.postura_espalda_arqueada,
    posturaEscoleosis: dbRecord.postura_escoleosis,
    posturaDefectuosaCabezaHombros: dbRecord.postura_defectuosa_cabeza_hombros,
    posturaDefectuosaColumnaPelvis: dbRecord.postura_defectuosa_columna_pelvis,
    posturaDefectuosaPiernaRodillaPie: dbRecord.postura_defectuosa_pierna_rodilla_pie,
    troncoExtensoresEspalda: dbRecord.tronco_extensores_espalda,
    troncoFlexoresLaterales: dbRecord.tronco_flexores_laterales,
    troncoFlexoresOblicuos: dbRecord.tronco_flexores_oblicuos,
    troncoFlexoresAnteriores: dbRecord.tronco_flexores_anteriores,
    flexLongitudFlexoresCadera: dbRecord.flex_longitud_flexores_cadera,
    flexLongitudIsquiosurales: dbRecord.flex_longitud_isquiosurales,
    flexInclinacionAdelante: dbRecord.flex_inclinacion_adelante,
    flexAmplitudMovimientoTronco: dbRecord.flex_amplitud_movimiento_tronco,
    flexLongitudFlexoresPlantares: dbRecord.flex_longitud_flexores_plantares,
    flexTensorFasciaLata: dbRecord.flex_tensor_fascia_lata,
    flexLongitudGlenohumerales: dbRecord.flex_longitud_glenohumerales,
    flexLongitudRotadoresHombro: dbRecord.flex_longitud_rotadores_hombro,
    flexExtensionFlexionCervical: dbRecord.flex_extension_flexion_cervical,
    movRotacionCaderas: dbRecord.mov_rotacion_caderas,
    movCuclillas: dbRecord.mov_cuclillas,
    movBisagraCadera: dbRecord.mov_bisagra_cadera,
    movCuadripediaFlexoExtension: dbRecord.mov_cuadripedia_flexo_extension,
    movCuadripediaTorsion: dbRecord.mov_cuadripedia_torsion,
    examinationObservations: dbRecord.examination_observations,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
    createdBy: dbRecord.created_by,
    updatedBy: dbRecord.updated_by,
  }
}

export async function getMedicalRecord(playerId: string): Promise<MedicalRecord | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("medical_records").select("*").eq("player_id", playerId).maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return mapDbToMedicalRecord(data)
}

export async function createOrUpdateMedicalRecord(
  playerId: string,
  record: Partial<MedicalRecord>,
  userId: string,
): Promise<MedicalRecord> {
  const supabase = await createServerClient()

  // Check if record exists
  const existing = await getMedicalRecord(playerId)

  const dbRecord = {
    player_id: playerId,
    birth_date: record.birthDate,
    birth_place_city: record.birthPlaceCity,
    birth_place_province: record.birthPlaceProvince,
    birth_place_country: record.birthPlaceCountry,
    current_address_city: record.currentAddressCity,
    current_address_province: record.currentAddressProvince,
    current_address_country: record.currentAddressCountry,
    dni: record.dni,
    passport: record.passport,
    phone_landline: record.phoneLandline,
    phone_mobile: record.phoneMobile,
    social_security_type: record.socialSecurityType,
    social_security_number: record.socialSecurityNumber,
    primary_doctor_name: record.primaryDoctorName,
    primary_doctor_phone: record.primaryDoctorPhone,
    allergies: record.allergies,
    current_medication: record.currentMedication,
    current_illnesses: record.currentIllnesses,
    living_with_father: record.livingWithFather,
    living_with_mother: record.livingWithMother,
    living_with_siblings: record.livingWithSiblings,
    living_with_partner: record.livingWithPartner,
    living_with_others: record.livingWithOthers,
    relationship_status: record.relationshipStatus,
    economic_support: record.economicSupport,
    religion: record.religion,
    family_history_cardiac: record.familyHistoryCardiac,
    family_history_cancer: record.familyHistoryCancer,
    family_history_emotional: record.familyHistoryEmotional,
    family_history_headaches: record.familyHistoryHeadaches,
    family_history_anemia: record.familyHistoryAnemia,
    family_history_allergies_asthma: record.familyHistoryAllergiesAsthma,
    family_history_epilepsy: record.familyHistoryEpilepsy,
    family_history_diabetes: record.familyHistoryDiabetes,
    family_history_stomach: record.familyHistoryStomach,
    family_history_renal: record.familyHistoryRenal,
    family_history_sudden_death: record.familyHistorySuddenDeath,
    family_history_genetic: record.familyHistoryGenetic,
    family_history_hypertension: record.familyHistoryHypertension,
    family_history_comments: record.familyHistoryComments,
    personal_pathological: record.personalPathological,
    personal_surgical: record.personalSurgical,
    personal_injuries: record.personalInjuries,
    personal_comments: record.personalComments,
    sports_history: record.sportsHistory,
    examining_doctor: record.examiningDoctor,
    exam_date: record.examDate,
    blood_pressure: record.bloodPressure,
    heart_rate: record.heartRate,
    respiratory_rate: record.respiratoryRate,
    height_cm: record.heightCm,
    weight_kg: record.weightKg,
    pie_habil: record.pieHabil,
    examination_studies: record.examinationStudies,
    cns_anomalies: record.cnsAnomalies,
    visual_acuity_left: record.visualAcuityLeft,
    visual_acuity_right: record.visualAcuityRight,
    color_vision: record.colorVision,
    ocular_movements: record.ocularMovements,
    visual_field: record.visualField,
    dominant_eye: record.dominantEye,
    ear_condition: record.earCondition,
    nose_condition: record.noseCondition,
    neck_thyroid: record.neckThyroid,
    dental_pieces: record.dentalPieces,
    ear_canal: record.earCanal,
    laterality: record.laterality,
    pupils: record.pupils,
    tympanic_membranes: record.tympanicMembranes,
    neck_lymph_nodes: record.neckLymphNodes,
    isocoric_reactive: record.isocoricReactive,
    tonsils: record.tonsils,
    dental_pieces_condition: record.dentalPiecesCondition,
    dentures: record.dentures,
    gums: record.gums,
    ent_anomalies: record.entAnomalies,
    lungs_condition: record.lungsCondition,
    chest_symmetry: record.chestSymmetry,
    chest_auscultation: record.chestAuscultation,
    upper_airway_permeability: record.upperAirwayPermeability,
    peak_flow: record.peakFlow,
    chest_expansion: record.chestExpansion,
    respiratory_anomalies: record.respiratoryAnomalies,
    peripheral_pulse_rhythm: record.peripheralPulseRhythm,
    carotid_pulse: record.carotidPulse,
    radial_pulse: record.radialPulse,
    pedal_pulse: record.pedalPulse,
    tibial_pulse: record.tibialPulse,
    precordial_sounds: record.precordialSounds,
    abnormal_sounds: record.abnormalSounds,
    apical_rhythm: record.apicalRhythm,
    fremitus: record.fremitus,
    cardiovascular_anomalies: record.cardiovascularAnomalies,
    cardiovascular_pathologies: record.cardiovascularPathologies,
    skin_lesions: record.skinLesions,
    skin_trophism: record.skinTrophism,
    varicose_veins: record.varicoseVeins,
    hernias: record.hernias,
    skin_anomalies: record.skinAnomalies,
    examination_genitals: record.examinationGenitals,
    abd_pared: record.abdPared,
    abd_sensibilidad: record.abdSensibilidad,
    abd_organomegalia: record.abdOrganomegalia,
    abd_masas: record.abdMasas,
    postura_ideal: record.posturaIdeal,
    postura_cifolordotica: record.posturaCifolordotica,
    postura_espalda_recta: record.posturaEspaldaRecta,
    postura_espalda_arqueada: record.posturaEspaldaArqueada,
    postura_escoleosis: record.posturaEscoleosis,
    postura_defectuosa_cabeza_hombros: record.posturaDefectuosaCabezaHombros,
    postura_defectuosa_columna_pelvis: record.posturaDefectuosaColumnaPelvis,
    postura_defectuosa_pierna_rodilla_pie: record.posturaDefectuosaPiernaRodillaPie,
    tronco_extensores_espalda: record.troncoExtensoresEspalda,
    tronco_flexores_laterales: record.troncoFlexoresLaterales,
    tronco_flexores_oblicuos: record.troncoFlexoresOblicuos,
    tronco_flexores_anteriores: record.troncoFlexoresAnteriores,
    flex_longitud_flexores_cadera: record.flexLongitudFlexoresCadera,
    flex_longitud_isquiosurales: record.flexLongitudIsquiosurales,
    flex_inclinacion_adelante: record.flexInclinacionAdelante,
    flex_amplitud_movimiento_tronco: record.flexAmplitudMovimientoTronco,
    flex_longitud_flexores_plantares: record.flexLongitudFlexoresPlantares,
    flex_tensor_fascia_lata: record.flexTensorFasciaLata,
    flex_longitud_glenohumerales: record.flexLongitudGlenohumerales,
    flex_longitud_rotadores_hombro: record.flexLongitudRotadoresHombro,
    flex_extension_flexion_cervical: record.flexExtensionFlexionCervical,
    mov_rotacion_caderas: record.movRotacionCaderas,
    mov_cuclillas: record.movCuclillas,
    mov_bisagra_cadera: record.movBisagraCadera,
    mov_cuadripedia_flexo_extension: record.movCuadripediaFlexoExtension,
    mov_cuadripedia_torsion: record.movCuadripediaTorsion,
    examination_observations: record.examinationObservations,
    ...(existing ? { updated_by: userId } : { created_by: userId }),
  }

  const { data, error } = existing
    ? await supabase.from("medical_records").update(dbRecord).eq("player_id", playerId).select().single()
    : await supabase.from("medical_records").insert(dbRecord).select().single()

  if (error) throw error

  return mapDbToMedicalRecord(data)
}
