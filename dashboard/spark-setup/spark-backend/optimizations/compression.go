package optimizations

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// CompressionLevel represents compression levels
type CompressionLevel int

const (
	NoCompression CompressionLevel = iota
	BestSpeed
	BestCompression
	DefaultCompression
)

// CompressionMiddleware provides HTTP response compression
type CompressionMiddleware struct {
	level CompressionLevel
}

// NewCompressionMiddleware creates a new compression middleware
func NewCompressionMiddleware(level CompressionLevel) *CompressionMiddleware {
	return &CompressionMiddleware{
		level: level,
	}
}

// ShouldCompress determines if the response should be compressed
func (cm *CompressionMiddleware) ShouldCompress(r *http.Request) bool {
	// Check if client accepts gzip
	acceptEncoding := r.Header.Get("Accept-Encoding")
	if !strings.Contains(acceptEncoding, "gzip") {
		return false
	}
	
	// Don't compress if already compressed
	contentEncoding := r.Header.Get("Content-Encoding")
	if contentEncoding != "" {
		return false
	}
	
	return true
}

// CompressResponse compresses the response body
func (cm *CompressionMiddleware) CompressResponse(data []byte) ([]byte, error) {
	var buf bytes.Buffer
	
	// Set compression level
	level := gzip.DefaultCompression
	switch cm.level {
	case BestSpeed:
		level = gzip.BestSpeed
	case BestCompression:
		level = gzip.BestCompression
	case NoCompression:
		return data, nil
	}
	
	// Create gzip writer
	writer, err := gzip.NewWriterLevel(&buf, level)
	if err != nil {
		return nil, err
	}
	defer writer.Close()
	
	// Write data
	_, err = writer.Write(data)
	if err != nil {
		return nil, err
	}
	
	// Flush writer
	err = writer.Flush()
	if err != nil {
		return nil, err
	}
	
	return buf.Bytes(), nil
}

// DecompressData decompresses gzip data
func (cm *CompressionMiddleware) DecompressData(data []byte) ([]byte, error) {
	reader, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	defer reader.Close()
	
	return io.ReadAll(reader)
}

// CompressJSON compresses JSON data
func (cm *CompressionMiddleware) CompressJSON(data interface{}) ([]byte, error) {
	// Marshal to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	
	// Compress
	return cm.CompressResponse(jsonData)
}

// CompressionHandler wraps an HTTP handler with compression
func (cm *CompressionMiddleware) CompressionHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if we should compress
		if !cm.ShouldCompress(r) {
			next.ServeHTTP(w, r)
			return
		}
		
		// Create a response writer that captures the response
		writer := &ResponseWriter{
			ResponseWriter: w,
			buffer:        &bytes.Buffer{},
		}
		
		// Call the next handler
		next.ServeHTTP(writer, r)
		
		// Get the response data
		responseData := writer.buffer.Bytes()
		
		// Compress the response
		compressedData, err := cm.CompressResponse(responseData)
		if err != nil {
			// If compression fails, send original data
			w.Write(responseData)
			return
		}
		
		// Set compression headers
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(compressedData)))
		w.Header().Set("Vary", "Accept-Encoding")
		
		// Send compressed response
		w.Write(compressedData)
	})
}

// ResponseWriter captures the response for compression
type ResponseWriter struct {
	http.ResponseWriter
	buffer *bytes.Buffer
}

// Write captures the response data
func (rw *ResponseWriter) Write(data []byte) (int, error) {
	return rw.buffer.Write(data)
}

// WriteHeader captures the status code
func (rw *ResponseWriter) WriteHeader(statusCode int) {
	rw.ResponseWriter.WriteHeader(statusCode)
}

// Header returns the response headers
func (rw *ResponseWriter) Header() http.Header {
	return rw.ResponseWriter.Header()
}

// DataCompression provides data compression utilities
type DataCompression struct {
	level CompressionLevel
}

// NewDataCompression creates a new data compression utility
func NewDataCompression(level CompressionLevel) *DataCompression {
	return &DataCompression{
		level: level,
	}
}

// CompressData compresses arbitrary data
func (dc *DataCompression) CompressData(data []byte) ([]byte, error) {
	if len(data) < 1024 { // Don't compress small data
		return data, nil
	}
	
	var buf bytes.Buffer
	
	// Set compression level
	level := gzip.DefaultCompression
	switch dc.level {
	case BestSpeed:
		level = gzip.BestSpeed
	case BestCompression:
		level = gzip.BestCompression
	case NoCompression:
		return data, nil
	}
	
	// Create gzip writer
	writer, err := gzip.NewWriterLevel(&buf, level)
	if err != nil {
		return nil, err
	}
	defer writer.Close()
	
	// Write data
	_, err = writer.Write(data)
	if err != nil {
		return nil, err
	}
	
	// Flush writer
	err = writer.Flush()
	if err != nil {
		return nil, err
	}
	
	return buf.Bytes(), nil
}

// DecompressData decompresses data
func (dc *DataCompression) DecompressData(data []byte) ([]byte, error) {
	reader, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	defer reader.Close()
	
	return io.ReadAll(reader)
}

// GetCompressionRatio calculates compression ratio
func (dc *DataCompression) GetCompressionRatio(original, compressed []byte) float64 {
	if len(original) == 0 {
		return 0
	}
	
	return float64(len(compressed)) / float64(len(original)) * 100
}

// CompressionStats provides compression statistics
type CompressionStats struct {
	TotalRequests     int64   `json:"total_requests"`
	CompressedRequests int64   `json:"compressed_requests"`
	OriginalSize      int64   `json:"original_size"`
	CompressedSize    int64   `json:"compressed_size"`
	CompressionRatio  float64 `json:"compression_ratio"`
	BytesSaved        int64   `json:"bytes_saved"`
}

// UpdateStats updates compression statistics
func (cs *CompressionStats) UpdateStats(originalSize, compressedSize int64) {
	cs.TotalRequests++
	cs.CompressedRequests++
	cs.OriginalSize += originalSize
	cs.CompressedSize += compressedSize
	
	if cs.OriginalSize > 0 {
		cs.CompressionRatio = float64(cs.CompressedSize) / float64(cs.OriginalSize) * 100
		cs.BytesSaved = cs.OriginalSize - cs.CompressedSize
	}
}

// GetStats returns compression statistics
func (cs *CompressionStats) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"total_requests":      cs.TotalRequests,
		"compressed_requests": cs.CompressedRequests,
		"original_size":       cs.OriginalSize,
		"compressed_size":     cs.CompressedSize,
		"compression_ratio":   fmt.Sprintf("%.2f%%", cs.CompressionRatio),
		"bytes_saved":         cs.BytesSaved,
		"compression_rate":    fmt.Sprintf("%.2f%%", float64(cs.CompressedRequests)/float64(cs.TotalRequests)*100),
	}
}