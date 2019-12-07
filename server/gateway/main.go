package main

import (
	"database/sql"
	"fmt"
	"info441testrepo/server/gateway/handlers"
	"info441testrepo/server/gateway/models/users"
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	addr := os.Getenv("ADDR")
	if len(addr) == 0 {
		addr = ":443"
	}

	// If these environment variables are not set, write an error to
	// standard out and exit the process with a non-zero code.
	// Need to do Lets-Encrypt on docker servers.
	tlsKeyPath := os.Getenv("TLSKEY")
	tlsCertPath := os.Getenv("TLSCERT")
	if len(tlsKeyPath) < 0 || len(tlsCertPath) < 0 {
		log.Fatal("No environment variable found for either TLSKEY or TLSCERT")
	}

	// Creating a connection to the database
	// dsn := fmt.Sprintf(os.Getenv("DSN"), os.Getenv("MYSQL_ROOT_PASSWORD"))
	dsn := os.Getenv("DSN")

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("error opening database: %v\n", err)
		os.Exit(1)
	}

	defer db.Close()

	if err := db.Ping(); err != nil {
		fmt.Printf("error pinging database: %v\n", err)
	} else {
		fmt.Printf("successfully connected to MySQL database!\n")
	}

	userStore := &users.MySQLStore{
		Database: db,
	}

	mux := http.NewServeMux()

	ctx := &handlers.HandlerContext{
		UserStore:   userStore,
		SocketStore: handlers.CreateNotifier(),
	}

	// Microservices Messages in JS
	messADDR := os.Getenv("MESSAGESADDR")
	// messADDR := "127.0.0.1:4001"
	mux.Handle("/v1/messages", createReverseProxy(messADDR, ctx))
	mux.Handle("/v1/messages/", createReverseProxy(messADDR, ctx))

	// Users Handlers
	mux.HandleFunc("/v1/users", ctx.UsersHandler)

	// Connect to RabbitMQ
	handlers.ConnectToRabbitMQ(ctx)
	// Websockets
	mux.HandleFunc("/ws", ctx.WebSocketConnectionHandler)

	wrappedMux := handlers.Response(mux)

	// USE THIS ADDR FOR POSTMAN
	// log.Fatal(http.ListenAndServe(addr, wrappedMux))
	// log.Fatal(http.ListenAndServe(addr, mux))
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, wrappedMux))
}

// createReverseProxy allows us to make requests to microservices
func createReverseProxy(addresses string, context *handlers.HandlerContext) *httputil.ReverseProxy {
	// Spit the addresses
	splitAddresses := strings.Split(addresses, ",")
	addrCounter := 0
	director := func(req *http.Request) {
		req.URL.Scheme = "http"
		req.URL.Host = splitAddresses[addrCounter%len(splitAddresses)]
		addrCounter++
	}
	proxy := &httputil.ReverseProxy{Director: director}
	return proxy
}
