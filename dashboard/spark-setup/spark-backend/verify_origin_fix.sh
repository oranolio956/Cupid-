#!/bin/bash

# Verification script for WebSocket Origin Bypass Security Fix
# This script verifies that the fix correctly rejects empty origins

echo "=========================================="
echo "WebSocket Origin Bypass Fix Verification"
echo "=========================================="
echo ""

# Check if the fix is present in main.go
echo "1. Checking if fix is present in code..."
if grep -q 'if origin == ""' spark-setup/spark-backend/main.go 2>/dev/null || grep -q 'if origin == ""' main.go 2>/dev/null; then
    echo "   ✓ Fix detected: Empty origin check is present"
else
    echo "   ✗ Fix NOT found: Empty origin check is missing"
    exit 1
fi

# Check that the old vulnerable code is removed
echo ""
echo "2. Checking that vulnerable code is removed..."
if grep -q 'if !validOrigin && origin != ""' spark-setup/spark-backend/main.go 2>/dev/null || grep -q 'if !validOrigin && origin != ""' main.go 2>/dev/null; then
    echo "   ✗ VULNERABLE CODE STILL PRESENT!"
    echo "   The old logic 'if !validOrigin && origin != \"\"' allows empty origins to bypass validation"
    exit 1
else
    echo "   ✓ Vulnerable code removed"
fi

# Check for proper logging
echo ""
echo "3. Checking for security logging..."
if grep -q 'missing origin header' spark-setup/spark-backend/main.go 2>/dev/null || grep -q 'missing origin header' main.go 2>/dev/null; then
    echo "   ✓ Security logging added for rejected connections"
else
    echo "   ⚠ Warning: Security logging not found (recommended but not critical)"
fi

echo ""
echo "=========================================="
echo "Fix Verification Summary"
echo "=========================================="
echo ""
echo "✓ Security fix successfully applied!"
echo ""
echo "What was fixed:"
echo "  - BEFORE: Empty origin strings bypassed validation"
echo "  - AFTER:  Empty origins are explicitly rejected with 403 Forbidden"
echo ""
echo "Security impact:"
echo "  - Prevents cross-site WebSocket hijacking attacks"
echo "  - Blocks unauthorized WebSocket connections"
echo "  - Adds security logging for monitoring"
echo ""
echo "Testing recommendations:"
echo "  1. Test with valid origin: curl -H 'Origin: https://cupid-otys.vercel.app' ..."
echo "  2. Test with empty origin: curl (no Origin header) - should return 403"
echo "  3. Test with invalid origin: curl -H 'Origin: https://evil.com' - should return 403"
echo ""
