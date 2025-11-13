import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  MessageSquare
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Espace Ministre
          </h1>
          <p className="text-muted-foreground text-lg">
            Ministère de la Fonction Publique - République Gabonaise
          </p>
        </div>
        <Button 
          onClick={() => setIsIastedOpen(!isIastedOpen)}
          className="gap-2"
          variant={isIastedOpen ? "secondary" : "default"}
        >
          <MessageSquare className="h-4 w-4" />
          {isIastedOpen ? "Fermer" : "Parler avec"} iAsted
        </Button>
      </div>

      {/* Chat iAsted */}
      {isIastedOpen && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              iAsted - Assistant IA du Ministre
            </CardTitle>
            <CardDescription>
              Posez vos questions sur la fonction publique, demandez des analyses ou des synthèses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IastedChat />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="vision" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="vision">Vision Globale</TabsTrigger>
          <TabsTrigger value="decisions">Décisions</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
          <TabsTrigger value="reformes">Réformes</TabsTrigger>
          <TabsTrigger value="alertes">Alertes</TabsTrigger>
        </TabsList>

        {/* Vision Globale */}
        <TabsContent value="vision" className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Agents
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsAgents?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Fonction publique gabonaise
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Structures
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsStructures?.totalStructures || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ministères et directions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Postes Vacants
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsStructures?.postesVacants || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sur {statsStructures?.totalPostes || 0} postes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Actes en attente
                </CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {actesEnAttente?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nécessitent votre validation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Répartition des effectifs */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type d'Agent</CardTitle>
                <CardDescription>Catégories de personnels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {statsAgents?.parType && Object.entries(statsAgents.parType).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Équilibre Homme/Femme</CardTitle>
                <CardDescription>Répartition par genre</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {statsAgents?.parGenre && Object.entries(statsAgents.parGenre).map(([genre, count]: [string, any]) => (
                  <div key={genre} className="flex items-center justify-between">
                    <span className="text-sm">{genre === 'M' ? 'Hommes' : genre === 'F' ? 'Femmes' : 'Non précisé'}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Décisions en attente */}
        <TabsContent value="decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actes en attente de validation</CardTitle>
              <CardDescription>
                Actes nécessitant votre signature ou votre avis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actesEnAttente && actesEnAttente.length > 0 ? (
                <div className="space-y-4">
                  {actesEnAttente.map((acte) => (
                    <div key={acte.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{acte.type_acte}</Badge>
                          <Badge variant={acte.statut === 'brouillon' ? 'secondary' : 'default'}>
                            {acte.statut}
                          </Badge>
                        </div>
                        <p className="font-medium">{acte.objet}</p>
                        <p className="text-sm text-muted-foreground">
                          {acte.numero_acte || 'Sans numéro'} - Créé le {new Date(acte.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Consulter
                        </Button>
                        <Button size="sm">
                          Valider
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun acte en attente de validation
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulations */}
        <TabsContent value="simulations" className="space-y-6">
          <SimulationPanel />
        </TabsContent>

        {/* Réformes */}
        <TabsContent value="reformes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Chantiers de Modernisation
              </CardTitle>
              <CardDescription>
                Projets stratégiques en cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Recensement Biométrique National</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Objectif: Recensement complet de tous les agents avant fin 2025
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Digitalisation des Dossiers RH</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-sm font-medium">40%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Transition vers le tout-numérique pour les actes administratifs
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Révision du Statut Général</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Modernisation du cadre juridique de la fonction publique
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertes */}
        <TabsContent value="alertes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Points d'Attention
              </CardTitle>
              <CardDescription>
                Éléments nécessitant votre attention immédiate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border border-destructive/50 rounded-lg bg-destructive/5">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Pic de départs à la retraite</p>
                    <p className="text-sm text-muted-foreground">
                      Plus de 150 agents atteindront l'âge de la retraite dans les 12 prochains mois
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border border-primary/50 rounded-lg bg-primary/5">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Conseil des Ministres - 15 janvier</p>
                    <p className="text-sm text-muted-foreground">
                      Présentation du bilan de la réforme de la fonction publique
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border border-primary/50 rounded-lg bg-primary/5">
                  <Settings className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Mise à jour système recommandée</p>
                    <p className="text-sm text-muted-foreground">
                      Nouvelles fonctionnalités disponibles pour ADMIN.GA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
