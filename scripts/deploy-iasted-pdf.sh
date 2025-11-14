#!/bin/bash

# ============================================================
# Script de Déploiement - iAsted Génération PDF v2.1
# ============================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project reference
PROJECT_REF="vnsspatmudluflqfcmap"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   iAsted PDF Generation - Deployment Script v2.1    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Please install it: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Step 1: Display changes
echo -e "${YELLOW}📋 Changes to be deployed:${NC}"
echo "  • chat-with-iasted-advanced: CORS fix + improved detection"
echo "  • pdf-generator: No changes (optional redeploy)"
echo "  • config.toml: Function JWT configuration"
echo ""

# Step 2: Confirm deployment
read -p "Deploy to production? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Deployment cancelled${NC}"
    exit 0
fi

# Step 3: Deploy chat-with-iasted-advanced
echo ""
echo -e "${BLUE}🚀 Deploying chat-with-iasted-advanced...${NC}"
supabase functions deploy chat-with-iasted-advanced \
  --project-ref "$PROJECT_REF" \
  --no-verify-jwt=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ chat-with-iasted-advanced deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy chat-with-iasted-advanced${NC}"
    exit 1
fi

# Step 4: Optional - Deploy pdf-generator
echo ""
read -p "Also deploy pdf-generator? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Deploying pdf-generator...${NC}"
    supabase functions deploy pdf-generator \
      --project-ref "$PROJECT_REF" \
      --no-verify-jwt=false
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ pdf-generator deployed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  pdf-generator deployment failed (non-critical)${NC}"
    fi
fi

# Step 5: Verify deployment
echo ""
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
echo ""
supabase functions list --project-ref "$PROJECT_REF"

# Step 6: Instructions
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Deployment Complete!                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Test the deployment:"
echo "   • Open: http://localhost:8080"
echo "   • Login as Ministre"
echo "   • Chat: 'je veux un document pour souhaiter la fête'"
echo "   • Verify: PDF generates and displays"
echo ""
echo "2. Check CORS in browser DevTools (F12):"
echo "   • Network tab > Filter 'chat-with-iasted-advanced'"
echo "   • OPTIONS request should return 200 OK"
echo "   • POST request should return 200 OK"
echo ""
echo "3. Monitor Edge Functions:"
echo "   • Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "   • Edge Functions > Logs"
echo ""
echo "4. View real-time logs:"
echo "   supabase functions logs chat-with-iasted-advanced --project-ref $PROJECT_REF --follow"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   • Quick Start: docs/iasted/QUICK_FIX_SUMMARY.md"
echo "   • Full Guide: docs/iasted/DEPLOY_GUIDE.md"
echo "   • Tests: docs/iasted/TEST_SCENARIOS.md"
echo ""
echo -e "${GREEN}Happy deploying! 🎉${NC}"

