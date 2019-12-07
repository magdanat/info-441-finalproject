docker pull magdanat/finalclient
docker rm -f 441finalclient

export TLSCERT=/etc/letsencrypt/live/fp.nathanmagdalera.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/fp.nathanmagdalera.me/privkey.pem

docker run --name 441finalclient -d -p 80:80 -p 443:443 -v ~/etc/letsencrypt:/etc/letsencrypt:ro -e TLSCERT=$TLSCERT -e TLSKEY=$TLSKEY magdanat/finalclient
