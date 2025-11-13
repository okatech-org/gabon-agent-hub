import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Building2,
  UserCheck,
  FileText,
  Settings,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IastedChat } from "@/components/ministre/IastedChat";
import { SimulationPanel } from "@/components/ministre/SimulationPanel";

export default function MinistreDashboard() {
  const [isIastedOpen, setIsIastedOpen] = useState(false);

  // Statistiques globales des agents
  const { data: statsAgents } = useQuery({
    queryKey: ['stats-agents'],
    queryFn: async () => {
      const { data: agents } = await supabase
        .from('agents')
        .select('type_agent, statut, grade, categorie, sexe');
      
      if (!agents) return null;

      return {
        total: agents.length,
        parType: agents.reduce((acc: any, a) => {
          acc[a.type_agent] = (acc[a.type_agent] || 0) + 1;
          return acc;
        }, {}),
        parStatut: agents.reduce((acc: any, a) => {
          acc[a.statut] = (acc[a.statut] || 0) + 1;
          return acc;
        }, {}),
        parGenre: agents.reduce((acc: any, a) => {
          acc[a.sexe] = (acc[a.sexe] || 0) + 1;
          return acc;
        }, {}),
      };
    },
  });

  // Actes en attente de validation
  const { data: actesEnAttente } = useQuery({
    queryKey: ['actes-en-attente'],
    queryFn: async () => {
      const { data } = await supabase
        .from('actes_administratifs')
        .select('*')
        .in('statut', ['brouillon', 'en_validation'])
        .order('created_at', { ascending: false })
        .limit(10);
      
      return data || [];
    },
  });

  // Structures et postes
  const { data: statsStructures } = useQuery({
    queryKey: ['stats-structures'],
    queryFn: async () => {
      const { data: structures } = await supabase
        .from('structures')
        .select('type_structure, localisation');
      
      const { data: postes } = await supabase
        .from('postes')
        .select('statut');
      
      return {
        totalStructures: structures?.length || 0,
        totalPostes: postes?.length || 0,
        postesVacants: postes?.filter(p => p.statut === 'vacant').length || 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Espace Ministre</h1>
            <p className="text-muted-foreground">
              Ministère de la Fonction Publique - République Gabonaise
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsIastedOpen(!isIastedOpen)}
              className="neu-button neu-button-admin gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {isIastedOpen ? "Fermer" : "Parler avec"} iAsted
            </Button>
            <div className="neu-raised w-16 h-16 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat iAsted */}
      {isIastedOpen && (
        <div className="neu-card p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              iAsted - Assistant IA du Ministre
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Posez vos questions sur la fonction publique, demandez des analyses ou des synthèses
            </p>
          </div>
          <IastedChat />
        </div>
      )}

      <div className="neu-card p-2">
        <Tabs defaultValue="vision" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2 p-1">
            <TabsTrigger value="vision" className="neu-button data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vision Globale</TabsTrigger>
            <TabsTrigger value="decisions" className="neu-button data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Décisions</TabsTrigger>
            <TabsTrigger value="simulations" className="neu-button data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Simulations</TabsTrigger>
            <TabsTrigger value="reformes" className="neu-button data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Réformes</TabsTrigger>
            <TabsTrigger value="alertes" className="neu-button data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Alertes</TabsTrigger>
          </TabsList>

          {/* Vision Globale */}
          <TabsContent value="vision" className="space-y-6 p-4">
            {/* KPIs principaux */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="neu-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{statsAgents?.total || 0}</div>
                <p className="text-sm font-medium text-foreground">Total Agents</p>
                <p className="text-xs text-muted-foreground">Fonction publique gabonaise</p>
              </div>

              <div className="neu-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{statsStructures?.totalStructures || 0}</div>
                <p className="text-sm font-medium text-foreground">Structures</p>
                <p className="text-xs text-muted-foreground">Ministères et directions</p>
              </div>

              <div className="neu-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-info" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{statsStructures?.postesVacants || 0}</div>
                <p className="text-sm font-medium text-foreground">Postes Vacants</p>
                <p className="text-xs text-muted-foreground">Sur {statsStructures?.totalPostes || 0} postes</p>
              </div>

              <div className="neu-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{actesEnAttente?.length || 0}</div>
                <p className="text-sm font-medium text-foreground">Actes en attente</p>
                <p className="text-xs text-muted-foreground">Nécessitent votre validation</p>
              </div>
            </div>

            {/* Répartition des effectifs */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold mb-2">Répartition par Type d'Agent</h3>
                <p className="text-sm text-muted-foreground mb-4">Catégories de personnels</p>
                <div className="space-y-3">
                  {statsAgents?.parType && Object.entries(statsAgents.parType).map(([type, count]: [string, any]) => (
                    <div key={type} className="neu-inset p-3 rounded-lg flex items-center justify-between">
                      <span className="text-sm capitalize font-medium">{type}</span>
                      <span className="neu-raised px-3 py-1 text-sm font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="neu-card p-6">
                <h3 className="text-lg font-semibold mb-2">Équilibre Homme/Femme</h3>
                <p className="text-sm text-muted-foreground mb-4">Répartition par genre</p>
                <div className="space-y-3">
                  {statsAgents?.parGenre && Object.entries(statsAgents.parGenre).map(([genre, count]: [string, any]) => (
                    <div key={genre} className="neu-inset p-3 rounded-lg flex items-center justify-between">
                      <span className="text-sm font-medium">{genre === 'M' ? 'Hommes' : genre === 'F' ? 'Femmes' : 'Non précisé'}</span>
                      <span className="neu-raised px-3 py-1 text-sm font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Décisions en attente */}
          <TabsContent value="decisions" className="space-y-6 p-4">
            <div className="neu-card p-6">
              <h3 className="text-xl font-semibold mb-2">Actes en attente de validation</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Actes nécessitant votre signature ou votre avis
              </p>
              {actesEnAttente && actesEnAttente.length > 0 ? (
                <div className="space-y-4">
                  {actesEnAttente.map((acte) => (
                    <div key={acte.id} className="neu-inset p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="neu-raised px-2 py-1 text-xs font-medium">{acte.type_acte}</span>
                            <span className="neu-raised px-2 py-1 text-xs font-medium">{acte.statut}</span>
                          </div>
                          <p className="font-medium mb-1">{acte.objet}</p>
                          <p className="text-sm text-muted-foreground">
                            {acte.numero_acte || 'Sans numéro'} - Créé le {new Date(acte.date_creation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="neu-button text-sm px-4 py-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Consulter
                          </button>
                          <button className="neu-button neu-button-admin text-sm px-4 py-2">
                            Valider
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 neu-inset rounded-lg">
                  Aucun acte en attente de validation
                </p>
              )}
            </div>
          </TabsContent>

          {/* Simulations */}
          <TabsContent value="simulations" className="space-y-6 p-4">
            <SimulationPanel />
          </TabsContent>

          {/* Réformes */}
          <TabsContent value="reformes" className="space-y-6 p-4">
            <div className="neu-card p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Chantiers de Modernisation
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Projets stratégiques en cours
              </p>
              <div className="space-y-4">
                <div className="neu-inset p-5 rounded-lg">
                  <h4 className="font-semibold mb-3">Recensement Biométrique National</h4>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 neu-inset h-3 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-bold neu-raised px-3 py-1">65%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Objectif: Recensement complet de tous les agents avant fin 2025
                  </p>
                </div>

                <div className="neu-inset p-5 rounded-lg">
                  <h4 className="font-semibold mb-3">Digitalisation des Dossiers RH</h4>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 neu-inset h-3 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-secondary to-secondary/80 h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-sm font-bold neu-raised px-3 py-1">40%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Transition vers le tout-numérique pour les actes administratifs
                  </p>
                </div>

                <div className="neu-inset p-5 rounded-lg">
                  <h4 className="font-semibold mb-3">Révision du Statut Général</h4>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 neu-inset h-3 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-info to-info/80 h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-bold neu-raised px-3 py-1">20%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Modernisation du cadre juridique de la fonction publique
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Alertes */}
          <TabsContent value="alertes" className="space-y-6 p-4">
            <div className="neu-card p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Points d'Attention
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Éléments nécessitant votre attention immédiate
              </p>
              <div className="space-y-4">
                <div className="neu-inset p-4 rounded-lg flex items-start gap-4">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Pic de départs à la retraite</p>
                    <p className="text-sm text-muted-foreground">
                      Plus de 150 agents atteindront l'âge de la retraite dans les 12 prochains mois
                    </p>
                  </div>
                </div>

                <div className="neu-inset p-4 rounded-lg flex items-start gap-4">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Conseil des Ministres - 15 janvier</p>
                    <p className="text-sm text-muted-foreground">
                      Présentation du bilan de la réforme de la fonction publique
                    </p>
                  </div>
                </div>

                <div className="neu-inset p-4 rounded-lg flex items-start gap-4">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Settings className="h-5 w-5 text-info" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Mise à jour système recommandée</p>
                    <p className="text-sm text-muted-foreground">
                      Nouvelles fonctionnalités disponibles pour ADMIN.GA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
