#!/bin/bash

echo "installing packages via pacman"
pacman -S erlang-nox couchdb avahi nss-mdns python2;

echo "creating a place for hive data on the sd card"
mkdir /var/lib/hive
/bin/mount /dev/mmcblk0 /var/lib/hive

echo "setting preferences"
rm /etc/couchdb/local.ini
cp ./etc/couchdb/local.ini /etc/couchdb/
rm /etc/hostname
ln ./etc/hostname /etc/hostname
rm /etc/dhcpcd.conf 
ln ./etc/dhcpcd.conf /etc/dhcpcd.conf
rm /var/spool/cron/root 
ln ./var/spool/cron/root /var/spool/cron/root

echo "setting up SD card"
cp ./systemd/sdcard.service /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl start sdcard.service

echo "enabling avahi and couchdb"
systemctl enable avahi-daemon.service
systemctl enable couchdb.service
systemctl start couchdb.service

echo "installing couchapp for node"
npm install -q -g couchapp > /dev/null

echo "creating hive services"
cp ./systemd/hive-beekeeper.service /etc/systemd/system/multi-user.target.wants/
cp ./systemd/hive-queen.service /etc/systemd/system/multi-user.target.wants/
cp ./systemd/hive-honeycomb.service /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl start hive-beekeeper.service
systemctl start hive-queen.service
systemctl start hive-honeycomb.service

#echo "restarting couchdb"
#couchdb -d;
#couchdb -b;

cp Settings.default.js ../Settings.js
echo "Script has finished. Edit ../Settings.js and then run ./install-hive.js"
