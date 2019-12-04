# Calls the build script
sh ./build.sh
# push first
docker login
# push to docker HUB
docker push magdanat/messagingms

# this IP address is for the API server
ssh -oStrictHostKeyChecking=no root@165.227.2.169 'bash -s' < upgrade-server.sh