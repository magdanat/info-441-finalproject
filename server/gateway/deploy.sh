# Calls the build script
sh ./build.sh
# push first
docker login
docker push magdanat/finalapiserver

# ssh into docker container, run upgrade-server script
# need to update root IP address to match new DO droplet
ssh -oStrictHostKeyChecking=no root@138.68.240.198 'bash -s' < ./upgrade-server.sh