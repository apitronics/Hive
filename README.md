# Install
```
npm install
npm install -g couchapp
npm install -g forever
cp ./util/Settings.default.js ./Settings.js
./install.js
```
Unless you are installing on the Arch linux build for Hive in the /root/ folder, you'll need to modify some of the settings in Settings.js. 


# Run
For normal operations, as root user run `./start.sh`, for developer mode with lots of terminal output and automatic restart on code change, use `sudo ./start-dev.sh`. Running `start-dev.sh` on systems without `sudo` does not work, you can modify to fit your needs. Note, We have to be root to take port 80.


# Verifying install
```
./status.sh
./util/install-test-bee
./util/install-test-data
```
The `./status.sh` command will show you all the processes running. Then install a test bee, some test data, and check port 80 in a browser to see the test bee and associated data to verify everything is working as expected.  Note, if you select a large range at this point, the HoneyJar worker has not been run from the Beekeeper process so no data will show up.  Watch the logging from Beekeeper to see when that process has finished or `./stop.sh` and then `./start.sh` to get it going. Note, when the Beekeeper process starts, it's tasks are staggered as to when they begin so the Honey Jars worker will not start right away.


# Info on Ports
- Queen (port 125) : For registering and setting up new Bees.
- Honeycomb (port 126) : Where Bees send Honey packets for parsing and storing.
- Beekeeper (port 8800, 80, and 8000) : The Web UI for human users where they can view and manipulate the the GroundHive. Port 80 forwards to 8000 where 8800 (Beekeeper's Web UI) and 5984 (CouchDB) are routed together so that browsers can access them all without running into the Cross Origin Request limitation in Web Browsers. If the client device does not have mDNS support, port 80 forwards the client to the `:5984/apps/_design/beekeeper/index.html`, the CouchApp version of the Beekeeper app.

# Clearing out user data from Hive
```
systemctl stop couchdb.service
rm /var/lib/couchdb/*
systemctl start couchdb.service
/root/Hive/install.js
```

