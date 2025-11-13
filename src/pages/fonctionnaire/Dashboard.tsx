import { Users, FileText, ClipboardList, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FonctionnaireDashboard() {
  const stats = {
    actesDisponibles: 4,
    demandesEnCours: 1,
    notificationsNonLues: 2,
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Espace Fonctionnaire</h1>
              <p className="text-sm text-muted-foreground">
                Accédez à votre dossier, actes et demandes
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Actes disponibles</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.actesDisponibles}</div>
              <FileText className="w-5 h-5 text-accent" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Demandes en cours</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.demandesEnCours}</div>
              <ClipboardList className="w-5 h-5 text-secondary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Notifications non lues</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.notificationsNonLues}</div>
              <Bell className="w-5 h-5 text-info" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mes dernières démarches</CardTitle>
              <CardDescription>Suivi rapide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Demande de congés — En cours</p>
              <p>• Mise à jour d'adresse — Validée</p>
              <p>• Téléchargement d'acte — Réussi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Raccourcis</CardTitle>
              <CardDescription>Actions rapides</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <a href="/fonctionnaire/dossier" className="neu-button py-3 text-center">Mon dossier</a>
              <a href="/fonctionnaire/actes" className="neu-button py-3 text-center">Mes actes</a>
              <a href="/fonctionnaire/demandes" className="neu-button py-3 text-center">Mes demandes</a>
              <a href="/fonctionnaire/notifications" className="neu-button py-3 text-center">Notifications</a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


