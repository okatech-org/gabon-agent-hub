import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  FileCheck, 
  Building2,
  UserCheck,
  Shield,
} from "lucide-react";
import { IAstedButton } from "@/components/ministre/IAstedButton";
import { IAstedInterface } from "@/components/ministre/IAstedInterface";

export default function MinistreDashboard() {
  const [isIastedOpen, setIsIastedOpen] = useState(false);
  const [showIastedInterface, setShowIastedInterface] = useState(false);

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
    <>
      <div className="w-full p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="neu-card p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-1 text-2xl font-bold md:text-3xl">Espace Ministre</h1>
                <p className="text-sm text-muted-foreground md:text-base">
                  Ministère de la Fonction Publique - République Gabonaise
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="neu-raised flex h-14 w-14 items-center justify-center md:h-16 md:w-16">
                  <Shield className="h-7 w-7 text-primary md:h-8 md:w-8" />
                </div>
              </div>
            </div>
          </div>

        <div className="space-y-6">
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
          </div>
        </div>
      </div>
      
      {/* iAsted Button */}
      <IAstedButton 
        onClick={() => setShowIastedInterface(!showIastedInterface)}
        size="lg"
        isInterfaceOpen={showIastedInterface}
      />
      
      {/* iAsted Interface */}
      <IAstedInterface 
        isOpen={showIastedInterface}
        onClose={() => setShowIastedInterface(false)}
      />
    </>
  );
}
