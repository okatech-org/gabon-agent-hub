import { useState } from "react";
import { Bell, Check, X, AlertCircle, Info, CheckCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/lib/toast";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Acte en attente de validation",
    message: "L'acte d'affectation pour l'agent MBONGO Jean nécessite votre validation avant signature ministérielle.",
    timestamp: "2024-01-15T10:30:00",
    read: false,
    category: "actes"
  },
  {
    id: "2",
    type: "info",
    title: "Nouvelle demande de congé",
    message: "L'agent OBAME Marie a soumis une demande de congé annuel pour la période du 20/02/2024 au 10/03/2024.",
    timestamp: "2024-01-15T09:15:00",
    read: false,
    category: "demandes"
  },
  {
    id: "3",
    type: "success",
    title: "Dossier agent complété",
    message: "Le dossier de l'agent NGUEMA Paul a été complété avec succès. Tous les documents requis sont présents.",
    timestamp: "2024-01-14T16:45:00",
    read: true,
    category: "agents"
  },
  {
    id: "4",
    type: "warning",
    title: "Documents manquants",
    message: "Le dossier de l'agent NZAMBA Sophie nécessite la mise à jour de 3 documents obligatoires.",
    timestamp: "2024-01-14T14:20:00",
    read: false,
    category: "agents"
  },
  {
    id: "5",
    type: "info",
    title: "Rapport mensuel disponible",
    message: "Le rapport statistique RH de décembre 2023 est maintenant disponible pour consultation.",
    timestamp: "2024-01-13T11:00:00",
    read: true,
    category: "rapports"
  }
];

export default function NotificationsRH() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("toutes");

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
    toast.success("Notification marquée comme lue");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success("Notification supprimée");
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "toutes" ||
                      (activeTab === "non-lues" && !notif.read) ||
                      (activeTab === notif.type);
    return matchesSearch && matchesTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "info": return <Info className="w-5 h-5 text-blue-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error": return <X className="w-5 h-5 text-destructive" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="neu-raised w-14 h-14 flex items-center justify-center">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={handleMarkAllAsRead} variant="outline" disabled={unreadCount === 0}>
            <Check className="w-4 h-4 mr-2" />
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non lues</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === "warning" || n.type === "error").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => {
                    const today = new Date().toDateString();
                    return new Date(n.timestamp).toDateString() === today;
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card className="neu-card">
        <CardContent className="pt-6">
          <Input
            placeholder="Rechercher une notification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle>Toutes les notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="toutes">Toutes</TabsTrigger>
              <TabsTrigger value="non-lues">Non lues</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="warning">Alertes</TabsTrigger>
              <TabsTrigger value="success">Succès</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`neu-card p-4 transition-all ${
                          notif.read ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground">
                                    {notif.title}
                                  </h3>
                                  {!notif.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {notif.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notif.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notif.id)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(notif.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notif.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

