// No 'use client' — utility file

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: 'AdminEntreprise' | 'Collaborateur' | 'SuperAdmin'
  entreprise_id: number
  email_verified_at: string | null
}

export interface CreditsBalance {
  abonnement_credits: number
  pack_credits: number
  total: number
}

export interface CreditPack {
  id: number
  nom: string
  credits: number
  prix: number
  is_active: boolean
}

export interface Transaction {
  id: number
  type_transaction: string
  montant: number
  description: string | null
  date_transaction: string
  user: { id: number; nom: string; prenom: string } | null
}

export interface PlanSaaS {
  id: number
  nom_plan: string
  prix: number
  credits_alloues: number
  is_active: boolean
}

export interface Abonnement {
  id: number
  date_debut: string
  date_fin: string
  statut: string
}

export interface AbonnementCurrent {
  plan: PlanSaaS
  abonnement: Abonnement
  next_plan: PlanSaaS | null
  abonnement_credits: number
  pack_credits: number
  total_credits: number
}

export interface ProjetDAO {
  id: number
  titre_projet: string
  statut: 'Nouveau' | 'En_analyse' | 'Termine' | 'Echoue'
  created_at: string
  document_d_a_os?: DocumentDAO[]
  resultat_analyse?: ResultatAnalyse | null
}

export interface DocumentDAO {
  id: number
  nom_fichier: string
  taille: number
}

export interface ResultatAnalyse {
  id: number
  resume_global: string
  date_analyse: string
}

export interface ExigenceDAO {
  id: number
  type: 'administratif' | 'technique'
  description: string
  est_obligatoire: boolean
}

export interface ConformiteChecklist {
  exigence: ExigenceDAO
  document: DocumentBibliotheque | null
  statut: 'conforme' | 'manquant' | 'expire'
}

export interface ConformiteRapport {
  projet: ProjetDAO
  score_global: number
  resume: string
  checklists: ConformiteChecklist[]
}

export interface MemoireTechnique {
  statut: 'En_generation' | 'Termine' | 'Echoue'
  contenu: string | null
  chemin_export: string | null
  date_generation: string | null
}

export interface DocumentBibliotheque {
  id: number
  document_groupe_id: string
  titre: string
  categorie: 'administratif' | 'technique' | 'cv' | 'reference' | 'autre'
  date_expiration: string | null
  version: number
  is_current: boolean
  date_upload: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AdminEntreprise {
  id: number
  raison_sociale: string
  ice: string
  statut: 'active' | 'inactive'
  abonnement_credits_restants: number
  pack_credits_restants: number
  created_at: string
}

export interface AdminAbonnement {
  id: number
  entreprise: { id: number; raison_sociale: string }
  plan_saa_s: { id: number; nom_plan: string; prix: number }
  date_debut: string
  date_fin: string
  statut: string
  next_plan: PlanSaaS | null
}

export interface CompanyUser {
  id: number
  nom: string
  prenom: string
  email: string
  role: 'AdminEntreprise' | 'Collaborateur'
  dernier_login: string | null
  created_at: string
}
