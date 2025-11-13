import { useState } from "react";
import { Settings, Bell, Shield, Eye, Save, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { toast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsRH() {
  const { user } = useAuth();
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationPush, setNotificationPush] = useState(true);
  const [notificationCritical, setNotificationCritical] = useState(true);
  const [autoValidation, setAutoValidation] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleSave = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex items-center gap-4">
          <div className="neu-raised w-14 h-14 flex items-center justify-center">
            <Settings className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Paramètres</h1>
            <p className="text-muted-foreground">
              Configuration de votre espace Gestionnaire RH
            </p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="neu-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <CardTitle>Profil Utilisateur</CardTitle>
          </div>
          <CardDescription>Informations de votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Input value="Gestionnaire RH" disabled />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="neu-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notifications & Alertes</CardTitle>
          </div>
          <CardDescription>Gérer vos préférences de notification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir les notifications importantes par email
              </p>
            </div>
            <Switch checked={notificationEmail} onCheckedChange={setNotificationEmail} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications push</Label>
              <p className="text-sm text-muted-foreground">
                Notifications en temps réel dans l'application
              </p>
            </div>
            <Switch checked={notificationPush} onCheckedChange={setNotificationPush} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertes critiques uniquement</Label>
              <p className="text-sm text-muted-foreground">
                Ne recevoir que les alertes urgentes et prioritaires
              </p>
            </div>
            <Switch checked={notificationCritical} onCheckedChange={setNotificationCritical} />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="neu-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Sécurité</CardTitle>
          </div>
          <CardDescription>Paramètres de sécurité du compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Authentification à deux facteurs (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Ajouter une couche de sécurité supplémentaire
              </p>
            </div>
            <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Changer le mot de passe</Label>
            <div className="flex gap-2">
              <Input type="password" placeholder="Nouveau mot de passe" />
              <Button variant="outline">Modifier</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Section */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle>Flux de Travail</CardTitle>
          <CardDescription>Automatisation et paramètres métier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-validation des demandes simples</Label>
              <p className="text-sm text-muted-foreground">
                Valider automatiquement les demandes standards (attestations, etc.)
              </p>
            </div>
            <Switch checked={autoValidation} onCheckedChange={setAutoValidation} />
          </div>
        </CardContent>
      </Card>

      {/* Display Section */}
      <Card className="neu-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <CardTitle>Affichage & Accessibilité</CardTitle>
          </div>
          <CardDescription>Personnaliser l'apparence de l'interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thème</Label>
              <p className="text-sm text-muted-foreground">
                Basculer entre le mode clair et sombre
              </p>
            </div>
            <ThemeToggle />
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Taille de police</Label>
              <span className="text-sm text-muted-foreground">{fontSize}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="120"
              step="10"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Petit</span>
              <span>Normal</span>
              <span>Grand</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Annuler</Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}

