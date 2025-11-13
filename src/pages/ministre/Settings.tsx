import { useState } from "react";
import { Settings, Bell, Shield, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { toast } from "@/lib/toast";

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [fontScale, setFontScale] = useState<number[]>([100]); // percent

  const savePreferences = () => {
    toast.success("Préférences enregistrées");
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Paramètres</h1>
              <p className="text-sm text-muted-foreground">
                Préférences de compte et de l'interface
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary" />
              Notifications & Alertes
            </CardTitle>
            <CardDescription>Configurer les canaux et le niveau des notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notifications par e-mail</Label>
                <p className="text-xs text-muted-foreground">
                  Recevoir un résumé et les alertes importantes
                </p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notifications push</Label>
                <p className="text-xs text-muted-foreground">
                  Alerte immédiate pour les événements critiques
                </p>
              </div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Limiter aux alertes critiques</Label>
                <p className="text-xs text-muted-foreground">
                  N'envoyer que les alertes à priorité élevée
                </p>
              </div>
              <Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-info" />
              Sécurité
            </CardTitle>
            <CardDescription>Options de sécurité du compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Authentification à deux facteurs (2FA)</Label>
                <p className="text-xs text-muted-foreground">
                  Renforcez la sécurité lors de la connexion
                </p>
              </div>
              <Switch checked={twoFA} onCheckedChange={setTwoFA} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <Label htmlFor="password">Changer le mot de passe</Label>
                <Input id="password" type="password" placeholder="Nouveau mot de passe" />
              </div>
              <div className="flex items-end">
                <Button className="w-full" variant="outline" onClick={() => toast.info("Fonction à connecter")}>
                  Mettre à jour
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" />
              Affichage & Accessibilité
            </CardTitle>
            <CardDescription>Personnaliser l'apparence de l'interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Thème</Label>
              <ThemeToggle />
            </div>
            <div>
              <Label className="font-medium block mb-2">Taille du texte</Label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-10">90%</span>
                <Slider value={fontScale} onValueChange={setFontScale} min={90} max={130} step={5} />
                <span className="text-xs text-muted-foreground w-10 text-right">130%</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Taille actuelle: <span className="font-semibold">{fontScale[0]}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={savePreferences}>Enregistrer</Button>
        </div>
      </div>
    </div>
  );
}


