import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const agentSchema = z.object({
  matricule: z.string().min(1, "Le matricule est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  prenoms: z.string().min(1, "Les prénoms sont requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  sexe: z.enum(["M", "F"], { required_error: "Le sexe est requis" }),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  type_agent: z.enum(["fonctionnaire", "contractuel", "stagiaire", "autre"], {
    required_error: "Le type d'agent est requis",
  }),
  statut: z.enum(["actif", "suspendu", "retraite", "detache"], {
    required_error: "Le statut est requis",
  }),
  grade: z.string().optional(),
  categorie: z.string().optional(),
  cadre: z.string().optional(),
  corps: z.string().optional(),
  echelon: z.string().optional(),
  date_prise_fonction: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

export default function AgentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      matricule: "",
      nom: "",
      prenoms: "",
      email: "",
      telephone: "",
      sexe: "M",
      date_naissance: "",
      lieu_naissance: "",
      type_agent: "fonctionnaire",
      statut: "actif",
      grade: "",
      categorie: "",
      cadre: "",
      corps: "",
      echelon: "",
      date_prise_fonction: "",
    },
  });

  useEffect(() => {
    if (isEditMode) {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          matricule: data.matricule || "",
          nom: data.nom || "",
          prenoms: data.prenoms || "",
          email: data.email || "",
          telephone: data.telephone || "",
          sexe: data.sexe as "M" | "F",
          date_naissance: data.date_naissance || "",
          lieu_naissance: data.lieu_naissance || "",
          type_agent: data.type_agent as any,
          statut: data.statut as any,
          grade: data.grade || "",
          categorie: data.categorie || "",
          cadre: data.cadre || "",
          corps: data.corps || "",
          echelon: data.echelon?.toString() || "",
          date_prise_fonction: data.date_prise_fonction || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'agent",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: AgentFormData) => {
    try {
      const payload = {
        matricule: data.matricule,
        nom: data.nom,
        prenoms: data.prenoms,
        sexe: data.sexe,
        type_agent: data.type_agent,
        statut: data.statut,
        echelon: data.echelon ? parseInt(data.echelon) : null,
        email: data.email || null,
        telephone: data.telephone || null,
        date_naissance: data.date_naissance || null,
        lieu_naissance: data.lieu_naissance || null,
        grade: data.grade || null,
        categorie: data.categorie || null,
        cadre: data.cadre || null,
        corps: data.corps || null,
        date_prise_fonction: data.date_prise_fonction || null,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("agents")
          .update(payload)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'agent a été modifié avec succès",
        });
      } else {
        const { error } = await supabase.from("agents").insert([payload]);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'agent a été créé avec succès",
        });
      }

      navigate("/rh/agents");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="neu-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rh/agents")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Modifier l'Agent" : "Nouvel Agent"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Modifiez les informations de l'agent"
                : "Créez un nouveau dossier agent"}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations d'identification */}
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Informations d'Identification</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matricule *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: MAT001234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type_agent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'Agent *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fonctionnaire">Fonctionnaire</SelectItem>
                        <SelectItem value="contractuel">Contractuel</SelectItem>
                        <SelectItem value="stagiaire">Stagiaire</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                        <SelectItem value="retraite">Retraité</SelectItem>
                        <SelectItem value="detache">Détaché</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* État Civil */}
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>État Civil</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de famille" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prenoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénoms *</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénoms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sexe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexe *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_naissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lieu_naissance"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Lieu de Naissance</FormLabel>
                    <FormControl>
                      <Input placeholder="Ville, Pays" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+225 XX XX XX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Informations Professionnelles */}
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Informations Professionnelles</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Administrateur Civil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Catégorie A</SelectItem>
                        <SelectItem value="B">Catégorie B</SelectItem>
                        <SelectItem value="C">Catégorie C</SelectItem>
                        <SelectItem value="D">Catégorie D</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="corps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corps</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Administration Générale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cadre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cadre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cadre Supérieur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="echelon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Échelon</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_prise_fonction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Prise de Fonction</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/rh/agents")}
            >
              Annuler
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              {isEditMode ? "Enregistrer" : "Créer l'Agent"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
