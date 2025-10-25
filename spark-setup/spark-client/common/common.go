package common

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
)

// EncryptData encrypts data using AES-256-CBC with the provided salt
func EncryptData(data []byte, salt string) ([]byte, error) {
	// Create MD5 hash of salt for key
	hash := md5.Sum([]byte(salt))
	key := hash[:]

	// Create cipher block
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// Add PKCS7 padding
	paddedData := addPKCS7Padding(data, aes.BlockSize)

	// Create IV
	iv := make([]byte, aes.BlockSize)
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}

	// Encrypt
	mode := cipher.NewCBCEncrypter(block, iv)
	encrypted := make([]byte, len(paddedData))
	mode.CryptBlocks(encrypted, paddedData)

	// Prepend IV to encrypted data
	result := append(iv, encrypted...)
	return result, nil
}

// DecryptData decrypts data using AES-256-CBC with the provided salt
func DecryptData(encryptedData []byte, salt string) ([]byte, error) {
	// Create MD5 hash of salt for key
	hash := md5.Sum([]byte(salt))
	key := hash[:]

	// Create cipher block
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// Extract IV
	if len(encryptedData) < aes.BlockSize {
		return nil, fmt.Errorf("encrypted data too short")
	}

	iv := encryptedData[:aes.BlockSize]
	encrypted := encryptedData[aes.BlockSize:]

	// Decrypt
	mode := cipher.NewCBCDecrypter(block, iv)
	decrypted := make([]byte, len(encrypted))
	mode.CryptBlocks(decrypted, encrypted)

	// Remove PKCS7 padding
	return removePKCS7Padding(decrypted), nil
}

// addPKCS7Padding adds PKCS7 padding to data
func addPKCS7Padding(data []byte, blockSize int) []byte {
	padding := blockSize - (len(data) % blockSize)
	padtext := make([]byte, padding)
	for i := range padtext {
		padtext[i] = byte(padding)
	}
	return append(data, padtext...)
}

// removePKCS7Padding removes PKCS7 padding from data
func removePKCS7Padding(data []byte) []byte {
	length := len(data)
	if length == 0 {
		return data
	}
	unpadding := int(data[length-1])
	if unpadding > length {
		return data
	}
	return data[:(length - unpadding)]
}

// GenerateRandomBytes generates random bytes of specified length
func GenerateRandomBytes(length int) ([]byte, error) {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	return bytes, err
}

// BytesToHex converts bytes to hex string
func BytesToHex(data []byte) string {
	return hex.EncodeToString(data)
}

// HexToBytes converts hex string to bytes
func HexToBytes(hexStr string) ([]byte, error) {
	return hex.DecodeString(hexStr)
}