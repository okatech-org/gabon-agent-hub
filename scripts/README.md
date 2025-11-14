# 🛠️ Scripts de Déploiement et Maintenance

## 📁 Contenu

### `deploy-iasted-pdf.sh`

**Description :** Script automatisé pour déployer la fonctionnalité de génération PDF d'iAsted

**Usage :**
```bash
./scripts/deploy-iasted-pdf.sh
```

**Ce que fait le script :**
1. ✅ Vérifie que Supabase CLI est installé
2. 📋 Affiche un résumé des changements
3. ⚠️  Demande confirmation avant déploiement
4. 🚀 Déploie `chat-with-iasted-advanced` Edge Function
5. 🔧 Optionnel : Déploie `pdf-generator`
6. 🔍 Vérifie le déploiement
7. 📝 Affiche les prochaines étapes

**Prérequis :**
```bash
# Installer Supabase CLI
npm install -g supabase

# Vérifier l'installation
supabase --version

# Se connecter (si pas déjà fait)
supabase login
```

**Exemple d'exécution :**
```bash
$ ./scripts/deploy-iasted-pdf.sh

╔═══════════════════════════════════════════════════════╗
║   iAsted PDF Generation - Deployment Script v2.1    ║
╚═══════════════════════════════════════════════════════╝

✅ Supabase CLI found

📋 Changes to be deployed:
  • chat-with-iasted-advanced: CORS fix + improved detection
  • pdf-generator: No changes (optional redeploy)
  • config.toml: Function JWT configuration

Deploy to production? (y/n): y

🚀 Deploying chat-with-iasted-advanced...
Deploying function chat-with-iasted-advanced (project ref: vnsspatmudluflqfcmap)
✅ chat-with-iasted-advanced deployed successfully

Also deploy pdf-generator? (y/n): n

🔍 Verifying deployment...

╔═══════════════════════════════════════════════════════╗
║              ✅ Deployment Complete!                 ║
╚═══════════════════════════════════════════════════════╝

📝 Next Steps:
...
```

---

## 🔧 Autres Scripts Disponibles

### `initializeDemoAccounts.ts`

**Description :** Initialise les comptes de démonstration

**Usage :**
```bash
npx ts-node src/scripts/initializeDemoAccounts.ts
```

---

## 📚 Documentation Associée

- **Guide de Déploiement Complet** : `/docs/iasted/DEPLOY_GUIDE.md`
- **Guide Utilisateur** : `/docs/iasted/GUIDE_GENERATION_DOCUMENTS.md`
- **Tests** : `/docs/iasted/TEST_SCENARIOS.md`
- **Résumé Rapide** : `/docs/iasted/QUICK_FIX_SUMMARY.md`

---

## 🐛 Dépannage

### Erreur : "Supabase CLI not found"

**Solution :**
```bash
npm install -g supabase
```

### Erreur : "Permission denied"

**Solution :**
```bash
chmod +x scripts/deploy-iasted-pdf.sh
```

### Erreur : "Project ref not found"

**Solution :**
Vérifier que le PROJECT_REF dans le script correspond à votre projet :
```bash
# Éditer le script
nano scripts/deploy-iasted-pdf.sh

# Modifier la ligne
PROJECT_REF="votre-project-ref"
```

### Erreur lors du déploiement

**Solution :**
```bash
# Voir les logs détaillés
supabase functions logs chat-with-iasted-advanced --project-ref vnsspatmudluflqfcmap

# Redéployer avec force
supabase functions deploy chat-with-iasted-advanced --project-ref vnsspatmudluflqfcmap --force
```

---

## 🔐 Sécurité

**Note importante :** Ce script déploie des Edge Functions en production. Toujours :
1. Tester localement d'abord
2. Vérifier les changements
3. Avoir un plan de rollback
4. Monitorer après déploiement

---

## 📞 Support

Pour toute question ou problème :
1. Consulter `/docs/iasted/DEPLOY_GUIDE.md`
2. Vérifier les logs Supabase
3. Contacter l'équipe technique

