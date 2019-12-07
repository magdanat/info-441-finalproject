docker pull magdanat/finalapiserver

docker rm -f 441finalgateway

export TLSCERT=/etc/letsencrypt/live/fpapi.nathanmagdalera.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/fpapi.nathanmagdalera.me/privkey.pem
export DSN="root:password@tcp(441finaldb:3306)/db"
export MYSQL_ROOT_PASSWORD=password
export MESSAGESADDR=messagetest:80
#export RABBITADDR=rabbit:5672
#export RABBITNAME=MessageQ

docker run --network customNet -d --name 441finalgateway -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro -e TLSCERT=$TLSCERT -e DSN=$DSN -e MESSAGESADDR=$MESSAGESADDR -e TLSKEY=$TLSKEY -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD magdanat/finalapiserver
# docker run --network customNet -d --name 441gateway -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro -e RABBITADDR=$RABBITADDR -e RABBITNAME=$RABBITNAME -e TLSCERT=$TLSCERT -e DSN=$DSN -e SUMMARYADDR=$SUMMARYADDR -e MESSAGESADDR=$MESSAGESADDR -e TLSKEY=$TLSKEY -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD magdanat/apiserver

echo We have reached the end