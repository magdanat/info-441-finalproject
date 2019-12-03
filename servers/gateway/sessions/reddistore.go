// package sessions

// import (
// 	"encoding/json"
// 	"time"

// 	"github.com/go-redis/redis"
// )

// //RedisStore represents a session.Store backed by redis.
// type RedisStore struct {
// 	//Redis client used to talk to redis server.
// 	Client *redis.Client
// 	//Used for key expiry time on redis.
// 	SessionDuration time.Duration
// }

// //NewRedisStore constructs a new RedisStore
// func NewRedisStore(client *redis.Client, sessionDuration time.Duration) *RedisStore {
// 	//initialize and return a new RedisStore struct
// 	newRedisStore := new(RedisStore)
// 	newRedisStore.Client = client
// 	newRedisStore.SessionDuration = sessionDuration
// 	return newRedisStore
// }

// //Store implementation

// //Save saves the provided `sessionState` and associated SessionID to the store.
// //The `sessionState` parameter is typically a pointer to a struct containing
// //all the data you want to associated with the given SessionID.
// func (rs *RedisStore) Save(sid SessionID, sessionState interface{}) error {
// 	j, err := json.Marshal(sessionState)
// 	if nil != err {
// 		return err
// 	}
// 	key := sid.getRedisKey()

// 	// double check time expiration
// 	// Setting expiration to 0 makes it last forever
// 	rs.Client.Set(key, j, 0)
// 	return nil
// }

// //Get populates `sessionState` with the data previously saved
// //for the given SessionID
// func (rs *RedisStore) Get(sid SessionID, sessionState interface{}) error {
// 	key := sid.getRedisKey()
// 	j := rs.Client.Get(key)
// 	jBytes, err := j.Bytes()
// 	if err != nil {
// 		return ErrStateNotFound
// 	}
// 	json.Unmarshal(jBytes, sessionState)
// 	// Setting expiration to 0 makes it last forever
// 	rs.Client.Set(key, j, 0)
// 	return json.Unmarshal(jBytes, sessionState)
// }

// //Delete deletes all state data associated with the SessionID from the store.
// func (rs *RedisStore) Delete(sid SessionID) error {
// 	rs.Client.Del(sid.getRedisKey())
// 	return nil
// }

// //getRedisKey() returns the redis key to use for the SessionID
// func (sid SessionID) getRedisKey() string {
// 	//convert the SessionID to a string and add the prefix "sid:" to keep
// 	//SessionID keys separate from other keys that might end up in this
// 	//redis instance
// 	return "sid:" + sid.String()
// }
