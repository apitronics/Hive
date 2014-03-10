#!/bin/sh

sudo forever -vdwf start Router/router.js &
sudo forever -vdwf start Router/redirect_port_80_to_beekeeper.js &
sudo forever -vdwf start Beekeeper/server.js &
sudo forever -vdwf start Honeycomb/server.js &
sudo forever -vdwf start Queen/server.js &
