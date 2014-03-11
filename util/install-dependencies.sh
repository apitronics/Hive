#!/bin/bash

echo "installing packages via pacman"
pacman -S erlang-nox couchdb avahi nss-mdns python2 wget vim git;

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
#this might be temporary but avahi currently has problems
rm /etc/avahi/avahi-daemon.conf
ln ./etc/avahi/avahi-daemon.conf /etc/avahi/

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

(cd.. && npm install)

echo "creating hive services"
node ../install.js
cp ./systemd/hive.service /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl start hive.service


echo "installing updater"
(cd /root/ && git clone https://github.com/apitronics/Hive-Updater.git)
mv /root/Hive-Updater /root/.Hive-Updater/
/root/.Hive-updater/install.sh
(cd /root/.Hive-updater/ && npm install)


cp Settings.default.js ../Settings.js
echo "Script has finished. Edit ../Settings.js and then run ./install-hive.js"
