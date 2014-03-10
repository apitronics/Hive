#!/bin/bash

echo "installing packages via pacman"
pacman -S erlang-nox couchdb avahi nss-mdns python2 wget;

echo "creating a place for hive data on the sd card"
mkdir /var/lib/couchdb
cp ./systemd/sdcard.service /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl start sdcard.service

echo "setting preferences"
rm /etc/couchdb/local.ini
cp ./etc/couchdb/local.ini /etc/couchdb/
rm /etc/hostname
ln ./etc/hostname /etc/hostname
rm /etc/dhcpcd.conf 
ln ./etc/dhcpcd.conf /etc/dhcpcd.conf
rm /var/spool/cron/root 
ln ./var/spool/cron/root /var/spool/cron/root

echo "AVAHI SETTINGS NEED TO BE FIXED"
#FIX AVAHI SETTINGS
#Go edit /etc/avahi/avahi-daemon.conf
#Find the line:
#"#disallow-other-stacks=no"
#and change to
#"disallow-other-stacks=yes"

echo "enabling avahi and couchdb"
#give file ownnership to couchdb and give it the permission it likes
chown couchdb /var/lib/couchdb/
chmod 755 /var/lib/couchdb

systemctl enable avahi-daemon.service
systemctl enable couchdb.service
systemctl start couchdb.service

echo "installing couchapp for node"
npm install -q -g couchapp > /dev/null
npm install -g forever

echo "creating hive services"

cp ./systemd/hive.service /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl start hive.service

# "npm install" all over (even / and even /utils)

#echo "restarting couchdb"
#couchdb -d;
#couchdb -b;

cp Settings.default.js ../Settings.js
echo "Script has finished. Edit ../Settings.js and then run ./install-hive.js"
