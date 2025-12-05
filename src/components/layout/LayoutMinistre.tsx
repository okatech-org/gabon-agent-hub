import React, { useState } from "react";
import {
    LayoutDashboard, FileText, Inbox, Bot, UserCog, Building2, FileCheck, Users,
    DollarSign, TrendingUp, Landmark, Briefcase,
    Hammer, Target, Settings, LogOut, Sun, Moon, ChevronDown, ChevronRight
} from "lucide-react";
// import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Placeholder for logo
// import logoUrl from "@/assets/logo.png"; 

// Initial state for expanded sections
const initialExpandedState = {
    navigation: true,
    cabinet: false,
    directions: false,
    projets: false,
};

export default function LayoutMinistre({ children }: { children: React.ReactNode }) {
    // Using a simplified theme toggle mock since we might not have next-themes setup perfectly yet
    // If next-themes is available, uncomment lines and use it. 
    // For now, manual class toggle or assume system preference.
    // const { theme, setTheme } = useTheme(); // if next-themes is available
    const [isDark, setIsDark] = useState(false);
    const [expandedSections, setExpandedSections] = useState(initialExpandedState);
    const [activeSection, setActiveSection] = useState("dashboard");

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const NavButton = ({ id, label, icon: Icon, isActive, onClick }: any) => (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                    ? "neu-inset text-primary font-semibold"
                    : "neu-raised hover:shadow-neo-md"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    const SectionHeader = ({ id, label, isOpen }: { id: keyof typeof expandedSections, label: string, isOpen: boolean }) => (
        <button
            onClick={() => toggleSection(id)}
            className="neu-raised flex items-center justify-between w-full text-xs font-semibold text-primary mb-3 tracking-wider px-3 py-2 rounded-lg transition-all hover:shadow-neo-md"
        >
            {label}
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
    );

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 font-sans">
            <div className="flex gap-6 max-w-[1600px] mx-auto">

                {/* === SIDEBAR DÉTACHÉE === */}
                <aside className="neu-card w-64 flex-shrink-0 p-6 flex flex-col min-h-[calc(100vh-3rem)] overflow-hidden sticky top-6 h-[calc(100vh-3rem)]">

                    {/* Logo & Titre */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="neu-raised w-12 h-12 rounded-full flex items-center justify-center p-2">
                            <div className="font-bold text-xl">M</div>
                        </div>
                        <div>
                            <div className="font-bold text-sm">GABON.GA</div>
                            <div className="text-xs text-muted-foreground">Espace Ministre</div>
                        </div>
                    </div>

                    {/* Zone de Navigation Scrollable */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-border">

                        {/* Section NAVIGATION */}
                        <div>
                            <SectionHeader id="navigation" label="NAVIGATION" isOpen={expandedSections.navigation} />
                            {expandedSections.navigation && (
                                <nav className="space-y-2 ml-2">
                                    <NavButton id="dashboard" label="Tableau de Bord" icon={LayoutDashboard} isActive={activeSection === "dashboard"} onClick={() => setActiveSection("dashboard")} />
                                    <NavButton id="documents" label="Documents" icon={FileText} isActive={activeSection === "documents"} onClick={() => setActiveSection("documents")} />
                                    <NavButton id="courriers" label="Courriers" icon={Inbox} isActive={activeSection === "courriers"} onClick={() => setActiveSection("courriers")} />
                                    <NavButton id="iasted" label="Assistant IA" icon={Bot} isActive={activeSection === "iasted"} onClick={() => setActiveSection("iasted")} />
                                </nav>
                            )}
                        </div>

                        {/* Section CABINET */}
                        <div>
                            <SectionHeader id="cabinet" label="CABINET" isOpen={expandedSections.cabinet} />
                            {expandedSections.cabinet && (
                                <nav className="space-y-2 ml-2">
                                    <NavButton id="collaborateurs" label="Collaborateurs" icon={Users} isActive={activeSection === "collaborateurs"} onClick={() => setActiveSection("collaborateurs")} />
                                    <NavButton id="agenda" label="Agenda" icon={UserCog} isActive={activeSection === "agenda"} onClick={() => setActiveSection("agenda")} />
                                    <NavButton id="notes" label="Notes de Service" icon={FileCheck} isActive={activeSection === "notes"} onClick={() => setActiveSection("notes")} />
                                </nav>
                            )}
                        </div>

                        {/* Section DIRECTIONS */}
                        <div>
                            <SectionHeader id="directions" label="DIRECTIONS" isOpen={expandedSections.directions} />
                            {expandedSections.directions && (
                                <nav className="space-y-2 ml-2">
                                    <NavButton id="sg" label="Secrétariat Général" icon={Building2} isActive={activeSection === "sg"} onClick={() => setActiveSection("sg")} />
                                    <NavButton id="budget" label="Budget & Finances" icon={DollarSign} isActive={activeSection === "budget"} onClick={() => setActiveSection("budget")} />
                                    <NavButton id="rh" label="Ressources Humaines" icon={Briefcase} isActive={activeSection === "rh"} onClick={() => setActiveSection("rh")} />
                                </nav>
                            )}
                        </div>

                        {/* Section PROJETS */}
                        <div>
                            <SectionHeader id="projets" label="PROJETS" isOpen={expandedSections.projets} />
                            {expandedSections.projets && (
                                <nav className="space-y-2 ml-2">
                                    <NavButton id="suivi" label="Suivi des Projets" icon={Target} isActive={activeSection === "suivi"} onClick={() => setActiveSection("suivi")} />
                                    <NavButton id="investissements" label="Investissements" icon={Landmark} isActive={activeSection === "investissements"} onClick={() => setActiveSection("investissements")} />
                                    <NavButton id="indicateurs" label="Indicateurs Clés" icon={TrendingUp} isActive={activeSection === "indicateurs"} onClick={() => setActiveSection("indicateurs")} />
                                    <NavButton id="chantiers" label="Chantiers en cours" icon={Hammer} isActive={activeSection === "chantiers"} onClick={() => setActiveSection("chantiers")} />
                                </nav>
                            )}
                        </div>

                    </div>

                    {/* Footer Sidebar (Paramètres & Logout) */}
                    <div className="mt-auto pt-4 border-t border-border space-y-2">
                        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm neu-raised hover:shadow-neo-md transition-all">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {isDark ? "Mode Clair" : "Mode Sombre"}
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm neu-raised hover:shadow-neo-md transition-all">
                            <Settings className="w-4 h-4" />
                            Paramètres
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive neu-raised hover:shadow-neo-md transition-all">
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>

                </aside>

                {/* === CONTENU PRINCIPAL === */}
                <main className="flex-1 min-w-0">
                    <div className="neu-card p-8 min-h-[calc(100vh-3rem)] animate-in fade-in duration-500">
                        {/* Header de la page */}
                        <div className="flex items-start gap-4 mb-10">
                            <div className="neu-raised w-20 h-20 rounded-full flex items-center justify-center p-3 shrink-0">
                                {/* <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /> */}
                                <div className="font-bold text-3xl">M</div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2 text-foreground">Espace Ministre</h1>
                                <p className="text-base text-muted-foreground">Cabinet du Ministre - République Gabonaise</p>
                            </div>
                        </div>

                        {/* Zone de contenu dynamique */}
                        {children}

                    </div>
                </main>
            </div>
        </div>
    );
}
