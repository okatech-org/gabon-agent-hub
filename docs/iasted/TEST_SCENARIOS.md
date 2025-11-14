# 🧪 Scénarios de Test - Génération de Documents PDF

## 📋 Checklist Rapide

Avant de considérer la fonctionnalité comme déployée, valider tous ces scénarios :

- [ ] Test 1 : Message de vœux (le cas d'usage original)
- [ ] Test 2 : Demande explicite "en PDF"
- [ ] Test 3 : Arrêté ministériel
- [ ] Test 4 : Rapport analytique
- [ ] Test 5 : Note de service
- [ ] Test 6 : Demande ambiguë (doit demander clarification)
- [ ] Test 7 : CORS (vérifier dans Network tab)
- [ ] Test 8 : Visualisation PDF
- [ ] Test 9 : Téléchargement
- [ ] Test 10 : Conversation normale (ne doit pas générer de PDF)

---

## 🎯 Tests Détaillés

### Test 1 : Message de Vœux (Cas Original) ⭐

**Objectif :** Reproduire exactement le problème initial et valider qu'il est résolu

**Étapes :**
1. Se connecter comme Ministre
2. Ouvrir le chat iAsted
3. Taper : `"je veux un document pour souhaiter la fête de fin d'années à mes collaborateurs"`
4. Attendre la réponse (8-12 secondes)
5. **Suivre avec** : `"je veux en pdf"`

**Résultats Attendus :**
- ✅ Première réponse : Génération automatique du PDF
- ✅ Message : "Excellence, j'ai généré la lettre officielle en format PDF..."
- ✅ Carte de document s'affiche
- ✅ Nom fichier : `letter_[timestamp].pdf`
- ✅ Type badge : "PDF"
- ✅ Icône : ✉️ (Mail)
- ✅ Deuxième demande : PDF déjà généré (pas de nouvelle génération)

**Résultats NON Attendus :**
- ❌ "Je ne peux pas créer de PDF"
- ❌ Texte brut sans document
- ❌ Erreur CORS
- ❌ Timeout

---

### Test 2 : Demande Explicite "en PDF"

**Variations à tester :**

```
1. "Crée-moi un rapport en PDF sur les effectifs"
2. "Je veux un PDF pour féliciter l'équipe"
3. "Génère un document PDF de remerciement"
4. "Fais-moi ça en PDF"
```

**Pour chaque variation :**
- [ ] PDF généré automatiquement
- [ ] Type de document détecté correctement
- [ ] Affichage inline fonctionne
- [ ] Boutons Voir/Télécharger présents

---

### Test 3 : Arrêté Ministériel

**Entrée :**
```
"Crée un arrêté pour la nomination de Mme Sophie Nguema 
au poste de Directrice des Ressources Humaines"
```

**Validation du contenu PDF :**
- [ ] En-tête : "RÉPUBLIQUE GABONAISE"
- [ ] Ministère complet
- [ ] Numéro d'arrêté : `N° _____ /MFPTPRE`
- [ ] Date : Format français correct
- [ ] "LE MINISTRE... ARRÊTE:"
- [ ] Articles numérotés (Article 1er, Article 2, etc.)
- [ ] Visas juridiques présents
- [ ] Signature : "Le Ministre"
- [ ] "Pour Ampliation:" avec liste

**Validation UI :**
- [ ] Icône : ⚖️ (Scale/Balance)
- [ ] Label : "Arrêté Ministériel"
- [ ] Badge : "PDF"

---

### Test 4 : Rapport Analytique

**Entrée :**
```
"Génère un rapport sur l'évolution des effectifs ce trimestre 
avec recommandations stratégiques"
```

**Validation du contenu PDF :**
- [ ] Titre en majuscules
- [ ] "À l'attention de: Excellence Monsieur le Ministre"
- [ ] Sections : I. CONTEXTE, II. CONSTATS, III. RECOMMANDATIONS
- [ ] Sous-sections numérotées (A, B, C)
- [ ] Données chiffrées (si disponibles)
- [ ] Points d'arbitrage ministériel
- [ ] Niveau de confidentialité

**Validation UI :**
- [ ] Icône : 📜 (ScrollText)
- [ ] Label : "Rapport Analytique"
- [ ] Badge : "PDF"

---

### Test 5 : Note de Service

**Entrée :**
```
"Rédige une note de service pour informer les directeurs 
de la nouvelle procédure de validation des actes"
```

**Validation du contenu PDF :**
- [ ] "NOTE DE SERVICE N° _____ /MFPTPRE"
- [ ] "De: Le Ministre"
- [ ] "À: [Destinataires]"
- [ ] "Objet: [Objet précis]"
- [ ] Corps en paragraphes courts
- [ ] "Les dispositions... entrent en vigueur..."
- [ ] Signature
- [ ] "Diffusion:" avec liste

**Validation UI :**
- [ ] Icône : ✅ (FileCheck)
- [ ] Label : "Note de Service"
- [ ] Badge : "PDF"

---

### Test 6 : Demande Ambiguë

**Entrées :**
```
1. "Fais-moi un truc pour le staff"
2. "Document"
3. "Je veux quelque chose"
```

**Résultats Attendus :**
- ✅ iAsted demande des précisions
- ✅ "Pourriez-vous préciser le type de document?"
- ✅ Pas de génération automatique

---

### Test 7 : Vérification CORS (Technique)

**Étapes :**
1. Ouvrir DevTools (F12)
2. Onglet "Network"
3. Déclencher une demande de document
4. Filtrer par "chat-with-iasted-advanced"

**Validation :**

**Requête OPTIONS (Preflight) :**
- [ ] Status : `200 OK`
- [ ] Headers de réponse :
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
  Access-Control-Allow-Methods: POST, OPTIONS
  ```

**Requête POST :**
- [ ] Status : `200 OK`
- [ ] Response contient :
  ```json
  {
    "transcript": "...",
    "responseText": "Excellence, j'ai généré...",
    "fileUrl": "https://...",
    "fileName": "...",
    "fileType": "pdf",
    "documentType": "letter"
  }
  ```

---

### Test 8 : Visualisation PDF

**Étapes :**
1. Générer un document
2. Cliquer sur "Voir"

**Validation :**
- [ ] PDF s'ouvre dans nouvel onglet
- [ ] Contenu lisible et bien formaté
- [ ] Pas de caractères corrompus
- [ ] Marges appropriées
- [ ] Format A4 (ou Letter)

---

### Test 9 : Téléchargement

**Étapes :**
1. Générer un document
2. Cliquer sur "Télécharger"

**Validation :**
- [ ] Fichier téléchargé automatiquement
- [ ] Nom correct : `[type]_[timestamp].pdf`
- [ ] Taille : 50-200 KB (typique)
- [ ] Peut être ouvert avec un lecteur PDF
- [ ] Contenu identique à la visualisation

---

### Test 10 : Conversation Normale (Non-Régression)

**Entrées :**
```
1. "Bonjour iAsted, comment vas-tu ?"
2. "Combien d'agents sont en service actif ?"
3. "Quels sont les effectifs du ministère de la Santé ?"
4. "Explique-moi le processus de titularisation"
```

**Validation :**
- [ ] Réponses normales (pas de PDF)
- [ ] Pas de carte de document
- [ ] Conversation fluide
- [ ] Données chiffrées si disponibles
- [ ] Ton approprié

---

## 🔥 Tests de Charge

### Test 11 : Génération Simultanée

**Objectif :** Vérifier que le système supporte plusieurs générations en parallèle

**Étapes :**
1. Ouvrir 3 onglets avec 3 utilisateurs différents
2. Demander la génération de documents simultanément
3. Attendre les résultats

**Validation :**
- [ ] Tous les PDF générés avec succès
- [ ] Pas de collision de noms de fichiers
- [ ] Temps de réponse < 20 secondes pour chacun
- [ ] Pas d'erreur 429 (rate limit)

---

### Test 12 : Document Long

**Entrée :**
```
"Génère un rapport complet sur l'analyse SWOT de la réforme 
de la fonction publique, incluant contexte historique, 
constats détaillés, 15 recommandations numérotées, 
et 5 scénarios d'arbitrage avec avantages/risques de chacun"
```

**Validation :**
- [ ] PDF généré sans erreur
- [ ] Temps < 30 secondes
- [ ] Taille < 500 KB
- [ ] Contenu structuré et complet
- [ ] Pas de troncature

---

### Test 13 : Génération Répétée (Même Session)

**Étapes :**
1. Générer un document
2. Immédiatement après, en générer un deuxième (différent)
3. Puis un troisième

**Validation :**
- [ ] Les 3 documents générés avec succès
- [ ] Noms de fichiers uniques (timestamps différents)
- [ ] Tous accessibles dans le chat
- [ ] Pas de confusion entre les documents
- [ ] Storage correctement incrémenté

---

## 🐛 Tests d'Erreurs

### Test 14 : API Claude Indisponible

**Simulation :** Désactiver temporairement ANTHROPIC_API_KEY

**Validation :**
- [ ] Message d'erreur clair pour l'utilisateur
- [ ] "Désolé Excellence, je rencontre un problème technique..."
- [ ] Pas de crash frontend
- [ ] Log d'erreur côté serveur
- [ ] Pas de document partiellement créé

---

### Test 15 : Bucket Storage Plein

**Simulation :** (Difficile à simuler, test théorique)

**Validation attendue :**
- [ ] Erreur capturée
- [ ] Message : "L'espace de stockage est saturé..."
- [ ] Fallback vers génération texte simple
- [ ] Alert pour l'administrateur

---

### Test 16 : PDF Générateur en Panne

**Simulation :** Désactiver `pdf-generator` Edge Function

**Validation :**
- [ ] Fallback vers fichier texte (.txt)
- [ ] Message : "Le document a été généré en format texte..."
- [ ] Téléchargement fonctionne
- [ ] Contenu exploitable

---

## 📊 Métriques de Succès

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Taux de succès génération | > 95% | ___ % |
| Temps moyen génération | < 15s | ___ s |
| Taille moyenne PDF | 50-200KB | ___ KB |
| Taux de détection correct | > 90% | ___ % |
| Satisfaction utilisateur | > 4/5 | ___ /5 |

---

## ✅ Validation Finale

**Tous les tests passés ?**
- [ ] Oui → **Déployer en production** 🚀
- [ ] Non → Voir section "Dépannage" dans `DEPLOY_GUIDE.md`

**Checklist pré-production :**
- [ ] 10/10 tests de base passés
- [ ] 3/3 tests de charge passés
- [ ] 3/3 tests d'erreurs passés
- [ ] Documentation à jour
- [ ] Rollback plan prêt
- [ ] Monitoring configuré
- [ ] Équipe informée

---

**Date de validation :** ________________  
**Validé par :** ________________  
**Statut :** ☐ Approuvé ☐ En attente ☐ Refusé

