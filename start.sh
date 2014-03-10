#!/bin/sh

cd /root/Hive/

forever -l router.log -p /var/log/hive/ start Router/server.js  &
forever -l redirect_port_80_to_beekeeper.log -p /var/log/hive/ start Router/redirect_port_80_to_beekeeper.js &
forever -l beekeeper.log -p /var/log/hive/ start Beekeeper/server.js &
forever -l honeycomb.log -p /var/log/hive/ start Honeycomb/server.js &
forever -l queen.log -p /var/log/hive/ start Queen/server.js &
