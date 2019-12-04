package handlers

// handle creation of user and input into database

import (
	"info-441-finalproject/servers/gateway/models/users"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

//UsersHandler handles requests to create new user accounts
func (ctx *HandlerContext) UsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		contentType := r.Header.Get("Content-Type")
		if strings.HasPrefix(contentType, "application/json") {

			newUser := &users.NewUser{}

			// Decode newUser
			json.NewDecoder(r.Body).Decode(newUser)

			// Ensure the data is valid and create a new user account in the database.
			err := newUser.Validate()
			if err != nil {
				http.Error(w, "Invalid new user", http.StatusBadRequest)
				return
			}

			// Adding new user to database
			user, _ := newUser.ToUser()

			// New session for the user
			currentSession := &SessionState{
				TimeBegan: time.Now(),
				User:      user,
			}

			// Begin a new session for the new user.
			sessions.BeginSession(ctx.SigningKey, ctx.SessionStore, currentSession, w)

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