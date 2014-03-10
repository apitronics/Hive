#!/bin/sh

sudo forever start Router/router.js &
sudo forever start Router/redirect_port_80_to_beekeeper.js &
sudo forever start Beekeeper/server.js &
sudo forever start Honeycomb/server.js &
sudo forever start Queen/server.js &
