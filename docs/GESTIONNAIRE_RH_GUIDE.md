# Guide d'Utilisation - Interface Directeur des Ressources Humaines (DRH)

## Vue d'ensemble

L'interface du Directeur des Ressources Humaines (DRH) d'ADMIN.GA permet une gestion stratégique et complète des ressources humaines de la fonction publique gabonaise. Elle offre des outils avancés pour la validation des actes, la gestion des carrières, le pilotage des effectifs et l'analyse des données RH.

## Accès à l'Interface

### Connexion - Compte DRH

1. Accédez à la page de connexion : `/auth/login`
2. Utilisez les identifiants du compte Directeur RH :
   - **Email** : `drh.demo@admin.ga`
   - **Mot de passe** : `Demo2024!`
3. Vous serez automatiquement redirigé vers le tableau de bord DRH

### Connexion - Compte Gestionnaire RH (Opérationnel)

Pour un accès opérationnel :
- **Email** : `gestionnaire.demo@admin.ga`
- **Mot de passe** : `Demo2024!`

### Navigation Principale

L'interface DRH est accessible via les routes suivantes :
- `/rh/dashboard` - Tableau de bord stratégique DRH
- `/rh/agents` - Gestion des agents
- `/rh/actes` - Validation des actes administratifs
- `/rh/carrieres` - Gestion des carrières et avancements
- `/rh/effectifs` - Pilotage des effectifs
- `/rh/rapports` - Tableaux de bord et rapports RH
- `/rh/affectations` - Gestion des affectations et mutations

## 4 Attributions Stratégiques du DRH

### 1. Validation des Actes Administratifs (`/rh/actes`)

Le DRH est l'autorité de validation finale pour tous les actes administratifs relatifs aux carrières des agents.

#### Responsabilités
- ✅ Signature et validation des décisions de carrière
- ✅ Vérification de la conformité réglementaire
- ✅ Autorisation des changements de situation administrative
- ✅ Validation des actes avant transmission aux autorités compétentes

#### Statistiques Suivies
- Total des actes générés
- Actes en brouillon (nécessitant révision)
- Actes en attente de validation
- Actes signés et finalisés

#### Types d'Actes Validés
- **Nomination** : Entrée dans la fonction publique
- **Avancement** : Progression dans le grade
- **Promotion** : Changement de corps ou catégorie
- **Mutation** : Changement de service ou de poste
- **Affectation** : Attribution d'un poste
- **Congé** : Autorisation d'absence
- **Mise en disponibilité** : Suspension temporaire d'activité
- **Retraite** : Fin de carrière

#### Workflow de Validation
1. **Brouillon** : Préparation par le gestionnaire RH
2. **En Attente** : Soumis au DRH pour validation
3. **Signé** : Acte validé par le DRH, prêt à être exécuté
4. **Annulé** : Acte rejeté ou invalidé

#### Actions Disponibles
- 👁️ **Examiner** : Consultation détaillée de l'acte
- ✅ **Valider** : Signature et approbation de l'acte
- ❌ **Rejeter** : Refus avec commentaires
- ✏️ **Modifier** : Corrections avant validation
- 💾 **Télécharger** : Export PDF des actes signés

### 2. Gestion des Carrières et Avancements (`/rh/carrieres`)

Pilotage stratégique des évolutions de carrière et promotions des agents de la fonction publique.

#### Responsabilités
- 📊 Analyse des dossiers d'avancement
- 🎯 Validation des promotions et reclassements
- 📈 Suivi des évolutions de carrière
- ✅ Approbation des avancements d'échelon et de grade

#### Indicateurs Clés
- Total des dossiers d'avancement en traitement
- Dossiers en attente d'examen
- Dossiers en cours d'instruction
- Avancements approuvés dans la période

#### Processus d'Avancement
1. **Dépôt du dossier** : Constitution par le gestionnaire RH
2. **Examen** : Vérification des critères (ancienneté, évaluation, formation)
3. **Approbation DRH** : Validation stratégique par le Directeur RH
4. **Génération de l'acte** : Création de l'acte d'avancement
5. **Mise en œuvre** : Application effective du nouvel échelon/grade

#### Critères d'Avancement
- ✅ Ancienneté requise dans le grade actuel
- ✅ Évaluation positive des performances
- ✅ Formation continue et développement des compétences
- ✅ Disponibilité budgétaire et des postes
- ✅ Absence de sanctions disciplinaires

#### Actions Disponibles
- 🔍 **Examiner** : Consultation complète du dossier
- ✅ **Approuver** : Validation de l'avancement
- ❌ **Rejeter** : Refus motivé du dossier
- 💬 **Commenter** : Observations et recommandations

### 3. Pilotage des Effectifs (`/rh/effectifs`)

Suivi stratégique des effectifs, analyses prévisionnelles et gestion prévisionnelle des emplois et compétences (GPEC).

#### Responsabilités
- 📊 Analyse des effectifs par catégorie, grade et statut
- 📈 Prévisions des besoins en recrutement
- 🎯 Optimisation de la répartition des agents
- 🔮 Anticipation des départs (retraites, mutations)

#### KPIs Stratégiques

**Effectifs Globaux**
- **Effectif Total** : Tous agents confondus
- **Agents Actifs** : En poste et actifs
- **Taux d'Occupation** : Ratio agents actifs / effectif total
- **Tendance Mensuelle** : Évolution des effectifs

**Répartition par Statut**
- **Actifs** : Agents en service
- **Détachés** : Agents en détachement
- **Retraités** : Agents partis à la retraite

**Analyses Prévisionnelles**
- **Départs Prévisionnels** : Sur les 12 prochains mois
- **Besoins en Recrutement** : Postes à pourvoir
- **Pyramide des Âges** : Distribution par tranche d'âge
- **Compétences Critiques** : Savoir-faire clés à préserver

#### Répartitions Analysées
- **Par Catégorie** : A, B, C (cadres, techniciens, agents)
- **Par Grade** : Distribution des grades dans la fonction publique
- **Par Corps** : Répartition par corps de métier
- **Par Administration** : Affectation par ministère/service

#### Alertes et Recommandations
- ⚠️ **Départs à Anticiper** : Retraites, fins de détachement
- 📉 **Taux d'Occupation Faible** : Besoin de recrutement
- 📊 **Déséquilibres** : Sureffectifs ou sous-effectifs par service
- 🎓 **Besoins en Formation** : Compétences à développer

#### Outils GPEC
- 📊 Cartographie des emplois et compétences
- 🔮 Projections d'effectifs à 1, 3 et 5 ans
- 📈 Analyse des flux (entrées/sorties)
- 🎯 Planification des recrutements

### 4. Tableaux de Bord RH (`/rh/rapports`)

Analyses stratégiques et indicateurs de performance des ressources humaines.

#### Responsabilités
- 📊 Suivi des indicateurs RH clés
- 📈 Analyse des tendances et évolutions
- 📝 Génération de rapports périodiques
- 🎯 Pilotage par les données (data-driven decisions)

#### Indicateurs Suivis (Période Sélectionnable)

**Activité RH**
- **Effectif Total** : Vue d'ensemble
- **Nouveaux Recrutés** : Entrées dans la période
- **Actes Générés** : Volume d'activité administrative
- **Avancements Traités** : Évolutions de carrière
- **Mutations Effectuées** : Mobilité interne
- **Formations Dispensées** : Développement des compétences

**Indicateurs de Performance**
- **Taux d'Absentéisme** : Objectif < 3%
- **Satisfaction Moyenne** : Enquêtes internes (sur 5)
- **Délai Moyen de Traitement** : Pour les actes administratifs
- **Taux de Réalisation** : Des objectifs RH fixés

**Répartition des Activités**
- Validation d'Actes (45%)
- Gestion des Carrières (30%)
- Mutations et Affectations (25%)

#### Types de Rapports Disponibles

**Rapports Standards**
1. **Rapport des Effectifs**
   - Vue d'ensemble des effectifs par catégorie, grade et statut
   - Évolution sur la période
   - Analyse comparative

2. **Bilan des Avancements**
   - Statistiques des promotions
   - Analyse par corps et grade
   - Taux d'avancement

3. **Suivi des Actes**
   - Volume d'actes par type
   - Délais de traitement
   - Taux de validation

4. **Rapport Annuel RH**
   - Bilan complet de l'année
   - Tous les indicateurs consolidés
   - Recommandations stratégiques

#### Périodes d'Analyse
- **Cette semaine** : Vue opérationnelle
- **Ce mois** : Suivi mensuel
- **Ce trimestre** : Tendances trimestrielles
- **Cette année** : Vue annuelle stratégique

#### Actions Disponibles
- 📊 **Générer** : Créer un nouveau rapport
- 💾 **Télécharger** : Export PDF ou Excel
- 📧 **Partager** : Envoi aux parties prenantes
- 📈 **Analyser** : Visualisations graphiques avancées

## Fonctionnalités Complémentaires

### Gestion des Agents (`/rh/agents`)

#### Statistiques
- Total des agents enregistrés
- Agents actifs
- Agents titulaires
- Agents contractuels

#### Recherche et Filtres
- **Recherche textuelle** : Par matricule, nom, prénom ou email
- **Filtre par statut** : Actif, Suspendu, Retraité, Détaché
- **Filtre par type** : Titulaire, Contractuel, Stagiaire

#### Actions sur les Agents
- 👁️ **Consulter** : Voir le dossier complet
- ✏️ **Modifier** : Mettre à jour les informations
- 📄 **Documents** : Gérer les pièces justificatives

### Gestion des Affectations (`/rh/affectations`)

#### Vue d'Ensemble
- Affectations actives
- Historique des mutations
- Statistiques des mobilités

#### Actions Disponibles
- 👁️ **Consulter** : Détails de l'affectation
- ✏️ **Modifier** : Mise à jour (affectations actives)
- ➕ **Nouvelle Affectation** : Enregistrer une mutation

## Bonnes Pratiques - Niveau Stratégique

### Vision Stratégique
1. **Pilotage par les Données** : Utiliser les tableaux de bord pour les décisions
2. **Anticipation** : Surveiller les indicateurs d'alerte
3. **Planification** : Utiliser les prévisions pour la GPEC
4. **Transparence** : Documenter toutes les décisions

### Workflow de Validation DRH
1. **Revue Quotidienne** : Consulter les actes en attente
2. **Analyse de Conformité** : Vérifier les critères réglementaires
3. **Validation Stratégique** : Approuver ou rejeter avec motivation
4. **Suivi Post-Validation** : Contrôler la mise en œuvre

### Gestion des Carrières
1. **Équité** : Appliquer les mêmes critères pour tous
2. **Mérite** : Valoriser les performances
3. **Développement** : Encourager la formation continue
4. **Accompagnement** : Soutenir les évolutions de carrière

### Pilotage des Effectifs
1. **Analyse Régulière** : Examiner les indicateurs mensuellement
2. **Anticipation des Départs** : Planifier les remplacements
3. **Optimisation** : Équilibrer les effectifs par service
4. **Recrutement Stratégique** : Cibler les compétences critiques

## Sécurité et Confidentialité

### Contrôle d'Accès
- Authentification obligatoire
- Permissions basées sur le rôle (DRH)
- Row Level Security (RLS) sur toutes les données
- Traçabilité complète des actions

### Protection des Données
- Chiffrement des données sensibles
- Conformité RGPD
- Archivage sécurisé des actes
- Sauvegarde automatique quotidienne

### Audit et Traçabilité
- Journal complet des validations
- Historique des modifications
- Horodatage de toutes les actions
- Identité de l'auteur pour chaque opération

## Support et Assistance

### Contacts
- **Support Technique** : support@admin.ga
- **Questions RH** : rh@admin.ga
- **Administrateur Système** : admin@admin.ga

### Ressources
- Documentation complète en ligne
- Tutoriels vidéo (à venir)
- Formation initiale pour les nouveaux DRH
- Assistance téléphonique pendant les heures ouvrables

### En cas de problème
1. Consulter la documentation
2. Vérifier les statistiques du dashboard
3. Consulter les logs d'erreur
4. Contacter le support si nécessaire

## Prochaines Fonctionnalités

### En Développement
- ✨ Workflow de validation avec signatures électroniques
- ✨ Notifications automatiques par email
- ✨ Génération automatique des numéros d'actes
- ✨ Tableaux de bord analytiques interactifs avec graphiques
- ✨ Exports Excel personnalisables
- ✨ Système de commentaires et d'annotations sur les dossiers
- ✨ Calendrier des échéances RH (retraites, fins de période d'essai)
- ✨ Module de gestion des demandes agents (congés, formations)
- ✨ Intégration avec le système de paie
- ✨ API pour les autres systèmes du ministère

### Vision Future
- Intelligence artificielle pour la détection d'anomalies
- Recommandations automatiques pour les avancements
- Prévisions avancées avec machine learning
- Dashboard personnalisable par utilisateur
- Application mobile pour suivi en temps réel

## Notes Techniques

### Technologies Utilisées
- **Frontend** : React 18 + TypeScript
- **UI Framework** : Shadcn/UI avec design neomorphique personnalisé
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth avec Row Level Security
- **Gestion d'état** : React Query pour le cache et la synchronisation
- **Routage** : React Router v6
- **Styling** : Tailwind CSS
- **Validation** : Zod pour la validation des formulaires

### Architecture
- Architecture modulaire par fonctionnalité
- Routes protégées avec système de permissions
- Redirection automatique selon le rôle utilisateur
- Chargement asynchrone et lazy loading
- Gestion d'erreurs centralisée avec toasts
- Design responsive (mobile, tablette, desktop)

### Performance
- Chargement optimisé des données (pagination, lazy loading)
- Cache intelligent avec React Query
- Filtres côté client pour réactivité instantanée
- Optimistic updates pour une UX fluide
- Code splitting pour réduire le bundle initial

### Sécurité
- Row Level Security (RLS) au niveau base de données
- Validation côté client ET serveur
- Protection CSRF
- Headers de sécurité configurés
- Audit trail pour toutes les actions sensibles

---

**Version** : 2.0.0  
**Dernière mise à jour** : Janvier 2025  
**Rôle** : Directeur des Ressources Humaines (DRH)  
**Contact** : support@admin.ga

---

## Annexes

### A. Hiérarchie des Rôles

```
Ministre de la Fonction Publique
    ├── Secrétaire Général
    ├── Directeur de Cabinet
    └── Directeur des Ressources Humaines (DRH) ← Ce guide
            ├── Gestionnaire RH (opérationnel)
            ├── Agents de saisie
            └── Conseillers RH
```

### B. Glossaire RH

- **Acte Administratif** : Décision écrite et signée relative à la carrière d'un agent
- **Avancement** : Progression dans la grille indiciaire (échelon ou grade)
- **Promotion** : Changement de corps ou de catégorie
- **Mutation** : Changement de service ou de lieu d'affectation
- **GPEC** : Gestion Prévisionnelle des Emplois et Compétences
- **RLS** : Row Level Security (sécurité au niveau des lignes de données)
- **KPI** : Key Performance Indicator (indicateur clé de performance)

### C. Codes Statuts des Agents

- **actif** : Agent en service normal
- **suspendu** : Agent suspendu temporairement
- **detache** : Agent en détachement dans un autre service
- **retraite** : Agent parti à la retraite
- **disponibilite** : Agent en disponibilité

### D. Codes Types d'Agents

- **titulaire** : Fonctionnaire titulaire
- **contractuel** : Agent sous contrat
- **stagiaire** : Agent en période de stage
- **temporaire** : Agent recruté temporairement
