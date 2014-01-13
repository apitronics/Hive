#MAKE SURE PACMAN -SYU works

#MAKE SURE SD CARD IS FORMATTED AND MOUNTED BEFORE DOING THIS!!
mkdir /var/lib/couchdb
mount /dev/mmcblk0 /var/lib/couchdb

echo "installing packages via pacman"
pacman -S erlang-nox couchdb avahi nss-mdns python2

#i wish i could link this one
rm /etc/couchdb/local.ini
cp ./etc/couchdb/local.ini /etc/couchdb/
rm /etc/hostname
ln ./etc/hostname /etc/hostname
rm /etc/dhcpcd.conf 
ln ./etc/dhcpcd.conf /etc/dhcpcd.conf


rm /var/spool/cron/root 
ln ./var/spool/cron/root /var/spool/cron/root

echo "enabling avahi and couchdb"
systemctl enable avahi-daemon.service
systemctl enable couchdb.service

systemctl start couchdb.service

echo "installing python modules"
echo "	pyserial"
wget http://pypi.python.org/packages/source/p/pyserial/pyserial-2.6.tar.gz
tar -xvzf pyserial-2.6.tar.gz > /dev/null
cd pyserial-2.6
python setup.py install > /dev/null
cd ..
rm -r pyserial-2.6*

echo "	couchdb-python"
wget https://pypi.python.org/packages/source/C/CouchDB/CouchDB-0.9.tar.gz
tar -xvzf CouchDB-0.9.tar.gz > /dev/null
cd CouchDB-0.9 
python setup.py install > /dev/null
cd ..
rm -r CouchDB-0.9*

wget https://pypi.python.org/packages/source/s/simplejson/simplejson-3.3.0.tar.gz
tar -xvzf simplejson-3.3.0.tar.gz > /dev/null
cd simplejson-3.3.0
python setup.py install > /dev/null
cd ..
rm -r simplejson-3.3.0*

echo "creating databases and sensor definitions"
python ~/Hive/networkController/config/createDB.py

echo "installing couchapp for node"
npm install -q -g couchapp > /dev/null
echo "creating views"
couchapp push ../viewController/CouchViews/hive_config_api/app.js  http://127.0.0.1:5984/config/

echo "creating hive services"
cp ./systemd/apitronicsnetwork.service /etc/systemd/system/multi-user.target.wants/
cp ./systemd/hiveapp.service /etc/systemd/system/multi-user.target.wants/

echo "creating apitronics update service"
cp id_rsa* ~/.ssh/

cp ./systemd/apitronicsupdate.service /etc/systemd/system/multi-user.target.wants/
cp ./systemd/sdcard.service /etc/systemd/system/multi-user.target.wants/