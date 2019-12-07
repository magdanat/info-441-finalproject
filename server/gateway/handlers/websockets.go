package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"github.com/gorilla/websocket"
	"github.com/streadway/amqp"
)

// SocketStore A simple store to store all the connections
type SocketStore struct {
	Connections map[int64]*websocket.Conn
	lock        sync.Mutex
}

// Message This is a struct to read our message into
type Message struct {
	Type     string `json:"type"`
	Message  string `json:"message"`
	Username string `json:"username"`
}

// Control messages for websocket
const (
	// TextMessage denotes a text data message. The text message payload is
	// interpreted as UTF-8 encoded text data.
	TextMessage = 1

	// BinaryMessage denotes a binary data message.
	BinaryMessage = 2

	// CloseMessage denotes a close control message. The optional message
	// payload contains a numeric code and text. Use the FormatCloseMessage
	// function to format a close message payload.
	CloseMessage = 8

	// PingMessage denotes a ping control message. The optional message payload
	// is UTF-8 encoded text.
	PingMessage = 9

	// PongMessage denotes a pong control message. The optional message payload
	// is UTF-8 encoded text.
	PongMessage = 10
)

// InsertConnection Thread-safe method for inserting a connection
func (ctx *HandlerContext) InsertConnection(conn *websocket.Conn) int {
	ctx.SocketStore.lock.Lock()
	connID := len(ctx.SocketStore.Connections)
	// insert socket connection
	// s.Connections = append(s.Connections, conn)
	ctx.SocketStore.Connections[int64(connID)] = conn
	ctx.SocketStore.lock.Unlock()
	return connID
}

// RemoveConnection Thread-safe method for inserting a connection
func (ctx *HandlerContext) RemoveConnection(connID int64) {
	ctx.SocketStore.lock.Lock()
	// insert socket connection
	// ctx.SocketStore.Connections = append(ctx.SocketStore.Connections[:connID], ctx.SocketStore.Connections[connID+1:]...)
	delete(ctx.SocketStore.Connections, connID)
	ctx.SocketStore.lock.Unlock()
}

// WriteToAllConnections Simple method for writing a message to all live connections.
// In your homework, you will be writing a message to a subset of connections
// (if the message is intended for a private channel), or to all of them (if the message
// is posted on a public channel
func (ctx *HandlerContext) WriteToAllConnections(messageType int, data []byte) error {
	var writeError error

	for _, conn := range ctx.SocketStore.Connections {
		writeError = conn.WriteMessage(messageType, data)
		if writeError != nil {
			return writeError
		}
	}

	return nil
}

// This is a struct to read our message into
type msg struct {
	Message string `json:"message"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// This function's purpose is to reject websocket upgrade requests if the
		// origin of the websockete handshake request is coming from unknown domains.
		// This prevents some random domain from opening up a socket with your server.
		// TODO: make sure you modify this for your HW to check if r.Origin is your host
		return true
	},
}

// WebSocketConnectionHandler does...
func (ctx *HandlerContext) WebSocketConnectionHandler(w http.ResponseWriter, r *http.Request) {
	// handle the websocket handshake
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to open websocket connection", 401)
		return
	}

	// Insert our connection onto our datastructure for ongoing usage
	ctx.InsertConnection(conn)

	// Invoke a goroutine for handling control messages from this connection
	go (func(conn *websocket.Conn, connID int64) {
		defer conn.Close()
		defer ctx.RemoveConnection(connID)

		for {

			messageType, p, err := conn.ReadMessage()

			if messageType == TextMessage || messageType == BinaryMessage {
				fmt.Printf("Client says %v\n", p)
				fmt.Printf("Writing %s to all sockets\n", string(p))
				ctx.WriteToAllConnections(TextMessage, append([]byte("Hello from server: "), p...))
			} else if messageType == CloseMessage {
				fmt.Println("Close message received.")
				break
			} else if err != nil {
				fmt.Println("Error reading message.")
				fmt.Println(err)
				break
			}
			// ignore ping and pong messages
		}

		// })(conn, connID)
	})(conn, int64(len(ctx.SocketStore.Connections)+1))
}

//CreateNotifier creates a new notifier
func CreateNotifier() *SocketStore {
	return &SocketStore{
		Connections: make(map[int64]*websocket.Conn),
	}
}

// ConnectToRabbitMQ connects to a rabbitMQ server
// Reads in new RabbitMQ messages and writes their contents to the correct
// WebSocket connections.
func ConnectToRabbitMQ(ctx *HandlerContext) {
	// Connect to RabbitMQ server
	conn, err := amqp.Dial("amqp://rabbitmq:5672")
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	// Open a RabbitMQ channel
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open channel: %v", err)
	}

	// QueueDeclare declares a queue to hold messages and deliver to consumers
	q, err := ch.QueueDeclare(
		"events", // name
		true,     // durable
		false,    // delete when unused
		false,    // exclusive
		false,    // no-wait
		nil,      // arguments
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

	go ctx.SocketStore.processMessages(ctx, msgs)
}

// Function that processes the messages from the queue
func (s *SocketStore) processMessages(ctx *HandlerContext, msgs <-chan amqp.Delivery) {
	fmt.Println("I am processing messages")
	for message := range msgs {
		fmt.Println(message)
		messageStruct := &Message{}
		err := json.Unmarshal([]byte(message.Body), messageStruct)
		if err != nil {
			log.Fatalf("Error processing the message queue")
		}
		s.writeMessages(ctx, messageStruct)
	}
}

// Function to write messages to users
func (s *SocketStore) writeMessages(ctx *HandlerContext, message *Message) {
	data := message

	fmt.Println(ctx.SocketStore.Connections)
	for _, conn := range ctx.SocketStore.Connections {
		fmt.Println("About to send %m", data)
		if err := conn.WriteJSON(data); err != nil {
			fmt.Println("Error writing message to WebSocket connection.", err)
		}
	}
}

// Function for rabbitMQ to check if it should fail
func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}
