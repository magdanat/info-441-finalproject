package users

//User represents a user account in the database
type User struct {
	ID        int64  `json:"id"`
	UserName  string `json:"userName"`
	// FirstName string `json:"firstName"`
	// LastName  string `json:"lastName"`
	// PhotoURL  string `json:"photoURL"`
}

//NewUser converts the NewUser to a User, setting the
//PhotoURL and PassHash fields appropriately
func (nu *User) NewUser() (*User, error) {
	usr := new(User)
	usr.UserName = nu.UserName
	return usr, nil
}