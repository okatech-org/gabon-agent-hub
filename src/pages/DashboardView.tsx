import React from "react";
import { Users, Building2, UserCog, FileCheck, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { StatCard, SectionCard } from "@/components/ministre/MinisterSpaceComponents";
import LayoutMinistre from "@/components/layout/LayoutMinistre";

// Données factices pour l'exemple
const stats = {
    totalAgents: 12543,
    structures: 28,
    postesVacants: 342,
    actesEnAttente: 12,
};

const agentTypesData = [
    { name: "Cadres", value: 35, color: "hsl(var(--primary))" },
    { name: "Techniciens", value: 28, color: "hsl(var(--secondary))" },
    { name: "Agents", value: 22, color: "hsl(var(--accent))" },
    { name: "Ouvriers", value: 15, color: "hsl(var(--warning))" },
];

const genderData = [
    { name: "Hommes", value: 58, color: "hsl(var(--primary))" },
    { name: "Femmes", value: 42, color: "hsl(var(--accent))" },
];

function DashboardContent() {
    return (
        <div className="space-y-8">

            {/* 1. Bandeau de Statistiques Rapides (Style Grid avec séparateurs) */}
            <div className="neu-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border gap-4 md:gap-0">

                    <div className="px-6 first:pl-0 flex flex-col justify-center">
                        <div className="neu-raised w-12 h-12 flex items-center justify-center mb-4 rounded-xl">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-4xl font-bold mb-2">{stats.totalAgents.toLocaleString()}</div>
                        <div className="text-sm font-medium">Total Agents</div>
                        <div className="text-xs text-muted-foreground">Fonction publique</div>
                    </div>

                    <div className="px-6 flex flex-col justify-center">
                        <div className="neu-raised w-12 h-12 flex items-center justify-center mb-4 rounded-xl">
                            <Building2 className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="text-4xl font-bold mb-2">{stats.structures}</div>
                        <div className="text-sm font-medium">Structures</div>
                        <div className="text-xs text-muted-foreground">Ministères & Directions</div>
                    </div>

                    <div className="px-6 flex flex-col justify-center">
                        <div className="neu-raised w-12 h-12 flex items-center justify-center mb-4 rounded-xl">
                            <UserCog className="w-6 h-6 text-warning" />
                        </div>
                        <div className="text-4xl font-bold mb-2">{stats.postesVacants}</div>
                        <div className="text-sm font-medium">Postes Vacants</div>
                        <div className="text-xs text-muted-foreground">À pourvoir</div>
                    </div>

                    <div className="px-6 last:pr-0 flex flex-col justify-center">
                        <div className="neu-raised w-12 h-12 flex items-center justify-center mb-4 rounded-xl">
                            <FileCheck className="w-6 h-6 text-destructive" />
                        </div>
                        <div className="text-4xl font-bold mb-2">{stats.actesEnAttente}</div>
                        <div className="text-sm font-medium">Actes en attente</div>
                        <div className="text-xs text-muted-foreground">Urgent</div>
                    </div>

                </div>
            </div>

            {/* 2. Cartes de Statistiques Détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Performance"
                    value="+12.5%"
                    icon={TrendingUp}
                    color="hsl(var(--success))"
                    trend="Hausse"
                // theme={{ textSecondary: "hsl(var(--muted-foreground))", text: "hsl(var(--foreground))", bgCard: "hsl(var(--card))", border: "hsl(var(--border))", shadow: "var(--neo-shadow-md)" } as any} 
                />
                {/* Ajoutez d'autres StatCards ici si besoin */}
            </div>

            {/* 3. Section Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Graphique Circulaire */}
                <SectionCard title="Répartition par Catégorie">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={agentTypesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {agentTypesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Graphique Barres */}
                <SectionCard title="Répartition Genre">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={genderData}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip
                                    cursor={{ fill: "hsl(var(--muted))" }}
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px" }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

            </div>
        </div>
    );
}

export default function DashboardView() {
    return (
        <LayoutMinistre>
            <DashboardContent />
        </LayoutMinistre>
    );
}
