import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserSquare2 } from "lucide-react";

export default function Dossier() {
  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <UserSquare2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mon Dossier</h1>
              <p className="text-sm text-muted-foreground">
                Informations personnelles et administratives (aperçu)
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Identité</CardTitle>
            <CardDescription>Données fictives à connecter à Supabase</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Matricule</Label>
              <Input value="FP-2025-001234" readOnly />
            </div>
            <div>
              <Label>Nom</Label>
              <Input value="NGUEMA" readOnly />
            </div>
            <div>
              <Label>Prénoms</Label>
              <Input value="Albert Junior" readOnly />
            </div>
            <div>
              <Label>Corps / Cadre</Label>
              <Input value="Administratif / A2" readOnly />
            </div>
            <div>
              <Label>Statut</Label>
              <div className="mt-2">
                <Badge className="bg-success/10 text-success">Titulaire</Badge>
              </div>
            </div>
            <div>
              <Label>Structure</Label>
              <Input value="Ministère de la Fonction Publique" readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
            <CardDescription>Mettre à jour vos informations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input placeholder="prenom.nom@exemple.com" />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input placeholder="+241 06 XX XX XX" />
            </div>
            <div className="md:col-span-2">
              <Label>Adresse</Label>
              <Input placeholder="Quartier - Ville" />
            </div>
            <div className="md:col-span-2">
              <Button className="mt-2">Enregistrer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


