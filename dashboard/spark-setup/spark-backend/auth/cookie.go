package auth

import (
	"net/http"
)

// CookieManager handles secure cookie operations
type CookieManager struct {
	secureCookies bool  // Set to true in production
	domain        string
}

// NewCookieManager creates a new cookie manager
func NewCookieManager(production bool, domain string) *CookieManager {
	return &CookieManager{
		secureCookies: production,
		domain:        domain,
	}
}

// SetAuthCookie sets a secure authentication cookie
func (cm *CookieManager) SetAuthCookie(w http.ResponseWriter, token string) {
	cookie := &http.Cookie{
		Name:     "Authorization",
		Value:    token,
		Path:     "/",
		Domain:   cm.domain,
		MaxAge:   1800,  // 30 minutes
		HttpOnly: true,  // Prevent XSS
		Secure:   cm.secureCookies,  // HTTPS only in production
		SameSite: http.SameSiteStrictMode,  // CSRF protection
	}
	
	http.SetCookie(w, cookie)
}

// ClearAuthCookie clears the authentication cookie
func (cm *CookieManager) ClearAuthCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "Authorization",
		Value:    "",
		Path:     "/",
		Domain:   cm.domain,
		MaxAge:   -1,  // Delete cookie
		HttpOnly: true,
		Secure:   cm.secureCookies,
		SameSite: http.SameSiteStrictMode,
	}
	
	http.SetCookie(w, cookie)
}