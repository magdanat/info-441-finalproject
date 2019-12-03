package users

import (
	"database/sql"
)

// MySQLStore gives users access to database
type MySQLStore struct {
	Database *sql.DB
}

//GetByID returns the User with the given ID
func (store *MySQLStore) GetByID(id int64) (*User, error) {
	foundUser := &User{}
	row := store.Database.QueryRow("select * from Users where id=?", id)
	if err := row.Scan(&foundUser.ID, &foundUser.Email, &foundUser.PassHash, &foundUser.UserName, &foundUser.FirstName, &foundUser.LastName); err != nil {
		return nil, err
	}
	return foundUser, nil
}

//Insert inserts the user into the database, and returns
//the newly-inserted User, complete with the DBMS-assigned ID
func (store *MySQLStore) Insert(user *User) (*User, error) {
	insq := "insert into Users(user_name) values (?)"
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

// //Update applies UserUpdates to the given user ID
// //and returns the newly-updated user
// func (store *MySQLStore) Update(id int64, updates *Updates) (*User, error) {
// 	updt := "update Users set first_name=?, last_name=? where id=?"
// 	_, err := store.Database.Exec(updt, updates.FirstName, updates.LastName, id)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return store.GetByID(id)
// }

// //GetByEmail returns the User with the given email
// func (store *MySQLStore) GetByEmail(email string) (*User, error) {
// 	foundUser := &User{}
// 	row := store.Database.QueryRow("select * from Users where email=?", email)
// 	if err := row.Scan(&foundUser.ID, &foundUser.Email, &foundUser.PassHash, &foundUser.UserName, &foundUser.FirstName, &foundUser.LastName); err != nil {
// 		return nil, err
// 	}
// 	return foundUser, nil
// }
