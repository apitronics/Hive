echo "removing couchdb databases"
rm -r /var/lib/couchdb/
echo "reinstalling couchdb"
pacman -S couchdb
echo "creating databases"
python ~/Hive/networkController/config/createDB.py
echo "creating views"
couchapp push ../viewController/CouchViews/hive_config_api/app.js  http://127.0.0.1:5984/config/

