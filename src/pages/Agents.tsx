import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*, structures(nom), postes(intitule)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAgents = agents.filter((agent) => {
    const search = searchTerm.toLowerCase();
    return (
      agent.matricule?.toLowerCase().includes(search) ||
      agent.nom?.toLowerCase().includes(search) ||
      agent.prenoms?.toLowerCase().includes(search)
    );
  });

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      actif: "default",
      detache: "secondary",
      conge: "secondary",
      disponibilite: "outline",
      retraite: "outline",
      suspendu: "destructive",
    };

    return (
      <Badge variant={variants[statut] || "outline"}>
        {statut}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Agents</h1>
          <p className="text-muted-foreground">
            Consultation et gestion des dossiers administratifs
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par matricule, nom, prénoms..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun agent trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Nom & Prénoms</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Structure</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{agent.matricule}</TableCell>
                    <TableCell>
                      {agent.nom} {agent.prenoms}
                    </TableCell>
                    <TableCell className="capitalize">{agent.type_agent}</TableCell>
                    <TableCell>{agent.grade || "N/A"}</TableCell>
                    <TableCell>{agent.structures?.nom || "Non affecté"}</TableCell>
                    <TableCell>{getStatutBadge(agent.statut)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
