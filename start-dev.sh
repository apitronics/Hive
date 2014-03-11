#!/bin/sh

sudo forever -dwf start Router/server.js &
sudo forever -dwf start Router/redirect_port_80_to_beekeeper.js &
sudo forever -dwf start Beekeeper/server.js &
sudo forever -dwf start Honeycomb/server.js &
sudo forever -dwf start Queen/server.js &
sudo couchapp sync Beekeeper/couchapp.js http://admin:password@hive.local:5984/apps &
