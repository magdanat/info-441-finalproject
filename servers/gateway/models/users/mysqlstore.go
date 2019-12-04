package users

import (
	"database/sql"
)

//MySQLStore which holds a pointer to the database
type MySQLStore struct {
	Database *sql.DB
}

//GetByID returns the User with the given ID
func (store *MySQLStore) GetByID(id int64) (*User, error) {
	foundUser := &User{}
	row := store.Database.QueryRow("select * from Users where id=?", id)
	if err := row.Scan(&foundUser.ID, &foundUser.UserName); err != nil {
		return nil, err
	}
	return foundUser, nil
}

//GetByUserName returns the User with the given Username
func (store *MySQLStore) GetByUserName(username string) (*User, error) {
	foundUser := &User{}
	row := store.Database.QueryRow("select * from Users where username=?", username)
	if err := row.Scan(&foundUser.ID, &foundUser.UserName); err != nil {
		return nil, err
	}
	return foundUser, nil
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
	return user, nil
}

//Delete deletes the user with the given ID
//May need to switch this to username
func (store *MySQLStore) Delete(id int64) error {
	del := "delete from Users where id = ?"
	_, err := store.Database.Exec(del, id)
	if err != nil {
		return err
	}
	return nil
}
