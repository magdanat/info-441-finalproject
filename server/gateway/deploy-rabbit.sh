# docker run -d --name rabbitmq --network customNet rabbitmq:3-management
# run on VM
docker run -d --network customNet --name rabbitmq -p 5672:5672 rabbitmq:3-management