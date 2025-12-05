// iAsted Configuration - Full Capabilities for Minister of Public Service

export const IASTED_SYSTEM_PROMPT = `# iAsted - Chef de Cabinet du Ministre
## RÈGLE: RÉPONSES ULTRA-COURTES (MAX 2 phrases)
Exécute PUIS confirme en 3-5 mots: "Fait.", "Mode activé."

## SALUTATION: "{Bonjour/Bonsoir} Excellence."

## OUTILS
### NAVIGATION
- global_navigate(route) : Changer de page
- navigate_to_section(section_id) : Onglet dans page actuelle

### DOCUMENTS  
- generate_document(type, recipient, subject, format) : PDF/DOCX
- control_document(action) : open/close/archive

### INTERFACE
- control_ui(action) : set_theme_dark/light, toggle_sidebar
- set_speech_rate(rate) : 0.7=lent, 1.5=rapide

### RECHERCHE
- search_web(query) : Internet temps réel
- search_knowledge(query) : Base ministère

### CONVERSATION
- change_voice(gender) : homme/femme
- manage_history(action) : clear_chat
- stop_conversation() : Arrêt

## RÈGLE ABSOLUE: Appeler l'outil PUIS confirmer brièvement. NE JAMAIS expliquer, AGIR.`;

export const IASTED_TOOLS = [
    {
        type: 'function',
        name: 'global_navigate',
        description: 'Naviguer vers une autre page/espace',
        parameters: {
            type: 'object',
            properties: {
                route: { type: 'string', description: 'Route: /ministre/dashboard, /ministre/documents, /ministre/finances, /ministre/settings' }
            },
            required: ['route']
        }
    },
    {
        type: 'function',
        name: 'navigate_to_section',
        description: 'Naviguer vers un onglet/section dans la page actuelle',
        parameters: {
            type: 'object',
            properties: {
                section_id: { type: 'string', description: 'ID: dashboard, documents, budget, indicateurs' }
            },
            required: ['section_id']
        }
    },
    {
        type: 'function',
        name: 'control_ui',
        description: 'Contrôler l\'interface d\'affichage: thème (mode sombre/clair), barre latérale',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['set_theme_dark', 'set_theme_light', 'toggle_theme', 'toggle_sidebar', 'open_sidebar', 'close_sidebar'] }
            },
            required: ['action']
        }
    },
    {
        type: 'function',
        name: 'set_speech_rate',
        description: 'Vitesse de parole (0.7=lent, 1.0=normal, 1.5=rapide)',
        parameters: {
            type: 'object',
            properties: {
                rate: { type: 'number' }
            },
            required: ['rate']
        }
    },
    {
        type: 'function',
        name: 'generate_document',
        description: 'Générer document officiel PDF/DOCX',
        parameters: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['lettre', 'decret', 'note', 'rapport', 'communique', 'nomination'] },
                recipient: { type: 'string' },
                subject: { type: 'string' },
                content_points: { type: 'array', items: { type: 'string' } },
                format: { type: 'string', enum: ['pdf', 'docx'] }
            },
            required: ['type', 'subject']
        }
    },
    {
        type: 'function',
        name: 'control_document',
        description: 'Contrôler visualiseur de documents',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['open', 'close', 'archive', 'validate', 'download'] },
                document_id: { type: 'string' }
            },
            required: ['action']
        }
    },
    {
        type: 'function',
        name: 'search_web',
        description: 'Recherche internet temps réel',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string' },
                num_results: { type: 'integer' }
            },
            required: ['query']
        }
    },
    {
        type: 'function',
        name: 'search_knowledge',
        description: 'Recherche base de connaissances ministère',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string' },
                domain: { type: 'string', enum: ['procedures', 'reglements', 'effectifs', 'budget', 'formations'] }
            },
            required: ['query']
        }
    },
    {
        type: 'function',
        name: 'change_voice',
        description: 'Changer voix homme/femme',
        parameters: {
            type: 'object',
            properties: {
                gender: { type: 'string', enum: ['male', 'female', 'toggle'] }
            }
        }
    },
    {
        type: 'function',
        name: 'manage_history',
        description: 'Gérer historique conversation',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['clear_chat', 'new_conversation', 'export'] }
            },
            required: ['action']
        }
    },
    {
        type: 'function',
        name: 'stop_conversation',
        description: 'Arrêter la conversation vocale',
        parameters: { type: 'object', properties: {} }
    }
];

export const VOICE_OPTIONS = {
    male: 'ash',
    female: 'shimmer',
    default: 'ash'
} as const;

export const MINISTER_ROUTES = {
    dashboard: '/ministre/dashboard',
    documents: '/ministre/documents',
    finances: '/ministre/finances',
    settings: '/ministre/settings',
    formations: '/ministre/formations',
    alertes: '/ministre/alertes',
    notifications: '/ministre/notifications'
} as const;
