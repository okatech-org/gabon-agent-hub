import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { initializeDemoAccounts } from "@/scripts/initializeDemoAccounts";
import { Link } from "react-router-dom";

export default function InitDemo() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [results, setResults] = useState<{
    created: string[];
    existing: string[];
    errors: { email: string; error: string }[];
  } | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setResults(null);
    
    try {
      const initResults = await initializeDemoAccounts();
      setResults(initResults);
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Initialisation des Comptes Démo</CardTitle>
              <CardDescription>
                Créer les 7 comptes démo pour ADMIN.GA
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="neu-inset p-4 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              Cette page permet de créer automatiquement les 7 comptes démo suivants :
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                <span><strong>Ministre</strong> - ministre.demo@admin.ga</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                <span><strong>Secrétaire Général</strong> - sg.demo@admin.ga</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-2" />
                <span><strong>Directeur de Cabinet</strong> - cabinet.demo@admin.ga</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2" />
                <span><strong>DRH</strong> - drh.demo@admin.ga</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-info mt-2" />
                <span><strong>Gestionnaire RH</strong> - gestionnaire.demo@admin.ga</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span><strong>Agent Fonctionnaire</strong> - fonctionnaire.demo@admin.ga</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
                <span><strong>Candidat aux Concours</strong> - candidat.demo@admin.ga</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground italic mt-3">
              Mot de passe pour tous les comptes : <strong>Demo2024!</strong>
            </p>
          </div>

          <Button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full"
            size="lg"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Initialisation en cours...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Initialiser les Comptes Démo
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-3">
              {results.created.length > 0 && (
                <div className="neu-inset p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <p className="font-semibold text-success">
                      {results.created.length} compte(s) créé(s)
                    </p>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {results.created.map(email => (
                      <li key={email}>✓ {email}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.existing.length > 0 && (
                <div className="neu-inset p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-info" />
                    <p className="font-semibold text-info">
                      {results.existing.length} compte(s) existant(s)
                    </p>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {results.existing.map(email => (
                      <li key={email}>ℹ️ {email}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="neu-inset p-4 rounded-lg border-2 border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <p className="font-semibold text-destructive">
                      {results.errors.length} erreur(s)
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {results.errors.map((error, idx) => (
                      <li key={idx} className="text-destructive">
                        <strong>{error.email}:</strong> {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <Link to="/demo-accounts" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Tester les Comptes Démo
                  </Button>
                </Link>
                <Link to="/auth/login" className="flex-1">
                  <Button className="w-full">
                    Aller à la Connexion
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
