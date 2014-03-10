#!/bin/sh

sudo forever -l router.log -p /var/log/hive/ start Router/server.js  &
sudo forever -l redirect_port_80_to_beekeeper.log -p /var/log/hive/ start Router/redirect_port_80_to_beekeeper.js &
sudo forever -l beekeeper.log -p /var/log/hive/ start Beekeeper/server.js &
sudo forever -l honeycomb.log -p /var/log/hive/ start Honeycomb/server.js &
sudo forever -l queen.log -p /var/log/hive/ start Queen/server.js &
