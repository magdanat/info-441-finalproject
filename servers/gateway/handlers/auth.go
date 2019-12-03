package handlers

import (
	"encoding/json"
	"info-441-finalproject/servers/gateway/models/users"
	"info-441-finalproject/servers/gateway/sessions"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"
)

//UsersHandler handles requests to create new user accounts
func (ctx) UsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		contentType := r.Header.Get("Content-Type")
		if strings.HasPrefix(contentType, "application/json") {

			newUser := &users.User{}

			// Decode newUser
			json.NewDecoder(r.Body).Decode(newUser)

			// Insert user into the database.
			_, err := ctx.UserStore.Insert(newUser)

			if err != nil {
				http.Error(w, "Internal server error", http.StatusBadRequest)
			}

			w.WriteHeader(http.StatusCreated)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)

		} else {
			http.Error(w, "Request body must be JSON", http.StatusUnsupportedMediaType)
			return
		}
	} else {
		http.Error(w, "Wrong Status Method", http.StatusMethodNotAllowed)
		return
	}
}

// // SpecificUserHandler handles requests for a specific user
// func (ctx *HandlerContext) SpecificUserHandler(w http.ResponseWriter, r *http.Request) {
// 	currentState := &SessionState{}
// 	sessionID, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, currentState)
// 	if sessionID == sessions.InvalidSessionID || err != nil {
// 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 		return
// 	}

// 	// Getting the userID based on the the handler context and request
// 	currentUserID := currentState.User.ID

// 	// Getting the userID based on the URL
// 	urlID := path.Base(r.URL.Path)
// 	requestedUserID := currentUserID
// 	if urlID != "me" {
// 		requestedUserID, err = strconv.ParseInt(urlID, 10, 64)
// 		if err != nil {
// 			http.Error(w, "Invalid ID", http.StatusBadRequest)
// 		}
// 	}

// 	if r.Method == http.MethodGet {
// 		user, err := ctx.UserStore.GetByID(requestedUserID)
// 		if err != nil {
// 			http.Error(w, "Requested ID not found", http.StatusNotFound)
// 			return
// 		}

// 		w.Header().Set("Content-Type", "application/json")
// 		w.WriteHeader(http.StatusOK)
// 		json.NewEncoder(w).Encode(user)

// 	} else if r.Method == http.MethodPatch {
// 		if requestedUserID != currentUserID {
// 			http.Error(w, "Forbidden", http.StatusForbidden)
// 			return
// 		}
// 		contentType := r.Header.Get("Content-Type")
// 		if strings.HasPrefix(contentType, "application/json") {
// 			userUpdate := &users.Updates{}
// 			json.NewDecoder(r.Body).Decode(userUpdate)

// 			// Apply updates to user if valid
// 			err := currentState.User.ApplyUpdates(userUpdate)
// 			if err != nil {
// 				http.Error(w, "Invalid Update Data", http.StatusBadRequest)
// 				return
// 			}

// 			// grab the updated user profile
// 			user, _ := ctx.UserStore.GetByID(currentUserID)

// 			w.Header().Set("Content-Type", "application/json")
// 			w.WriteHeader(http.StatusOK)
// 			json.NewEncoder(w).Encode(user)

// 		} else {
// 			http.Error(w, "Unsupported Media Type", http.StatusUnsupportedMediaType)
// 			return
// 		}
// 	} else {
// 		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
// 		return
// 	}
// }

// // SessionsHandler handles requests for the "sessions" resource;
// // allows clients to begin a new session using an existing user's credentials.
// func (ctx *HandlerContext) SessionsHandler(w http.ResponseWriter, r *http.Request) {
// 	if r.Method == http.MethodPost {
// 		contentType := r.Header.Get("Content-Type")
// 		if strings.HasPrefix(contentType, "application/json") {
// 			userCredentials := &users.Credentials{}

// 			// Decoding credentials
// 			json.NewDecoder(r.Body).Decode(userCredentials)

// 			// Finding the user by email
// 			user, err := ctx.UserStore.GetByEmail(userCredentials.Email)
// 			if err != nil {
// 				time.Sleep(2 * time.Second)
// 				http.Error(w, "Not Found", http.StatusNotFound)
// 				return
// 			}

// 			// Authenticate the user and check if valid
// 			err = user.Authenticate(userCredentials.Password)
// 			if err != nil {
// 				http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
// 				return
// 			}

// 			// Set SessionState
// 			currentSession := &SessionState{
// 				TimeBegan: time.Now(),
// 				User:      user,
// 			}

// 			// log all user sign-in attempts
// 			// grab IP address
// 			ips := r.Header.Get("X-Forwarded-For")
// 			ip := ""
// 			if ips != "" {
// 				listIPS := strings.Split(ips, ", ")
// 				ip = string(listIPS[0])
// 			} else {
// 				ip = r.RemoteAddr
// 			}

// 			err = ctx.UserStore.InsertSignInRecord(currentSession.User, currentSession.TimeBegan, ip)
// 			if err != nil {
// 				// what do?
// 			}

// 			// Actually begin the session
// 			sessions.BeginSession(ctx.SigningKey, ctx.SessionStore, currentSession, w)

// 			// Success!
// 			w.Header().Set("Content-Type", "application/json")
// 			w.WriteHeader(http.StatusCreated)
// 			json.NewEncoder(w).Encode(user)
// 		} else {
// 			http.Error(w, "Unsupported Media Type", http.StatusUnsupportedMediaType)
// 			return
// 		}
// 	} else {
// 		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
// 		return
// 	}
// }

// // SpecificSessionHandler handles requests related to a specific authenticated session
// // Allows current user to end session
// func (ctx *HandlerContext) SpecificSessionHandler(w http.ResponseWriter, r *http.Request) {
// 	if r.Method == http.MethodDelete {
// 		// Get last path in URL
// 		lastPath := path.Base(r.URL.Path)

// 		// Check last path
// 		if lastPath != "mine" {
// 			http.Error(w, "Forbidden", http.StatusForbidden)
// 			return
// 		}

// 		// End session
// 		_, err := sessions.EndSession(r, ctx.SigningKey, ctx.SessionStore)

// 		// Check error when ending session
// 		if err != nil {
// 			http.Error(w, "Unexpected Error", http.StatusInternalServerError)
// 			return
// 		}

// 		w.Write([]byte("signed out"))
// 	} else {
// 		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
// 		return
// 	}
// }
