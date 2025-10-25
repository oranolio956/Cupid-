package main

import (
	"embed"
	"io/fs"
)

//go:embed web/dist
var embedFS embed.FS

// GetEmbedFS returns the embedded filesystem for the frontend
func GetEmbedFS() fs.FS {
	return embedFS
}
