package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"info-441-finalproject/servers/gateway/handlers"
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

	dsn := fmt.Sprintf(os.Getenv("DSN"), os.Getenv("MYSQL_ROOT_PASSWORD"))

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("error opening database: %v\n", err)
		os.Exit(1)
	}

	defer db.Close()
	
	context := &handlers.HandlerContext { 
		UserStore: userStore,
		Notifier: handlers.CreateNotifier(),
	}

	handlers.ConnectToRabbitMQ(context)
	mux := http.NewServerMux()

	// // Microservices in js
	// gamesADDR := os.Getenv("GAMESADDR")
	// mux.Handle("/v1/games", createReverseProxy(gamesADDR, context))
	// // Specific handler functions for games
	// mux.Handle("/v1/games/", createReverseProxy(gamesADDR, context))
	// mux.Handle("/v1/users", createReverseProxy(usersADDR, context))
	// mux.Handle("/v1/users/", createReverseProxy(usersADDR, context))

	// Handlerfunctions
	mux.HandleFunc("/v1/users", context.UsersHandler)

	messADDR := os.Getenv("MESSAGESADDR")
	mux.Handle("/v1/messages", createReverseProxy(messADDR, context))
	mux.Handle("/v1/messages/", createReverseProxy(messADDR, context))

	//Websockets
	mux.HandleFunc("/v1/ws", context.WebSocketConnectionHandler)

	wrappedMux := handlers.Response(mux)

	log.Printf("listening on %s...\n", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, wrappedMux))
}

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
