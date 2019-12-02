# Calls the build script
sh ./build.sh
# push first
docker login
# push to docker HUB
docker push magdanat/gamems

# this IP address is for the API server
# need to update IP address
# ssh -oStrictHostKeyChecking=no root@165.227.2.169 'bash -s' < upgrade-service.sh