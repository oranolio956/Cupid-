#!/bin/bash
# Real-time Monitoring Dashboard

BACKEND_URL="${BACKEND_URL:-https://spark-backend-wj4e.onrender.com}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

while true; do
    # Move cursor to top
    tput cup 0 0
    
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           SPARK RAT BACKEND MONITORING DASHBOARD              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Fetch health data
    HEALTH=$(curl -s "$BACKEND_URL/api/health" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$HEALTH" ]; then
        STATUS=$(echo "$HEALTH" | jq -r '.status // "unknown"')
        UPTIME=$(echo "$HEALTH" | jq -r '.uptime // "N/A"')
        CLIENTS=$(echo "$HEALTH" | jq -r '.clients // 0')
        VERSION=$(echo "$HEALTH" | jq -r '.version // "N/A"')
        
        # Memory stats
        MEM_ALLOC=$(echo "$HEALTH" | jq -r '.memory.alloc // 0')
        MEM_SYS=$(echo "$HEALTH" | jq -r '.memory.sys // 0')
        MEM_ALLOC_MB=$(echo "scale=2; $MEM_ALLOC / 1024 / 1024" | bc)
        MEM_SYS_MB=$(echo "scale=2; $MEM_SYS / 1024 / 1024" | bc)
        
        # System stats
        GO_VERSION=$(echo "$HEALTH" | jq -r '.system.go_version // "N/A"')
        OS=$(echo "$HEALTH" | jq -r '.system.os // "N/A"')
        CPUS=$(echo "$HEALTH" | jq -r '.system.cpus // 0"')
        
        # Service status
        API_STATUS=$(echo "$HEALTH" | jq -r '.services.api // "unknown"')
        DB_STATUS=$(echo "$HEALTH" | jq -r '.services.database // "unknown"')
        WS_STATUS=$(echo "$HEALTH" | jq -r '.services.websocket // "unknown"')
        
        # Display status
        if [ "$STATUS" = "healthy" ]; then
            echo -e "${GREEN}● STATUS: HEALTHY${NC}"
        else
            echo -e "${RED}● STATUS: UNHEALTHY${NC}"
        fi
        
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
        # General Info
        echo -e "${YELLOW}📊 GENERAL${NC}"
        echo "  Version:    $VERSION"
        echo "  Uptime:     $UPTIME"
        echo "  Clients:    $CLIENTS"
        echo ""
        
        # Memory Info
        echo -e "${YELLOW}💾 MEMORY${NC}"
        echo "  Allocated:  ${MEM_ALLOC_MB} MB"
        echo "  System:     ${MEM_SYS_MB} MB"
        echo ""
        
        # System Info
        echo -e "${YELLOW}🖥️  SYSTEM${NC}"
        echo "  Go:         $GO_VERSION"
        echo "  OS:         $OS"
        echo "  CPUs:       $CPUS"
        echo ""
        
        # Services
        echo -e "${YELLOW}🔧 SERVICES${NC}"
        [ "$API_STATUS" = "healthy" ] && echo -e "  API:        ${GREEN}✓${NC} $API_STATUS" || echo -e "  API:        ${RED}✗${NC} $API_STATUS"
        [ "$DB_STATUS" = "healthy" ] && echo -e "  Database:   ${GREEN}✓${NC} $DB_STATUS" || echo -e "  Database:   ${RED}✗${NC} $DB_STATUS"
        [ "$WS_STATUS" = "healthy" ] && echo -e "  WebSocket:  ${GREEN}✓${NC} $WS_STATUS" || echo -e "  WebSocket:  ${RED}✗${NC} $WS_STATUS"
        
    else
        echo -e "${RED}● STATUS: OFFLINE${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${RED}❌ Backend is not responding${NC}"
        echo "   URL: $BACKEND_URL"
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "  Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "  Press Ctrl+C to exit"
    echo ""
    
    sleep 5
done
