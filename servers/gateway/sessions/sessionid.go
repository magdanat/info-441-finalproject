// package sessions

// import (
// 	"bytes"
// 	"crypto/hmac"
// 	"crypto/rand"
// 	"crypto/sha256"
// 	"encoding/base64"
// 	"errors"
// )

// //InvalidSessionID represents an empty, invalid session ID
// const InvalidSessionID SessionID = ""

// //idLength is the length of the ID portion
// const idLength = 32

// //signedLength is the full length of the signed session ID
// //(ID portion plus signature)
// const signedLength = idLength + sha256.Size

// //SessionID represents a valid, digitally-signed session ID.
// //This is a base64 URL encoded string created from a byte slice
// //where the first `idLength` bytes are crytographically random
// //bytes representing the unique session ID, and the remaining bytes
// //are an HMAC hash of those ID bytes (i.e., a digital signature).
// //The byte slice layout is like so:
// //+-----------------------------------------------------+
// //|...32 crypto random bytes...|HMAC hash of those bytes|
// //+-----------------------------------------------------+
// type SessionID string

// //ErrInvalidID is returned when an invalid session id is passed to ValidateID()
// var ErrInvalidID = errors.New("Invalid Session ID")

// //NewSessionID creates and returns a new digitally-signed session ID,
// //using `signingKey` as the HMAC signing key. An error is returned only
// //if there was an error generating random bytes for the session ID
// func NewSessionID(signingKey string) (SessionID, error) {
// 	if len(signingKey) == 0 {
// 		return InvalidSessionID, errors.New("signingKey must not be empty")
// 	}
// 	message, err := GenerateRandomBytes(idLength)
// 	if err != nil {
// 		return InvalidSessionID, errors.New("Unable to generate random bytes for SessionID")
// 	}
// 	signature := hashHMAC(message, signingKey)
// 	message = append(message, signature...)
// 	return SessionID(base64.URLEncoding.EncodeToString(message)), nil
// }

// // GenerateRandomBytes returns securely generated random bytes.
// // It will return an error if the system's secure random
// // number generator fails to function correctly, in which
// // case the caller should not continue.
// func GenerateRandomBytes(n int) ([]byte, error) {
// 	b := make([]byte, n)
// 	_, err := rand.Read(b)
// 	// Note that err == nil only if we read len(b) bytes.
// 	if err != nil {
// 		return nil, err
// 	}
// 	return b, nil
// }

// //ValidateID validates the string in the `id` parameter
// //using the `signingKey` as the HMAC signing key
// //and returns an error if invalid, or a SessionID if valid
// func ValidateID(id string, signingKey string) (SessionID, error) {
// 	temp, err := base64.URLEncoding.DecodeString(id)
// 	if err != nil {
// 		return InvalidSessionID, ErrInvalidID
// 	}
// 	idPortion := temp[:32]

// 	// HMAC hash
// 	hash := hashHMAC(idPortion, signingKey)

// 	// compare current hash with one inside temp
// 	equal := bytes.Equal(hash, temp[32:])
// 	// if match, return the entire id as a sessionID type
// 	if equal == true {
// 		return SessionID(id), nil
// 	}
// 	return InvalidSessionID, ErrInvalidID
// }

// func hashHMAC(message []byte, signingKey string) []byte {
// 	//convert string to byte array
// 	key := []byte(signingKey)

// 	//create a new HMAC hasher
// 	h := hmac.New(sha256.New, key)

// 	//write the message into it
// 	h.Write(message)

// 	//calculate the HMAC signature
// 	signature := h.Sum(nil)
// 	return signature
// }

// //String returns a string representation of the sessionID
// func (sid SessionID) String() string {
// 	return string(sid)
// }
