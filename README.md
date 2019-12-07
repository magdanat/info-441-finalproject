# UW Scribble

## Project Description

**UW Scribble** is intended to be an online multiplayer drawing board where users will be able to share a global chat with eachother while drawing. In terms of drawing, the user will be able to cutomize the color and thickness of the brush. As well as delte, undo, save, or clear their drawing board. In terms of messaging, there will be a global chat which users can sent messages into which will then be relayed to all the other current users.

Our target audience for our project is mainly UW students who want to take a break from studying by drawing and chatting with people. We envision it will be UW students using our application because our project is intended to be UW themed.

Our audience would want to use our application primarily for fun. Because our project is a game, players will want to get an enjoyable experience that they can share with whomever they are playing with.

As developers we want to build this application because we think this will be a great way to encompass all the skills we have learned in class so far. We particularly chose to create a application because of how the flow of data is going to be handled between users. The data flow for messaging will involve both storing messages in the database and utilizing websockets and **rabbitMQ** in order to relay real-time messages. Our implementation will consist of **React** for our frontend, Google's **Go** for our backend, and finally **MySQL** for our backend database with the addition of **websockets**, **RabbitMQ**, and other libraries.



## Technical Description

| Priority | User | Description |\
| P0 | As a player | I want to be able to sign up with a username of my choice|\
| P1 | As a player | I want to be able to be able to draw |\
| P2 | As a player | I want to be able to send and view messages to/from other people |\
| P3 | As a drawer | I want to be able to customize/erase/restart my drawing if I make a mistake |\

Our minimal viable product would require P0, P1, P2, and P3.

**Technical Implementation:**

* **P0**: In order to allow players to create a new account, we need to have a sign up screen before entering the actual drawing/chat channel.
  * This will require a client side page which we will create using **HTML, CSS and JavaScript**. This will also require a database that stores user information. We will create our database in a **Docker container and host it in a droplet on Digital Ocean**.
* **P1**: In order to allow a player to draw, we need to have a drawing board. This drawing board will be only available on the clientside.
  * This will require **React** in order to create the drawing board and user UI.
* **P2**: In order to allow users to send and receive messages from users, we will need to implement a global chat for all users.
  * This will require React in order to display the messages. Users sending messages will use our **MySQL** database, **Webscokets**, and **RabbitMQ** to send and store real-time messages;
* **P3**: In order to allow users to customize, erase, or restart their drawing, we are going to need to implement a vareity of UI option for the drawing board
  * This will involve a lot of work on the frontend using different **React** libraries 

### New API Design

#### Endpoints

* **‘/v1/users**
  * `POST`: Add new player
    * `201`: `application/json`. Successfully posts new player
    * `401`: Cannot verify player/ID
    * `500`: Internal server error
* **‘/v1/messages**
  * `GET`: Gets the last 50 most recent messages
    * `200`: Successfully retrieves messagesd
    * `500`: Server Error
  * `POST`: Create and send new message
    * `201`: Successfully posts new messaged
    * `500`: Server Error

#### Models

For our data store we will be utilizing **MySQL** DB.

#### Users

‘user’: users will be represented in the database.

```go
{
     “UserId”: “id_value”,
     “UserName”: “username_value”
}
```


#### Messages

‘message’: Message will represent a message that is sent in a chat room in each game. Clients send messages within the global chat to be received by all players

```go
 {
     “MessageID”: “id_value”,
     “UserId”: “user_id”,
     “MessageBody”: “message”,
}
```
