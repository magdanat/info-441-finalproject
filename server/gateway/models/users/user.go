package users

//User represents a user account in the database
type User struct {
	ID       int64  `json:"id"`
	UserName string `json:"userName"`
}

// NewUser converts the NewUser to a User.
func (nu *User) NewUser() (*User, error) {
	usr := new(User)
	usr.UserName = nu.UserName
	return usr, nil
}
