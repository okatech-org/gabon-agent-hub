import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export type CommandType = 'NAVIGATION' | 'ACTION' | 'DEV' | 'SYSTEM';

export interface Command {
    id: string;
    type: CommandType;
    name: string;
    description: string;
    keywords: string[];
    handler: (args: any, context: CommandContext) => Promise<void>;
}

export interface CommandContext {
    navigate: NavigateFunction;
    setTheme?: (theme: string) => void;
    // Add other context providers here (e.g., Supabase client, Global Store)
}

class CommandService {
    private commands: Map<string, Command> = new Map();
    private context: CommandContext | null = null;

    constructor() {
        this.registerDefaultCommands();
    }

    setContext(context: CommandContext) {
        this.context = context;
    }

    registerCommand(command: Command) {
        this.commands.set(command.id, command);
    }

    private registerDefaultCommands() {
        // --- NAVIGATION COMMANDS ---
        this.registerCommand({
            id: 'nav_home',
            type: 'NAVIGATION',
            name: 'Tableau de bord',
            description: 'Navigue vers le tableau de bord',
            keywords: ['accueil', 'home', 'maison', 'début', 'dashboard'],
            handler: async (_, { navigate }) => navigate('/ministre/dashboard')
        });

        this.registerCommand({
            id: 'nav_documents',
            type: 'NAVIGATION',
            name: 'Documents',
            description: 'Ouvre la section documents',
            keywords: ['documents', 'fichiers', 'dossiers'],
            handler: async (_, { navigate }) => navigate('/ministre/documents')
        });

        this.registerCommand({
            id: 'nav_settings',
            type: 'NAVIGATION',
            name: 'Paramètres',
            description: 'Ouvre la page de configuration',
            keywords: ['paramètres', 'réglages', 'config', 'settings', 'configuration'],
            handler: async (_, { navigate }) => navigate('/ministre/settings')
        });

        // --- SYSTEM ACTIONS ---
        this.registerCommand({
            id: 'sys_theme_dark',
            type: 'ACTION',
            name: 'Mode Sombre',
            description: 'Active le thème sombre',
            keywords: ['sombre', 'dark', 'nuit', 'éteindre lumière'],
            handler: async (_, { setTheme }) => {
                if (setTheme) setTheme('dark');
                toast({ title: '🌙 Mode Sombre activé' });
            }
        });

        this.registerCommand({
            id: 'sys_theme_light',
            type: 'ACTION',
            name: 'Mode Clair',
            description: 'Active le thème clair',
            keywords: ['clair', 'light', 'jour', 'allumer lumière'],
            handler: async (_, { setTheme }) => {
                if (setTheme) setTheme('light');
                toast({ title: '☀️ Mode Clair activé' });
            }
        });

        // --- DEV ORCHESTRATION (Simulation) ---
        this.registerCommand({
            id: 'dev_cursor_rule',
            type: 'DEV',
            name: 'Générer Règle Cursor',
            description: 'Crée une règle pour l\'IDE',
            keywords: ['règle', 'cursor', 'rule', 'dev', 'règle de dev'],
            handler: async (args, _) => {
                console.log('Generating Cursor Rule:', args);
                toast({
                    title: '🛠️ Règle Cursor Générée',
                    description: 'Copiée dans le presse-papier (Simulation)',
                });
            }
        });
    }

    async execute(commandId: string, args: any = {}) {
        if (!this.context) {
            console.error('CommandService context not initialized');
            return;
        }

        const command = this.commands.get(commandId);

        // Fallback for legacy calls or direct tool mapping
        if (!command) {
            // Handle generic navigation from old tool calls
            if (commandId === 'navigate_app' && args.route) {
                console.log(`[CommandService] Legacy navigation to ${args.route}`);
                this.context.navigate(args.route);
                return;
            }

            // Handle theme toggle from old tool calls
            if (commandId === 'control_ui') {
                if (args.action === 'set_theme_dark') this.context.setTheme?.('dark');
                if (args.action === 'set_theme_light') this.context.setTheme?.('light');
                return;
            }

            console.warn(`Command ${commandId} not found`);
            return;
        }

        console.log(`[iAsted] Executing: ${command.name}`, args);
        try {
            await command.handler(args, this.context);
        } catch (error) {
            console.error(`Error executing ${commandId}:`, error);
            toast({
                title: 'Erreur d\'exécution',
                description: `Impossible d'exécuter ${command.name}`,
                variant: 'destructive'
            });
        }
    }

    // Simple keyword matcher (to be replaced by LLM intent classification)
    findCommand(input: string): Command | null {
        const lowerInput = input.toLowerCase();
        for (const command of this.commands.values()) {
            if (command.keywords.some(k => lowerInput.includes(k))) {
                return command;
            }
        }
        return null;
    }
}

export const commandService = new CommandService();
