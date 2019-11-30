package users

import (
	"fmt"
	"net/mail"
	"strings"
)

var bcryptCost = 13

// User represents a user account in the database
type User struct {
	ID        int64  `json:"userID"`
	Email     string `json:"-"` //never JSON encoded/decoded
	PassHash  []byte `json:"-"` //never JSON encoded/decoded
	UserName  string `json:"userName"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

//NewUser represents a new user signing up for an account
type NewUser struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
	UserName     string `json:"userName"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
}

// Credentials represents login information for users to enter
type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// CredentialsUpdates represents allowed updates to a user profile
type CredentialsUpdates struct {
	OldPassword string `json:"oldPass"`
	NewPassword string `json:"newPass"`
}

func (nu *NewUser) Validate() error {
	_, err := mail.ParseAddress(nu.Email)
	if err != nil {
		return fmt.Errorf("Not a valid email address")
	}
	if len(nu.Password) < 6 {
		return fmt.Errorf("Not a valid password")
	}
	if nu.Password != nu.PasswordConf {
		return fmt.Errorf("Password is incorrect")
	}
	if len(nu.UserName) == 0 || strings.Contains(nu.UserName, " ") {
		return fmt.Errorf("Invalid username length or contains space")
	}
	return nil
}
