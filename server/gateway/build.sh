# build the go executable for linux
GOOS=linux go build

# build docker container
docker build -t magdanat/finalapiserver .

go clean