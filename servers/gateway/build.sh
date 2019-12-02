# build the go executable for linux
GOOS=linux go build

# docker network create architecture

# build docker container
docker build -t magdanat/finalapiserver .

go clean