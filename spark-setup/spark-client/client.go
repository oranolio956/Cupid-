package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"

	"./config"
	"./core"
	"./service"
)

const (
	ServiceName = "spark-client"
	Version     = "1.0.0"
)

var (
	installService = flag.Bool("install", false, "Install as service")
	uninstallService = flag.Bool("uninstall", false, "Uninstall service")
	serviceStatus = flag.Bool("status", false, "Check service status")
	version = flag.Bool("version", false, "Show version")
	help = flag.Bool("help", false, "Show help")
)

func main() {
	flag.Parse()

	// Show version
	if *version {
		fmt.Printf("Spark Client v%s\n", Version)
		fmt.Printf("OS: %s\n", runtime.GOOS)
		fmt.Printf("Arch: %s\n", runtime.GOARCH)
		return
	}

	// Show help
	if *help {
		showHelp()
		return
	}

	// Get executable path
	execPath, err := os.Executable()
	if err != nil {
		log.Fatalf("Failed to get executable path: %v", err)
	}

	// Service management
	serviceManager := service.NewServiceManager(ServiceName, execPath)

	// Install service
	if *installService {
		if err := serviceManager.Install(); err != nil {
			log.Fatalf("Failed to install service: %v", err)
		}
		fmt.Println("Service installed successfully")
		return
	}

	// Uninstall service
	if *uninstallService {
		if err := serviceManager.Uninstall(); err != nil {
			log.Fatalf("Failed to uninstall service: %v", err)
		}
		fmt.Println("Service uninstalled successfully")
		return
	}

	// Check service status
	if *serviceStatus {
		status, err := serviceManager.GetServiceStatus()
		if err != nil {
			log.Fatalf("Failed to get service status: %v", err)
		}
		fmt.Printf("Service status: %s\n", status)
		return
	}

	// Run client
	runClient()
}

func runClient() {
	// Get configuration
	cfg := config.GetDefaultConfig()
	
	// Create client
	client := core.NewClient(cfg)

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Connect to server
	if err := client.Connect(); err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	// Wait for signal
	<-sigChan

	// Disconnect
	log.Println("Shutting down...")
	if err := client.Disconnect(); err != nil {
		log.Printf("Error during disconnect: %v", err)
	}
}

func showHelp() {
	fmt.Printf("Spark Client v%s\n\n", Version)
	fmt.Println("Usage:")
	fmt.Printf("  %s [options]\n\n", filepath.Base(os.Args[0]))
	fmt.Println("Options:")
	fmt.Println("  -install      Install as system service")
	fmt.Println("  -uninstall    Uninstall system service")
	fmt.Println("  -status       Check service status")
	fmt.Println("  -version      Show version information")
	fmt.Println("  -help         Show this help message")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Printf("  %s                    # Run client normally\n", filepath.Base(os.Args[0]))
	fmt.Printf("  %s -install          # Install as service\n", filepath.Base(os.Args[0]))
	fmt.Printf("  %s -status           # Check if service is running\n", filepath.Base(os.Args[0]))
	fmt.Printf("  %s -uninstall        # Remove service\n", filepath.Base(os.Args[0]))
}