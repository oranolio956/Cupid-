package main

import (
	"spark-client/config"
	"spark-client/core"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/kataras/golog"
)

func init() {
	golog.SetTimeFormat(`2006/01/02 15:04:05`)

	// Load production configuration instead of encrypted ConfigBuffer
	config.LoadProductionConfig()
	
	if strings.HasSuffix(config.Config.Path, `/`) {
		config.Config.Path = config.Config.Path[:len(config.Config.Path)-1]
	}
}

func main() {
	update()
	core.Start()
}

func update() {
	selfPath, err := os.Executable()
	if err != nil {
		selfPath = os.Args[0]
	}
	if len(os.Args) > 1 && os.Args[1] == `--update` {
		if len(selfPath) <= 4 {
			return
		}
		destPath := selfPath[:len(selfPath)-4]
		thisFile, err := os.ReadFile(selfPath)
		if err != nil {
			return
		}
		os.WriteFile(destPath, thisFile, 0755)
		cmd := exec.Command(destPath, `--clean`)
		if cmd.Start() == nil {
			os.Exit(0)
			return
		}
	}
	if len(os.Args) > 1 && os.Args[1] == `--clean` {
		<-time.After(3 * time.Second)
		os.Remove(selfPath + `.tmp`)
	}
}

