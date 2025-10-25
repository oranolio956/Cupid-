package config

import (
	"os"
)

// LoadFromEnv loads configuration from environment variables
// This allows Render to override config.json values
func LoadFromEnv() {
	// Override listen port if PORT environment variable is set
	if port := os.Getenv("PORT"); port != "" {
		Config.Listen = ":" + port
	}

	// Override salt if SPARK_SALT environment variable is set
	if salt := os.Getenv("SPARK_SALT"); salt != "" {
		Config.Salt = salt
		// Use secure salt validation
		if err := validateAndSetSalt(); err != nil {
			// If validation fails, generate a secure salt
			secureSalt, err := generateSecureSalt()
			if err != nil {
				panic("Failed to generate secure salt: " + err.Error())
			}
			Config.Salt = secureSalt
			validateAndSetSalt() // This should not fail now
		}
	}

	// Override admin password if SPARK_ADMIN_HASH environment variable is set
	if adminHash := os.Getenv("SPARK_ADMIN_HASH"); adminHash != "" {
		if Config.Auth == nil {
			Config.Auth = make(map[string]string)
		}
		Config.Auth["admin"] = adminHash
	}

	// Override environment if GO_ENV is set
	if env := os.Getenv("GO_ENV"); env != "" {
		Config.Environment = env
	}

	// Override log level if GO_ENV is production
	if os.Getenv("GO_ENV") == "production" {
		if Config.Log == nil {
			Config.Log = &log{
				Level: "info",
				Path:  "./logs",
				Days:  7,
			}
		}
		Config.Log.Level = "info"
	}
}