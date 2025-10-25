package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"net/http"
	"time"
)

// CSRFManager handles CSRF token generation and validation
type CSRFManager struct {
	tokens map[string]time.Time
}

// NewCSRFManager creates a new CSRF manager
func NewCSRFManager() *CSRFManager {
	return &CSRFManager{
		tokens: make(map[string]time.Time),
	}
}

// GenerateCSRFToken generates a new CSRF token
func (cm *CSRFManager) GenerateCSRFToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	token := base64.URLEncoding.EncodeToString(b)
	cm.tokens[token] = time.Now().Add(30 * time.Minute) // 30 minute expiry
	return token
}

// ValidateCSRFToken validates a CSRF token
func (cm *CSRFManager) ValidateCSRFToken(token string) bool {
	expiry, exists := cm.tokens[token]
	if !exists {
		return false
	}
	
	if time.Now().After(expiry) {
		delete(cm.tokens, token)
		return false
	}
	
	return true
}

// CSRFMiddleware creates a CSRF protection middleware
func CSRFMiddleware(csrfManager *CSRFManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip CSRF check for GET, HEAD, OPTIONS
			if r.Method == "GET" || r.Method == "HEAD" || r.Method == "OPTIONS" {
				next.ServeHTTP(w, r)
				return
			}
			
			// Get CSRF token from cookie and header
			cookieToken, err := r.Cookie("CSRF-Token")
			if err != nil {
				http.Error(w, "CSRF token missing", http.StatusForbidden)
				return
			}
			
			headerToken := r.Header.Get("X-CSRF-Token")
			if headerToken == "" {
				http.Error(w, "CSRF token missing from header", http.StatusForbidden)
				return
			}
			
			// Validate tokens match and are valid
			if !csrfManager.ValidateCSRFToken(cookieToken.Value) {
				http.Error(w, "Invalid CSRF token", http.StatusForbidden)
				return
			}
			
			if subtle.ConstantTimeCompare([]byte(cookieToken.Value), []byte(headerToken)) != 1 {
				http.Error(w, "CSRF token mismatch", http.StatusForbidden)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}
}