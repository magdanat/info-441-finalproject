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

// Validate checks the entered user information and make sure
// it passes certain parameters.
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

//ToUser converts the NewUser to a User, setting the
//PhotoURL and PassHash fields appropriately
func (nu *NewUser) ToUser() (*User, error) {
	err := nu.Validate()
	if err != nil {
		return nil, err
	}

	usr := new(User)
	usr.Email = nu.Email
	usr.UserName = nu.UserName
	usr.FirstName = nu.FirstName
	usr.LastName = nu.LastName
	
	//TODO: also call .SetPassword() to set the PassHash
	//field of the User to a hash of the NewUser.Password

	err = usr.SetPassword(nu.Password)
	if err != nil {
		return nil, err
	}
	return usr, nil
}

//SetPassword hashes the password and stores it in the PassHash field
func (u *User) SetPassword(password string) error {
	//TODO: use the bcrypt package to generate a new hash of the password
	//https://godoc.org/golang.org/x/crypto/bcrypt
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return err
	}
	u.PassHash = hash
	return nil
}

//Authenticate compares the plaintext password against the stored hash
//and returns an error if they don't match, or nil if they do
func (u *User) Authenticate(password string) error {
	//TODO: use the bcrypt package to compare the supplied
	//password with the stored PassHash
	//https://godoc.org/golang.org/x/crypto/bcrypt
	if len(password) == 0 {
		return fmt.Errorf("Zero-length password")
	}
	err := bcrypt.CompareHashAndPassword(u.PassHash, []byte(password))
	if err != nil {
		return err
	}
	return nil
}
