
# Servers
- Queen (port 125) : For registering and setting up new Bees.
- Honeycomb (port 126) : Where Bees send Honey packets for parsing and storing.
- Beekeeper (port 8800, 80, and 8000) : The Web UI for human users where they can view and manipulate the the GroundHive. Port 80 forwards to 8000 where 8800 (Beekeeper's Web UI) and 5984 (CouchDB) are routed together so that browsers can access them all without running into the Cross Origin Request limitation in Web Browsers. If the client device does not have mDNS support, port 80 forwards the client to the `:5984/apps/_design/beekeeper/index.html`, the CouchApp version of the Beekeeper app.


# Manual Install
- Run `npm install` in all folders unless they don't have a package.json file.
- `cp Settings.default.js; vim Settings.js;` -> Edit your settings.
- `cd utils; ./install` -> Install


# Start everything
```
cd ../Queen; 
sudo nodemon server.js;
cd ../Honeycomb; 
sudo nodemon server.js;
cd ../HoneyJars;
sudo nodemon server.js;
cd ../Beekeeper; 
sudo nodemon server.js;
```

Watch out for the ol' "Address In Use" errors in case those ports are claimed. For example Apache claims 80, Beekeeper doesn't like that.

# API

## How Bees tell the Queen they exist with an "Egg"

If the Bee is a Unix based system and has `curl` available with 12 sensors attached to it, the Bee would notify the Queen of its existence by sending an `Egg` document to the Queen as follows.

```
curl -XPOST http://hive.local:125/egg/new -H "Content-Type: Application/json" -d '
  {
    "sensors": ["0x01", "0x02", "0x10", "0x11", "0x12", "0x15", "0x13", "0x14", "0x16", "0x17", "0x17", "0x17"],
    "address": "60:c5:47:04:f1:94"
  }
';
```

The address property can be any string the Bee's firmware chooses to uniquely identify itself. The Bee might use a GSM ID, a MAC Address, or whatever unique ID that Bee might have available to it to consistently and uniquely identify itself to the when sending data to the Honeycomb service. Each entry in the `sensors` array implies the order the sensor will be found in the Honey Packets the Bee will later send. These sensor entries are also reduced from their corresponding values in the `SensorDefinition` documents' `firmwareUUID` property. For example, `0x10` is actually a `firmwareUUID` of `0x00000010`.   


## How to hatch an Egg

___Note: The Queen hatches Eggs as they are received. Eggs may hatch in the future as directed by the user.___ `Egg` documents that live in the `incubator` database that do not have the `hatched` flag set to `true` are assignable to Swarms. You can assign Bee to a Swarm by "hatching" the `Egg` document where you reference the Egg by its `beeAddress`. 

```
curl -XPOST http://hive.local:125/egg/hatch -H "Content-Type: Application/json" -d '
  {
    "beeAddress": "60:c5:47:04:f1:94",
    "name": "BravoBee"
  }
';
```

Queen hatches the Egg (produces a `Bee` document and one or more `Sensor` documents), installs them in the Swarm's config database, and then creates all sensor databases. 


## How Bees send data to Honeycomb

When a Bee has been hatched, Honeycomb can find the configuration and corresponding databases for that Bee when it sends "Honey Packets". More than one "Honey Packet" can be sent at once, each just needs it's own corresponding timestamp. The data packet itself is parsed by looking up chunking the string using the `order` property on related `Sensor` documents and then the descriptive data in the corresponding `SensorDefinition` documents, properties like `shift`, `units`, `scalar`, and `dataLength`. 

```
curl -XPOST http://hive.local:126 -H "Content-Type: Application/json" -d '
  {
    "address": "60:c5:47:04:f1:94",
    "data": { 
      "10:45:15, 13/12/13": "3e0fab7d018c8a32e076c0076c1c1c1c",
      "10:45:30, 13/12/13": "3e0fab7d018c8a32e076c0076c1c1c1c",
      "10:45:45, 13/12/13": "3e0fab7d018c8a32e076c0076c1c1c1c",
      "10:46:00, 13/12/13": "3e0fab7d018c8a32e076c0076c1c1c1c"
    } 
  }
';
```

```
curl -XPOST http://hive.local:126 -H "Content-Type: Application/json" -d '
  {
    "address": "60:c5:47:04:f1:06",
    "data": { 
      "10:45:15, 13/16/13": "3e0fab7d018c8a32e076c0076c1c1c1c"
    } 
  }
';
```
