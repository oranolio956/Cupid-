package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestWSHandshakeOriginValidation(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		origin         string
		expectedStatus int
		description    string
	}{
		{
			name:           "Valid origin - production",
			origin:         "https://cupid-otys.vercel.app",
			expectedStatus: http.StatusBadRequest, // Will fail at next validation step, but passes origin check
			description:    "Should accept valid production origin",
		},
		{
			name:           "Valid origin - backend",
			origin:         "https://spark-backend-fixed-v2.onrender.com",
			expectedStatus: http.StatusBadRequest,
			description:    "Should accept valid backend origin",
		},
		{
			name:           "Valid origin - localhost",
			origin:         "http://localhost:3000",
			expectedStatus: http.StatusBadRequest,
			description:    "Should accept localhost for development",
		},
		{
			name:           "Empty origin - SECURITY BUG",
			origin:         "",
			expectedStatus: http.StatusForbidden,
			description:    "Should REJECT empty origin (was bypassing validation)",
		},
		{
			name:           "Invalid origin",
			origin:         "https://malicious-site.com",
			expectedStatus: http.StatusForbidden,
			description:    "Should reject invalid origin",
		},
		{
			name:           "Null origin",
			origin:         "null",
			expectedStatus: http.StatusForbidden,
			description:    "Should reject null origin string",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create test router
			router := gin.New()
			router.Any("/ws", wsHandshake)

			// Create test request
			req := httptest.NewRequest("GET", "/ws", nil)
			if tt.origin != "" {
				req.Header.Set("Origin", tt.origin)
			}
			req.Header.Set("Connection", "Upgrade")
			req.Header.Set("Upgrade", "websocket")

			// Record response
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// Verify status code
			if w.Code != tt.expectedStatus {
				t.Errorf("%s: expected status %d, got %d - %s",
					tt.name, tt.expectedStatus, w.Code, tt.description)
			}
		})
	}
}

func TestWSHandshakeEmptyOriginBugFix(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// This test specifically validates the security bug fix
	router := gin.New()
	router.Any("/ws", wsHandshake)

	// Test 1: Empty origin should be REJECTED (this was the bug)
	req := httptest.NewRequest("GET", "/ws", nil)
	req.Header.Set("Connection", "Upgrade")
	req.Header.Set("Upgrade", "websocket")
	// Intentionally NOT setting Origin header

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("SECURITY BUG NOT FIXED: Empty origin should return 403 Forbidden, got %d", w.Code)
		t.Errorf("This allows unauthorized WebSocket connections!")
	} else {
		t.Logf("✓ Security fix verified: Empty origin correctly rejected with 403")
	}

	// Test 2: Verify valid origin still works
	req2 := httptest.NewRequest("GET", "/ws", nil)
	req2.Header.Set("Origin", "https://cupid-otys.vercel.app")
	req2.Header.Set("Connection", "Upgrade")
	req2.Header.Set("Upgrade", "websocket")

	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	if w2.Code == http.StatusForbidden {
		t.Errorf("Valid origin should not be rejected, got %d", w2.Code)
	} else {
		t.Logf("✓ Valid origin correctly accepted (fails at next validation step as expected)")
	}
}
