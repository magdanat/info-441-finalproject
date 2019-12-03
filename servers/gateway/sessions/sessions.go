// package sessions

// import (
// 	"errors"
// 	"net/http"
// 	"strings"
// )

// const headerAuthorization = "Authorization"
// const paramAuthorization = "auth"
// const schemeBearer = "Bearer "

// //ErrNoSessionID is used when no session ID was found in the Authorization header
// var ErrNoSessionID = errors.New("no session ID found in " + headerAuthorization + " header")

// //ErrInvalidScheme is used when the authorization scheme is not supported
// var ErrInvalidScheme = errors.New("authorization scheme not supported")

// //BeginSession creates a new SessionID, saves the `sessionState` to the store, adds an
// //Authorization header to the response with the SessionID, and returns the new SessionID
// func BeginSession(signingKey string, store Store, sessionState interface{}, w http.ResponseWriter) (SessionID, error) {
// 	sessionID, err := NewSessionID(signingKey)
// 	if err != nil {
// 		return InvalidSessionID, ErrInvalidScheme
// 	}
// 	store.Save(sessionID, sessionState)
// 	authHeader := "Bearer " + sessionID.String()
// 	w.Header().Set("Authorization", authHeader)
// 	return sessionID, err
// }

// //GetSessionID extracts and validates the SessionID from the request headers
// func GetSessionID(r *http.Request, signingKey string) (SessionID, error) {
// 	//TODO: get the value of the Authorization header,
// 	//or the "auth" query string parameter if no Authorization header is present,
// 	//and validate it. If it's valid, return the SessionID. If not
// 	//return the validation error.
// 	headerVal := r.Header.Get("Authorization")
// 	if headerVal == "" {
// 		keys, ok := r.URL.Query()["auth"]
// 		if len(keys) < 1 || !ok {
// 			return InvalidSessionID, ErrInvalidScheme
// 		}
// 		headerVal = keys[0]
// 	}
// 	res := strings.Split(headerVal, "Bearer")

// 	if len(res) < 2 {
// 		return InvalidSessionID, ErrInvalidScheme
// 	}
// 	res[1] = strings.TrimSpace(res[1])
// 	res[1] = strings.Replace(res[1], " ", "+", -1)
// 	sessionID, err := ValidateID(res[1], signingKey)
// 	if err != nil {
// 		return InvalidSessionID, ErrInvalidScheme
// 	}
// 	return sessionID, err
// }

// //GetState extracts the SessionID from the request,
// //gets the associated state from the provided store into
// //the `sessionState` parameter, and returns the SessionID
// func GetState(r *http.Request, signingKey string, store Store, sessionState interface{}) (SessionID, error) {
// 	//TODO: get the SessionID from the request, and get the data
// 	//associated with that SessionID from the store.
// 	sessionID, err := GetSessionID(r, signingKey)
// 	if err != nil {
// 		return InvalidSessionID, ErrInvalidScheme
// 	}

// 	err = store.Get(sessionID, sessionState)
// 	return sessionID, err
// }

// //EndSession extracts the SessionID from the request,
// //and deletes the associated data in the provided store, returning
// //the extracted SessionID.
// func EndSession(r *http.Request, signingKey string, store Store) (SessionID, error) {
// 	//TODO: get the SessionID from the request, and delete the
// 	//data associated with it in the store.
// 	sessionID, err := GetSessionID(r, signingKey)
// 	if err != nil {
// 		return InvalidSessionID, ErrStateNotFound
// 	}

// 	store.Delete(sessionID)
// 	return sessionID, err
// }
