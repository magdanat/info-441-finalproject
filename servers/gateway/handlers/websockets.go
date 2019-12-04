package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
)

// Notifier struct
type Notifier struct {
	connections map[int64]*websocket.Conn
	mx          sync.Mutex
}

// This is a struct to read our message into
type msg struct {
	Type    string  `json:"type"`
	Message string  `json:"message"`
	UserIDs []int64 `json:"userIDs"`
	Username string `json:"username"`
	Sender int64 `json:"sender"`
}

// InsertConnection is a thread-safe method for inserting a connection
func (ctx *HandlerContext) InsertConnection(connID int64, conn *websocket.Conn) {
	ctx.Notifier.mx.Lock()
	// insert socket connection
	ctx.Notifier.connections[int64(connID)] = conn
	ctx.Notifier.mx.Unlock()
}

// RemoveConnection is a thread-safe method for removing a connection
func (ctx *HandlerContext) RemoveConnection(connID int64) {
	ctx.Notifier.mx.Lock()
	ctx.Notifier.connections[connID].Close()
	delete(ctx.Notifier.connections, connID)
	ctx.Notifier.mx.Unlock()
}

//TODO: add a handler that upgrades clients to a WebSocket connection
//and adds that to a list of WebSockets to notify when events are
//read from the RabbitMQ server. Remember to synchronize changes
//to this list, as handlers are called concurrently from multiple
//goroutines.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		if r.Header.Get("Origin") != "https://nathanmagdalera.me" {
			return false
		}
		return true
	},
}

// WebSocketConnectionHandler upgrades handler functions to handle websockets
func (ctx *HandlerContext) WebSocketConnectionHandler(w http.ResponseWriter, r *http.Request) {

	// Checks if the request is coming from domains different from our server
	if upgrader.CheckOrigin(r) {
		// Creates a permanent connection as long as the client is running and the
		// server is running.
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			http.Error(w, "Failed to open websocket connection", 401)
		}

		// Inserts our connection into our datastructure for ongoing usage
		ctx.InsertConnection(int64(len(ctx.Notifier.connections) + 1), conn)

		go (func(conn *websocket.Conn, connID int64) {
			for { // infinite loop
				m := msg{}

				err := conn.ReadJSON(&m)

				// If an error is received while reading incoming messages, closes the Websocket and removes
				// it from the list
				if err != nil {
					fmt.Println("Error reading json.", err)
					// Close websocket
					conn.Close()
					// Remove from list
					ctx.RemoveConnection(int64(len(ctx.Notifier.connections) + 1))
					break
				}

				if err = conn.WriteJSON(m); err != nil {
					fmt.Println(err)
				}
			}
		})(conn, int64(len(ctx.Notifier.connections) + 1))

	} else {
		http.Error(w, "Websocket Connection", 403)
		return
	}
}

//CreateNotifier creates a new notifier
func CreateNotifier() *Notifier {
	return &Notifier{
		connections: make(map[int64]*websocket.Conn),
	}
}

//ConnectToRabbitMQ connects to the RabbitMQ Container
// Need to pass in the address via environment variable
// This is the consumer. Queue is durable and auto deletes acks.
func ConnectToRabbitMQ(ctx *HandlerContext) {
	rabbitADDR := "amqp://" + os.Getenv("RABBITADDR")
	rabbitNAME := os.Getenv("RABBITNAME")
	conn, err := amqp.Dial(rabbitADDR)
	failOnError(err, "Failed to connect to RabbitMQ")
	if err == nil {
		log.Printf("Successfully connected to rabbitMQ server")
	}
	// Creates a channel where most of the API behavior happens
	ch, err := conn.Channel()
	// QueueDeclare declares a queue to hold messages and deliver to consumers
	q, err := ch.QueueDeclare(
		rabbitNAME,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	failOnError(err, "Failed to create queue")
	// Consume() Starts delivering ourselves messages from the queue
	// by pushing messages asyncrhonously
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	// Proccess messages from the queue
	// through a go routine
	go ctx.Notifier.processMessages(msgs)

}

// Function to write messages to users
func (n *Notifier) writeMessages(message *msg) {
	if message.UserIDs == nil || len(message.UserIDs) < 1 {
		for _, conn := range n.connections {
			err := conn.WriteJSON(message)
			if err != nil {
				log.Fatalf("Could not send message")
			}
		}
	} else {
		for id := range message.UserIDs {
			connection := n.connections[int64(id)]
			if connection != nil {
				err := connection.WriteJSON(message)
				if err != nil {
					log.Fatalf("Could not send message")
				}
			}
		}
	}
}

// Function that processes the messages from the queue
func (n *Notifier) processMessages(msgs <-chan amqp.Delivery) {
	fmt.Printf("recieved a message")
	for message := range msgs {
		messageStruct := &msg{}
		err := json.Unmarshal([]byte(message.Body), messageStruct)
		if err != nil {
			log.Fatalf("Error processing the message queue")
		}
		n.writeMessages(messageStruct)
	}
}

// Function for rabbitMQ to check if it should fail
func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}