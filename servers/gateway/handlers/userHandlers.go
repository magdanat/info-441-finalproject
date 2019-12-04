package handlers

// handle creation of user and input into database

import (
	"encoding/json"
	"info-441-finalproject/servers/gateway/models/users"
	"net/http"
	"strings"
)

//UsersHandler handles requests to create new user accounts
// only has one thing in body -- username
func (ctx *HandlerContext) UsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		contentType := r.Header.Get("Content-Type")
		if strings.HasPrefix(contentType, "application/json") {

			newUser := &users.User{}

			// Decode newUser
			json.NewDecoder(r.Body).Decode(newUser)

			// Adding new user to database
			userObj, err := ctx.UserStore.Insert(newUser)
			if(err != nil) {
				http.Error(w, "Could not insert user", http.StatusMethodNotAllowed)
			}

			w.WriteHeader(http.StatusCreated)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(userObj)
		} else {
			http.Error(w, "Request body must be JSON", http.StatusUnsupportedMediaType)
			return
		}
	} else {
		http.Error(w, "Wrong Status Method", http.StatusMethodNotAllowed)
		return
	}
}
