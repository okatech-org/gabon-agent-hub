import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, PlayCircle, TrendingUp } from "lucide-react";

export function SimulationPanel() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationType, setSimulationType] = useState<string>('gel_recrutement');
  const [duree, setDuree] = useState([3]);
  const [categorie, setCategorie] = useState<string>('A');
  const [results, setResults] = useState<any>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    setResults(null);

    try {
      let prompt = '';
      
      if (simulationType === 'gel_recrutement') {
        prompt = `Simule l'impact d'un gel des recrutements de catégorie ${categorie} pendant ${duree[0]} ans. 
        
Analyse:
1. Impact sur les effectifs par direction
2. Évolution de la pyramide des âges
3. Risques sur la continuité de service
4. Impact budgétaire (masse salariale)

Propose 3 scénarios alternatifs avec leurs avantages et inconvénients.`;
      } else if (simulationType === 'departs_retraite') {
        prompt = `Analyse l'impact des départs à la retraite sur les ${duree[0]} prochaines années.
        
Évalue:
1. Nombre de départs prévus par année et par direction
2. Postes stratégiques concernés
3. Risques de rupture de service
4. Besoins en recrutement pour compenser

Recommande un plan d'action avec calendrier.`;
      } else if (simulationType === 'reforme_statut') {
        prompt = `Simule l'impact d'une révision du statut général de la fonction publique incluant:
- Nouveau système de rémunération
- Mobilité accrue entre ministères
- Évaluation basée sur la performance
        
Analyse les impacts sur ${duree[0]} ans:
1. Motivation et rétention des agents
2. Coûts budgétaires
3. Complexité de mise en œuvre
4. Résistances prévisibles

Propose une stratégie de déploiement progressive.`;
      }

      const { data, error } = await supabase.functions.invoke('iasted-agent', {
        body: { 
          query: prompt,
          action: 'simulation',
          context: `Simulation: ${simulationType}, Durée: ${duree[0]} ans, Catégorie: ${categorie || 'toutes'}`
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResults({
        type: simulationType,
        duree: duree[0],
        categorie: categorie,
        analyse: data.response,
        timestamp: new Date().toISOString(),
      });

      toast.success("Simulation terminée");

    } catch (error: any) {
      console.error('Error running simulation:', error);
      toast.error(error.message || 'Erreur lors de la simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="neu-card p-5 md:p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Simulateur de Scénarios</h3>
          <p className="text-sm text-muted-foreground">
            Modélisez l'impact de réformes et décisions stratégiques sur la fonction publique
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Type de simulation</Label>
            <Select value={simulationType} onValueChange={setSimulationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gel_recrutement">
                  Gel des recrutements
                </SelectItem>
                <SelectItem value="departs_retraite">
                  Départs à la retraite
                </SelectItem>
                <SelectItem value="reforme_statut">
                  Réforme du statut général
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {simulationType === 'gel_recrutement' && (
            <div className="space-y-2">
              <Label>Catégorie concernée</Label>
              <Select value={categorie} onValueChange={setCategorie}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Catégorie A</SelectItem>
                  <SelectItem value="B">Catégorie B</SelectItem>
                  <SelectItem value="C">Catégorie C</SelectItem>
                  <SelectItem value="toutes">Toutes catégories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Durée de projection: {duree[0]} an(s)</Label>
            <Slider
              value={duree}
              onValueChange={setDuree}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Simuler sur une période de {duree[0]} an{duree[0] > 1 ? 's' : ''}
            </p>
          </div>

          <button 
            onClick={runSimulation} 
            disabled={isSimulating}
            className="neu-button neu-button-admin w-full flex items-center justify-center gap-2"
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Simulation en cours...
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                Lancer la simulation
              </>
            )}
          </button>
        </div>
      </div>

      {results && (
        <div className="neu-card p-5 md:p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-xl font-semibold mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Résultats de simulation
            </h3>
            <p className="text-sm text-muted-foreground">
              {simulationType === 'gel_recrutement' && `Gel des recrutements catégorie ${results.categorie} sur ${results.duree} ans`}
              {simulationType === 'departs_retraite' && `Départs à la retraite sur ${results.duree} ans`}
              {simulationType === 'reforme_statut' && `Réforme du statut général sur ${results.duree} ans`}
            </p>
          </div>
          
          <div className="neu-inset rounded-lg p-5 mb-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm">{results.analyse}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="neu-button text-sm px-4 py-2">
              Exporter en PDF
            </button>
            <button className="neu-button text-sm px-4 py-2">
              Partager avec le Cabinet
            </button>
            <button className="neu-button text-sm px-4 py-2">
              Archiver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
