package config

import (
	"Spark/utils"
	"crypto/rand"
	"encoding/base64"
	"flag"
	"fmt"
	"github.com/kataras/golog"
	"math"
	"os"
)

type config struct {
	Listen      string            `json:"listen"`
	Salt        string            `json:"salt"`
	Auth        map[string]string `json:"auth"`
	Log         *log              `json:"log"`
	Environment string            `json:"environment"`
	SaltBytes   []byte            `json:"-"`
}
type log struct {
	Level string `json:"level"`
	Path  string `json:"path"`
	Days  uint   `json:"days"`
}

// Commit is hash of this commit, for auto upgrade.
var Commit = ``
var Config config
var BuiltPath = `./built/%v_%v`

func init() {
	golog.SetTimeFormat(`2006/01/02 15:04:05`)

	var (
		err                      error
		configData               []byte
		configPath, listen, salt string
		username, password       string
		logLevel, logPath        string
		logDays                  uint
	)
	flag.StringVar(&configPath, `config`, `config.json`, `config file path, default: config.json`)
	flag.StringVar(&listen, `listen`, `:8000`, `required, listen address, default: :8000`)
	flag.StringVar(&salt, `salt`, ``, `required, salt of server`)
	flag.StringVar(&username, `username`, ``, `username of web interface`)
	flag.StringVar(&password, `password`, ``, `password of web interface`)
	flag.StringVar(&logLevel, `log-level`, `info`, `log level, default: info`)
	flag.StringVar(&logPath, `log-path`, `./logs`, `log file path, default: ./logs`)
	flag.UintVar(&logDays, `log-days`, 7, `max days of logs, default: 7`)
	flag.Parse()

	if len(configPath) > 0 {
		configData, err = os.ReadFile(configPath)
		if err != nil {
			configData, err = os.ReadFile(`Config.json`)
			if err != nil {
				fatal(map[string]any{
					`event`:  `CONFIG_LOAD`,
					`status`: `fail`,
					`msg`:    err.Error(),
				})
				return
			}
		}
		err = utils.JSON.Unmarshal(configData, &Config)
		if err != nil {
			fatal(map[string]any{
				`event`:  `CONFIG_PARSE`,
				`status`: `fail`,
				`msg`:    err.Error(),
			})
			return
		}
		if Config.Log == nil {
			Config.Log = &log{
				Level: `info`,
				Path:  `./logs`,
				Days:  7,
			}
		}
	} else {
		Config = config{
			Listen: listen,
			Salt:   salt,
			Auth: map[string]string{
				username: password,
			},
			Log: &log{
				Level: logLevel,
				Path:  logPath,
				Days:  logDays,
			},
		}
	}

	// Validate and set salt with proper security checks
	if err := validateAndSetSalt(); err != nil {
		fatal(map[string]any{
			`event`:  `CONFIG_PARSE`,
			`status`: `fail`,
			`msg`:    err.Error(),
		})
		return
	}

	golog.SetLevel(utils.If(len(Config.Log.Level) == 0, `info`, Config.Log.Level))
}

func fatal(args map[string]any) {
	output, _ := utils.JSON.MarshalToString(args)
	golog.Fatal(output)
}


const (
	RequiredSaltLength = 24
	MinSaltEntropy     = 3.5
)

// validateAndSetSalt validates the salt and sets SaltBytes with proper security checks
func validateAndSetSalt() error {
	// 1. Check length - require exactly 24 bytes
	if len(Config.Salt) != RequiredSaltLength {
		return fmt.Errorf("salt must be exactly %d bytes, got %d", RequiredSaltLength, len(Config.Salt))
	}
	
	// 2. Calculate Shannon entropy
	entropy := calculateEntropy([]byte(Config.Salt))
	if entropy < MinSaltEntropy {
		return fmt.Errorf("salt has insufficient randomness (entropy: %.2f, required: %.2f)", entropy, MinSaltEntropy)
	}
	
	// 3. Set salt bytes (no padding needed - exact length required)
	Config.SaltBytes = []byte(Config.Salt)
	
	return nil
}

// calculateEntropy calculates the Shannon entropy of the given data
func calculateEntropy(data []byte) float64 {
	if len(data) == 0 {
		return 0
	}
	
	freq := make(map[byte]int)
	for _, b := range data {
		freq[b]++
	}
	
	var entropy float64
	for _, count := range freq {
		p := float64(count) / float64(len(data))
		entropy -= p * math.Log2(p)
	}
	
	return entropy
}

// generateSecureSalt generates a cryptographically secure salt
func generateSecureSalt() (string, error) {
	salt := make([]byte, RequiredSaltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("failed to generate secure salt: %w", err)
	}
	return base64.RawStdEncoding.EncodeToString(salt)[:RequiredSaltLength], nil
}
