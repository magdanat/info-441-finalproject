package users

import (
	"errors"
)

//ErrUserNotFound is returned when the user can't be found
var ErrUserNotFound = errors.New("user not found")

//Store represents a store for Users
type Store interface {
	//Insert inserts the user into the database, and returns
	//the newly-inserted User, complete with the DBMS-assigned ID
	Insert(user *User) (*User, error)
}
