package users

import (
	"database/sql"
	"fmt"
)

//MySQLStore which holds a pointer to the database
type MySQLStore struct {
	Database *sql.DB
}

//Insert inserts the user into the database, and returns
//the newly-inserted User, complete with the DBMS-assigned ID
func (store *MySQLStore) Insert(user *User) (*User, error) {
	insq := "insert into Users(UserName) values (?)"
	res, err := store.Database.Exec(insq, user.UserName)
	if err != nil {
		return nil, err
	}
	//get the auto-assigned ID for the new row
	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}
	user.ID = id

	fmt.Println("We are inserting a user.")
	return user, nil
}
