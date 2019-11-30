package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	addr := os.Getenv("ADDR")
	if len(addr) == 0 {
		addr = ":443"
	}

	// If these environment variables are not set, write an error to
	// standard out and exit the process with a non-zero code.
	tlsKeyPath := os.Getenv("TLSKEY")
	tlsCertPath := os.Getenv("TLSCERT")

	if len(tlsKeyPath) < 0 || len(tlsCertPath) < 0 {
		log.Fatal("No environment variable found for eitherTLSKEY or TLSCERT")
	}

	sessionKey := os.Getenv("SESSIONKEY")
	redisAddr := os.Getenv("REDISADDR")

	// Create a new redis client
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "",
		DB:       0,
	})

	dsn := fmt.Sprintf(os.Getenv("DSN"), os.Getenv("MYSQL_ROOT_PASSWORD"))

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("error opening database: %v\n", err)
		os.Exit(1)
	}

	defer db.Close()
}
