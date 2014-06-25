#!/bin/bash
cp /root/Hive/util/.bash_profile /root/
cp /root/Hive/util/.vimrc /root/

echo "installing packages via apt-get"
apt-get install couchdb python-requests vim git
echo "needs to manually install python-serial"

echo "installing packages via setuptools"
wget https://bootstrap.pypa.io/ez_setup.py -O - | python
easy_install --upgrade pytz
easy_install --upgrade six

echo "creating a place for hive data on the sd card"
mkdir /var/lib/couchdb
chown couchdb /var/lib/couchdb/
chmod 755 /var/lib/couchdb

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

#this might be temporary but avahi currently has problems
#rm /etc/avahi/avahi-daemon.conf
#ln ./etc/avahi/avahi-daemon.conf /etc/avahi/

systemctl enable cronie
systemctl start cronie
rm /var/spool/cron/root
crontab ./var/spool/cron/root #cron doesn't like links

echo "enabling avahi and couchdb"
systemctl enable avahi-daemon.service
systemctl enable couchdb.service
systemctl start couchdb.service

echo "installing couchapp for node"
npm install -q -g couchapp > /dev/null
npm install -g forever

(cd /root/Hive && npm install)

echo "creating hive services"
mkdir /var/log/hive
node /root/Hive/install.js
cp ./systemd/* /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload

echo "installing updater"
(cd /root/ && git clone https://github.com/apitronics/Hive-Updater.git)
mv /root/Hive-Updater /root/.Hive-Updater/
/root/.Hive-Updater/util/install.sh
(cd /root/.Hive-Updater/ && npm install)

cp Settings.default.js ../Settings.js

echo "initializing database"
(node /root/Hive/install.js)

echo "launching services"
(/root/Hive/start.sh)
