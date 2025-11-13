# Guide d'Utilisation - Interface Gestionnaire RH

## Vue d'ensemble

L'interface du Gestionnaire RH d'ADMIN.GA permet une gestion complète et opérationnelle des dossiers des agents de la fonction publique gabonaise.

## Accès à l'Interface

### Connexion
1. Accédez à la page de connexion : `/auth/login`
2. Utilisez les identifiants du compte Gestionnaire RH :
   - **Email** : `gestionnaire.demo@fonctionpublique.ga`
   - **Mot de passe** : `Demo2024!`
3. Vous serez automatiquement redirigé vers le tableau de bord RH

### Navigation
L'interface RH est accessible via les routes suivantes :
- `/rh/dashboard` - Tableau de bord principal
- `/rh/agents` - Gestion des agents
- `/rh/actes` - Gestion des actes administratifs
- `/rh/affectations` - Gestion des affectations et mutations

## Fonctionnalités Principales

### 1. Tableau de Bord RH (`/rh/dashboard`)

#### Statistiques en Temps Réel
- **Agents Enregistrés** : Nombre total d'agents dans le système
- **Actes en Attente** : Actes en brouillon nécessitant finalisation
- **Demandes en Cours** : Demandes des agents à traiter
- **Mutations Récentes** : Affectations des 30 derniers jours

#### Actions Rapides
- ✅ **Nouvel Agent** : Créer un dossier agent
- ✅ **Générer un Acte** : Créer un nouvel acte administratif
- ✅ **Nouvelle Affectation** : Enregistrer une mutation
- ✅ **Rechercher un Agent** : Accès rapide à la recherche

#### Alertes et Notifications
- Tâches prioritaires nécessitant votre attention
- Activité récente du système
- Actes en attente de finalisation

### 2. Gestion des Agents (`/rh/agents`)

#### Statistiques
- Total des agents enregistrés
- Agents actifs
- Agents titulaires
- Agents contractuels

#### Recherche et Filtres
- **Recherche textuelle** : Par matricule, nom, prénom ou email
- **Filtre par statut** : Actif, Suspendu, Retraité, Détaché
- **Filtre par type** : Titulaire, Contractuel, Stagiaire

#### Liste des Agents
Tableau complet avec les informations :
- Matricule
- Nom et prénoms
- Grade et catégorie
- Type d'agent
- Statut actuel
- Actions disponibles (Voir, Modifier, Documents)

#### Actions sur les Agents
- 👁️ **Consulter** : Voir le dossier complet
- ✏️ **Modifier** : Mettre à jour les informations
- 📄 **Documents** : Gérer les pièces justificatives

### 3. Gestion des Actes Administratifs (`/rh/actes`)

#### Statistiques
- Total des actes générés
- Actes en brouillon
- Actes en attente de signature
- Actes signés

#### Types d'Actes Disponibles
- Nomination
- Avancement
- Mutation
- Affectation
- Promotion
- Congé
- Mise en disponibilité
- Retraite

#### Filtres
- **Par statut** : Brouillon, En attente, Signé, Annulé
- **Par type** : Tous les types d'actes disponibles

#### Cycle de Vie d'un Acte
1. **Brouillon** : Création et rédaction
2. **En Attente** : Soumis pour validation
3. **Signé** : Acte finalisé et téléchargeable
4. **Annulé** : Acte invalidé

#### Actions sur les Actes
- 👁️ **Consulter** : Voir le contenu de l'acte
- ✏️ **Modifier** : Éditer (seulement en brouillon)
- 💾 **Télécharger** : Obtenir le PDF (actes signés)
- 🗑️ **Supprimer** : Effacer (seulement en brouillon)

### 4. Gestion des Affectations (`/rh/affectations`)

#### Statistiques
- Total des affectations
- Affectations en cours
- Affectations terminées

#### Affectations Actives
Liste des affectations actuellement en vigueur avec :
- Agent concerné
- Structure d'affectation
- Poste occupé
- Date de début
- Motif de l'affectation
- Statut

#### Historique
Consultation des affectations terminées avec :
- Durée de l'affectation (en mois)
- Dates de début et fin
- Structure et poste
- Motif

#### Actions sur les Affectations
- 👁️ **Consulter** : Voir les détails
- ✏️ **Modifier** : Mettre à jour (affectations actives)

## Bonnes Pratiques

### Saisie des Données
1. **Agents** : Vérifiez que le matricule est unique
2. **Actes** : Commencez toujours en brouillon
3. **Affectations** : Documentez le motif de chaque mutation

### Workflow Recommandé
1. Créer le dossier agent
2. Enregistrer l'affectation initiale
3. Générer les actes nécessaires
4. Suivre le cycle de validation
5. Archiver les documents signés

### Sécurité
- Les données sont protégées par Row Level Security (RLS)
- Seuls les gestionnaires RH ont accès à ces fonctionnalités
- Toutes les actions sont tracées dans le journal d'audit

## Support et Assistance

### En cas de problème
1. Vérifiez les statistiques du dashboard
2. Consultez les alertes prioritaires
3. Utilisez les filtres pour localiser les données
4. Contactez l'administrateur système si nécessaire

### Données de Démonstration
Pour tester l'interface, utilisez le script d'initialisation :
- Route : `/init-demo`
- Crée automatiquement les 7 comptes démo
- Génère des données de test

## Prochaines Fonctionnalités

### En Développement
- ✨ Génération automatique des numéros d'actes
- ✨ Workflow de validation avec signatures électroniques
- ✨ Historique complet des modifications
- ✨ Exports Excel des listes
- ✨ Notifications par email
- ✨ Gestion des demandes agents
- ✨ Tableau de bord analytique avancé

### Formulaires à Venir
- Création/Modification d'agent
- Générateur d'actes avec modèles
- Formulaire d'affectation
- Recherche avancée multi-critères

## Notes Techniques

### Technologies Utilisées
- **Frontend** : React + TypeScript
- **UI** : Shadcn/UI avec design neomorphique
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth avec RLS
- **Gestion d'état** : React Query

### Architecture
- Routes protégées par authentification
- Redirection automatique selon le rôle
- Chargement optimisé des données
- Gestion d'erreurs avec toasts

### Performance
- Chargement asynchrone des listes
- Filtres côté client pour réactivité
- Pagination à venir pour grandes listes
- Cache intelligent avec React Query

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025  
**Contact** : support@admin.ga
