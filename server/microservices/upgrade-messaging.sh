# pull most current version of container image
docker pull magdanat/messagingms

# stop and remove current container instance
docker rm -f messagetest

export MYSQL_ROOT_PASSWORD=password
export MYSQL_DB=db
export MYSQL_ADDR=441finaldb
export RABBITADDR=rabbitmq:5672
# export RABBITNAME=MessageQ
export DSN="root:%s@tcp(441finaldb:3306)/db"

# run instance of newly-updated container image
docker run -d --network customNet --name messagetest -e DSN=$DSN -e RABBITADDR=$RABBITADDR -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD -e MYSQL_DB=$MYSQL_DB -e MYSQL_ADDR=$MYSQL_ADDR magdanat/messagingms

# -e RABBITADDR=$RABBITADDR -e RABBITNAME=$RABBITNAME
