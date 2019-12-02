# Calls the build script
sh ./build.sh
# push first
docker login
docker push magdanat/finaldatabase

# need to change root IP address to new digital ocean droplet
#ssh -oStrictHostKeyChecking=no root@165.227.2.169 'bash -s' < ./upgrade-database.sh
