package config

import (
	"bytes"
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
		Config.SaltBytes = []byte(Config.Salt)
		Config.SaltBytes = append(Config.SaltBytes, bytes.Repeat([]byte{25}, 24)...)
		Config.SaltBytes = Config.SaltBytes[:24]
	}

	// Override admin password if SPARK_ADMIN_HASH environment variable is set
	if adminHash := os.Getenv("SPARK_ADMIN_HASH"); adminHash != "" {
		if Config.Auth == nil {
			Config.Auth = make(map[string]string)
		}
		Config.Auth["admin"] = adminHash
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