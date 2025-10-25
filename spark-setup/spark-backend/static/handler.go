package static

import (
	"errors"
	"net/url"
	"path"
	"strings"
)

var (
	ErrPathTraversal    = errors.New("path traversal detected")
	ErrAbsolutePath     = errors.New("absolute paths not allowed")
	ErrInvalidExtension = errors.New("file type not allowed")
)

var allowedExtensions = map[string]bool{
	".html": true,
	".htm":  true,
	".css":  true,
	".js":   true,
	".json": true,
	".png":  true,
	".jpg":  true,
	".jpeg": true,
	".gif":  true,
	".svg":  true,
	".ico":  true,
	".woff": true,
	".woff2": true,
	".ttf":  true,
	".eot":  true,
	".gz":   true,
}

// SanitizePath sanitizes a request path to prevent path traversal attacks
func SanitizePath(requestPath string) (string, error) {
	// 1. Decode URL encoding
	decoded, err := url.PathUnescape(requestPath)
	if err != nil {
		return "", err
	}
	
	// 2. Clean the path (removes .., ., //)
	cleaned := path.Clean(decoded)
	
	// 3. Reject if still contains ..
	if strings.Contains(cleaned, "..") {
		return "", ErrPathTraversal
	}
	
	// 4. Reject absolute paths
	if path.IsAbs(cleaned) {
		return "", ErrAbsolutePath
	}
	
	// 5. Validate extension
	ext := path.Ext(cleaned)
	if ext != "" && !allowedExtensions[strings.ToLower(ext)] {
		return "", ErrInvalidExtension
	}
	
	// 6. Remove leading slash for consistency
	cleaned = strings.TrimPrefix(cleaned, "/")
	
	return cleaned, nil
}