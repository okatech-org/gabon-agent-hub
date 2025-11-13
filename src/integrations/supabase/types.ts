export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actes_administratifs: {
        Row: {
          agent_id: string
          contenu: string | null
          created_at: string | null
          date_creation: string | null
          date_signature: string | null
          fichier_url: string | null
          id: string
          numero_acte: string | null
          objet: string
          reference_signature: string | null
          signataire_id: string | null
          statut: Database["public"]["Enums"]["statut_acte"] | null
          type_acte: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          contenu?: string | null
          created_at?: string | null
          date_creation?: string | null
          date_signature?: string | null
          fichier_url?: string | null
          id?: string
          numero_acte?: string | null
          objet: string
          reference_signature?: string | null
          signataire_id?: string | null
          statut?: Database["public"]["Enums"]["statut_acte"] | null
          type_acte: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          contenu?: string | null
          created_at?: string | null
          date_creation?: string | null
          date_signature?: string | null
          fichier_url?: string | null
          id?: string
          numero_acte?: string | null
          objet?: string
          reference_signature?: string | null
          signataire_id?: string | null
          statut?: Database["public"]["Enums"]["statut_acte"] | null
          type_acte?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actes_administratifs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actes_administratifs_signataire_id_fkey"
            columns: ["signataire_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affectations: {
        Row: {
          agent_id: string
          created_at: string | null
          date_debut: string
          date_fin: string | null
          id: string
          motif: string | null
          poste_id: string | null
          structure_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          date_debut: string
          date_fin?: string | null
          id?: string
          motif?: string | null
          poste_id?: string | null
          structure_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          date_debut?: string
          date_fin?: string | null
          id?: string
          motif?: string | null
          poste_id?: string | null
          structure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affectations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affectations_poste_id_fkey"
            columns: ["poste_id"]
            isOneToOne: false
            referencedRelation: "postes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affectations_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          cadre: string | null
          categorie: string | null
          corps: string | null
          created_at: string | null
          date_naissance: string | null
          date_prise_fonction: string | null
          echelon: number | null
          email: string | null
          grade: string | null
          id: string
          identite_numerique: string | null
          lieu_naissance: string | null
          matricule: string
          nom: string
          photo_url: string | null
          poste_id: string | null
          prenoms: string | null
          sexe: string | null
          statut: Database["public"]["Enums"]["statut_agent"] | null
          structure_id: string | null
          telephone: string | null
          type_agent: Database["public"]["Enums"]["type_agent"]
          updated_at: string | null
        }
        Insert: {
          cadre?: string | null
          categorie?: string | null
          corps?: string | null
          created_at?: string | null
          date_naissance?: string | null
          date_prise_fonction?: string | null
          echelon?: number | null
          email?: string | null
          grade?: string | null
          id?: string
          identite_numerique?: string | null
          lieu_naissance?: string | null
          matricule: string
          nom: string
          photo_url?: string | null
          poste_id?: string | null
          prenoms?: string | null
          sexe?: string | null
          statut?: Database["public"]["Enums"]["statut_agent"] | null
          structure_id?: string | null
          telephone?: string | null
          type_agent: Database["public"]["Enums"]["type_agent"]
          updated_at?: string | null
        }
        Update: {
          cadre?: string | null
          categorie?: string | null
          corps?: string | null
          created_at?: string | null
          date_naissance?: string | null
          date_prise_fonction?: string | null
          echelon?: number | null
          email?: string | null
          grade?: string | null
          id?: string
          identite_numerique?: string | null
          lieu_naissance?: string | null
          matricule?: string
          nom?: string
          photo_url?: string | null
          poste_id?: string | null
          prenoms?: string | null
          sexe?: string | null
          statut?: Database["public"]["Enums"]["statut_agent"] | null
          structure_id?: string | null
          telephone?: string | null
          type_agent?: Database["public"]["Enums"]["type_agent"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_poste_id_fkey"
            columns: ["poste_id"]
            isOneToOne: false
            referencedRelation: "postes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      anomalies_recensement: {
        Row: {
          action_prise: string | null
          agent_id: string | null
          campagne_id: string
          created_at: string | null
          date_detection: string | null
          date_regularisation: string | null
          description: string | null
          est_regularise: boolean | null
          id: string
          matricule: string | null
          type_anomalie: string
          updated_at: string | null
        }
        Insert: {
          action_prise?: string | null
          agent_id?: string | null
          campagne_id: string
          created_at?: string | null
          date_detection?: string | null
          date_regularisation?: string | null
          description?: string | null
          est_regularise?: boolean | null
          id?: string
          matricule?: string | null
          type_anomalie: string
          updated_at?: string | null
        }
        Update: {
          action_prise?: string | null
          agent_id?: string | null
          campagne_id?: string
          created_at?: string | null
          date_detection?: string | null
          date_regularisation?: string | null
          description?: string | null
          est_regularise?: boolean | null
          id?: string
          matricule?: string | null
          type_anomalie?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_recensement_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomalies_recensement_campagne_id_fkey"
            columns: ["campagne_id"]
            isOneToOne: false
            referencedRelation: "campagnes_recensement"
            referencedColumns: ["id"]
          },
        ]
      }
      campagnes_recensement: {
        Row: {
          code: string
          created_at: string | null
          date_debut: string
          date_fin: string
          description: string | null
          id: string
          intitule: string
          ministeres: string[] | null
          notes: string | null
          perimetre: string | null
          provinces: string[] | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          date_debut: string
          date_fin: string
          description?: string | null
          id?: string
          intitule: string
          ministeres?: string[] | null
          notes?: string | null
          perimetre?: string | null
          provinces?: string[] | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          date_debut?: string
          date_fin?: string
          description?: string | null
          id?: string
          intitule?: string
          ministeres?: string[] | null
          notes?: string | null
          perimetre?: string | null
          provinces?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candidatures: {
        Row: {
          concours_id: string
          created_at: string | null
          date_naissance: string | null
          diplomes: Json | null
          email: string
          experience: Json | null
          id: string
          lieu_naissance: string | null
          nom: string
          note_dossier: number | null
          note_epreuve: number | null
          observations: string | null
          offre_id: string | null
          pieces_jointes: Json | null
          prenoms: string
          rang: number | null
          statut: Database["public"]["Enums"]["statut_candidature"] | null
          telephone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          concours_id: string
          created_at?: string | null
          date_naissance?: string | null
          diplomes?: Json | null
          email: string
          experience?: Json | null
          id?: string
          lieu_naissance?: string | null
          nom: string
          note_dossier?: number | null
          note_epreuve?: number | null
          observations?: string | null
          offre_id?: string | null
          pieces_jointes?: Json | null
          prenoms: string
          rang?: number | null
          statut?: Database["public"]["Enums"]["statut_candidature"] | null
          telephone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          concours_id?: string
          created_at?: string | null
          date_naissance?: string | null
          diplomes?: Json | null
          email?: string
          experience?: Json | null
          id?: string
          lieu_naissance?: string | null
          nom?: string
          note_dossier?: number | null
          note_epreuve?: number | null
          observations?: string | null
          offre_id?: string | null
          pieces_jointes?: Json | null
          prenoms?: string
          rang?: number | null
          statut?: Database["public"]["Enums"]["statut_candidature"] | null
          telephone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatures_concours_id_fkey"
            columns: ["concours_id"]
            isOneToOne: false
            referencedRelation: "concours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidatures_offre_id_fkey"
            columns: ["offre_id"]
            isOneToOne: false
            referencedRelation: "offres_poste"
            referencedColumns: ["id"]
          },
        ]
      }
      concours: {
        Row: {
          code: string
          conditions: string | null
          created_at: string | null
          date_cloture: string | null
          date_epreuve: string | null
          date_ouverture: string | null
          description: string | null
          id: string
          intitule: string
          nombre_postes: number | null
          pieces_requises: Json | null
          statut: string | null
          type_concours: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          conditions?: string | null
          created_at?: string | null
          date_cloture?: string | null
          date_epreuve?: string | null
          date_ouverture?: string | null
          description?: string | null
          id?: string
          intitule: string
          nombre_postes?: number | null
          pieces_requises?: Json | null
          statut?: string | null
          type_concours?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          conditions?: string | null
          created_at?: string | null
          date_cloture?: string | null
          date_epreuve?: string | null
          date_ouverture?: string | null
          description?: string | null
          id?: string
          intitule?: string
          nombre_postes?: number | null
          pieces_requises?: Json | null
          statut?: string | null
          type_concours?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      evenements_carriere: {
        Row: {
          agent_id: string
          ancien_echelon: number | null
          ancien_grade: string | null
          created_at: string | null
          date_evenement: string
          description: string | null
          id: string
          nouveau_echelon: number | null
          nouveau_grade: string | null
          pieces_jointes: Json | null
          type_evenement: Database["public"]["Enums"]["type_evenement"]
        }
        Insert: {
          agent_id: string
          ancien_echelon?: number | null
          ancien_grade?: string | null
          created_at?: string | null
          date_evenement: string
          description?: string | null
          id?: string
          nouveau_echelon?: number | null
          nouveau_grade?: string | null
          pieces_jointes?: Json | null
          type_evenement: Database["public"]["Enums"]["type_evenement"]
        }
        Update: {
          agent_id?: string
          ancien_echelon?: number | null
          ancien_grade?: string | null
          created_at?: string | null
          date_evenement?: string
          description?: string | null
          id?: string
          nouveau_echelon?: number | null
          nouveau_grade?: string | null
          pieces_jointes?: Json | null
          type_evenement?: Database["public"]["Enums"]["type_evenement"]
        }
        Relationships: [
          {
            foreignKeyName: "evenements_carriere_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      indicateurs_reforme: {
        Row: {
          created_at: string | null
          date_mesure: string | null
          id: string
          nom_indicateur: string
          observations: string | null
          projet_id: string
          unite: string | null
          valeur_cible: number | null
          valeur_reelle: number | null
        }
        Insert: {
          created_at?: string | null
          date_mesure?: string | null
          id?: string
          nom_indicateur: string
          observations?: string | null
          projet_id: string
          unite?: string | null
          valeur_cible?: number | null
          valeur_reelle?: number | null
        }
        Update: {
          created_at?: string | null
          date_mesure?: string | null
          id?: string
          nom_indicateur?: string
          observations?: string | null
          projet_id?: string
          unite?: string | null
          valeur_cible?: number | null
          valeur_reelle?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "indicateurs_reforme_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets_reforme"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_audit: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      offres_poste: {
        Row: {
          concours_id: string | null
          created_at: string | null
          description: string | null
          id: string
          intitule: string
          poste_id: string | null
          profil_recherche: string | null
        }
        Insert: {
          concours_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          intitule: string
          poste_id?: string | null
          profil_recherche?: string | null
        }
        Update: {
          concours_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          intitule?: string
          poste_id?: string | null
          profil_recherche?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offres_poste_concours_id_fkey"
            columns: ["concours_id"]
            isOneToOne: false
            referencedRelation: "concours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offres_poste_poste_id_fkey"
            columns: ["poste_id"]
            isOneToOne: false
            referencedRelation: "postes"
            referencedColumns: ["id"]
          },
        ]
      }
      postes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          grade_minimal: string | null
          id: string
          intitule: string
          localisation: string | null
          statut: Database["public"]["Enums"]["statut_poste"] | null
          structure_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          grade_minimal?: string | null
          id?: string
          intitule: string
          localisation?: string | null
          statut?: Database["public"]["Enums"]["statut_poste"] | null
          structure_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          grade_minimal?: string | null
          id?: string
          intitule?: string
          localisation?: string | null
          statut?: Database["public"]["Enums"]["statut_poste"] | null
          structure_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postes_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nom: string
          photo_url: string | null
          prenoms: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          nom: string
          photo_url?: string | null
          prenoms?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string
          photo_url?: string | null
          prenoms?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projets_reforme: {
        Row: {
          budget: number | null
          code: string
          created_at: string | null
          date_debut: string | null
          date_fin_prevue: string | null
          date_fin_reelle: string | null
          description: string | null
          id: string
          intitule: string
          objectifs: string | null
          pilote_id: string | null
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          code: string
          created_at?: string | null
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          description?: string | null
          id?: string
          intitule: string
          objectifs?: string | null
          pilote_id?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          code?: string
          created_at?: string | null
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          description?: string | null
          id?: string
          intitule?: string
          objectifs?: string | null
          pilote_id?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projets_reforme_pilote_id_fkey"
            columns: ["pilote_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      statut_recensement_agent: {
        Row: {
          agent_id: string
          campagne_id: string
          created_at: string | null
          date_recensement: string | null
          id: string
          observations: string | null
          reference_biometrique: string | null
          statut: Database["public"]["Enums"]["statut_recensement"]
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          campagne_id: string
          created_at?: string | null
          date_recensement?: string | null
          id?: string
          observations?: string | null
          reference_biometrique?: string | null
          statut: Database["public"]["Enums"]["statut_recensement"]
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          campagne_id?: string
          created_at?: string | null
          date_recensement?: string | null
          id?: string
          observations?: string | null
          reference_biometrique?: string | null
          statut?: Database["public"]["Enums"]["statut_recensement"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "statut_recensement_agent_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "statut_recensement_agent_campagne_id_fkey"
            columns: ["campagne_id"]
            isOneToOne: false
            referencedRelation: "campagnes_recensement"
            referencedColumns: ["id"]
          },
        ]
      }
      structures: {
        Row: {
          code: string
          created_at: string | null
          id: string
          localisation: string | null
          nom: string
          parent_id: string | null
          responsable_id: string | null
          type_structure: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          localisation?: string | null
          nom: string
          parent_id?: string | null
          responsable_id?: string | null
          type_structure: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          localisation?: string | null
          nom?: string
          parent_id?: string | null
          responsable_id?: string | null
          type_structure?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "structures_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "structures_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "drh_ministre" | "drh_local" | "agent" | "auditeur"
      statut_acte:
        | "brouillon"
        | "en_validation"
        | "valide"
        | "signe"
        | "archive"
      statut_agent:
        | "actif"
        | "detache"
        | "conge"
        | "disponibilite"
        | "retraite"
        | "suspendu"
      statut_candidature: "deposee" | "en_cours" | "acceptee" | "refusee"
      statut_poste: "occupe" | "vacant" | "gele"
      statut_recensement: "recense" | "non_recense" | "en_litige" | "regularise"
      type_agent: "fonctionnaire" | "contractuel" | "stagiaire" | "autre"
      type_evenement:
        | "titularisation"
        | "avancement"
        | "promotion"
        | "detachement"
        | "mise_a_retraite"
        | "sanction"
        | "autre"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "drh_ministre", "drh_local", "agent", "auditeur"],
      statut_acte: ["brouillon", "en_validation", "valide", "signe", "archive"],
      statut_agent: [
        "actif",
        "detache",
        "conge",
        "disponibilite",
        "retraite",
        "suspendu",
      ],
      statut_candidature: ["deposee", "en_cours", "acceptee", "refusee"],
      statut_poste: ["occupe", "vacant", "gele"],
      statut_recensement: ["recense", "non_recense", "en_litige", "regularise"],
      type_agent: ["fonctionnaire", "contractuel", "stagiaire", "autre"],
      type_evenement: [
        "titularisation",
        "avancement",
        "promotion",
        "detachement",
        "mise_a_retraite",
        "sanction",
        "autre",
      ],
    },
  },
} as const
