import couch
import logging

try:
	readings = couch.couch.create('readings')
except:
	print "readings database exists"

try:
	config = couch.couch.create('config')
except:
	print "config database exists"


config = couch.couch['config']

def put(payload):

        global config
        try:
                doc_id, doc_rev = config.save(payload)
        except:
                logging.error("Document ID conflict!")

user = raw_input("Enter username: ")

put({'_id':'0', 'user':user})


def addWeatherStationDefs():
        try:
                del config['3ebb7ddfd3b824e485a352cb160007ab']
                del config['3ebb7ddfd3b824e485a352cb160007ac']
                del config['361688c531dca8b6fc7212f5a5003f9e']
                del config['361688c531dca8b6fc7212f5a5004bba']
                del config['361688c531dca8b6fc7212f5a5005454']
                del config['361688c531dca8b6fc7212f5a5005c84']
                del config['361688c531dca8b6fc7212f5a5005ea9']
                del config['361688c531dca8b6fc7212f5a50063c6']
                del config['361688c531dca8b6fc7212f5a50063c7']
                del config['361688c531dca8b6fc7212f5a50063c8']
        except:
                pass

        put({'_id': '3ebb7ddfd3b824e485a352cb160007ab','kind': 'sensorDef', 'name': 'Temperature', 'units':'C', 'partRef': 'SHT21', 'firmware_UUID': 0x0001, 'dataLength': 2})
        put({'_id': '3ebb7ddfd3b824e485a352cb160007ac','kind': 'sensorDef', 'name': 'Relative Humidity', 'units':'%', 'partRef': 'SHT21', 'firmware_UUID': 0x0002, 'dataLength': 2})
	put({'_id': '361688c531dca8b6fc7212f5a5003f9e','kind': 'sensorDef', 'name': 'Temperature', 'units':'C', 'partRef': 'MPL115A2', 'firmware_UUID': 0x0003, 'dataLength': 4})
        put({'_id': '361688c531dca8b6fc7212f5a5004bba','kind': 'sensorDef', 'name': 'Barometric Pressure', 'units':'kPa', 'partRef': 'MPL115A2', 'firmware_UUID': 0x0004, 'dataLength': 4})
        put({'_id': '361688c531dca8b6fc7212f5a5005454','kind': 'sensorDef', 'name': 'Wind Direction', 'units':'\xc2\xb0', 'partRef': 'Argent_80422', 'firmware_UUID': 0x0005, 'dataLength': 2})
        put({'_id': '361688c531dca8b6fc7212f5a5005c84','kind': 'sensorDef', 'name': 'Wind Speed', 'units':'km/h', 'partRef': 'Argent_80422', 'firmware_UUID': 0x0006, 'dataLength': 4})
        put({'_id': '361688c531dca8b6fc7212f5a5005ea9','kind': 'sensorDef', 'name': 'Luminosity', 'units':'lux', 'partRef': 'TSL2561', 'firmware_UUID': 0x0007, 'dataLength': 4})
        put({'_id': '361688c531dca8b6fc7212f5a50063c6','kind': 'sensorDef', 'name': 'Rainfall', 'units':'mm', 'partRef': 'Argent_80422_rain', 'firmware_UUID': 0x0008, 'dataLength': 4})
def addSHT1xDef():
        try:
                del config['3ebb7ddfd3b824e485a352cb16000c2c']
                del config['3ebb7ddfd3b824e485a352cb160007aa']
        except:
                pass
        put({'_id': '3ebb7ddfd3b824e485a352cb160007aa','kind': 'sensorDef', 'name': 'Temperature', 'units':'C', 'partRef': 'SLHT5', 'firmware_UUID': 0x0011, 'dataLength': 2})
        put({'_id': '3ebb7ddfd3b824e485a352cb16000c2c','kind': 'sensorDef', 'name': 'Relative Humidity', 'units':'%', 'partRef': 'SLHT5', 'firmware_UUID': 0x0012, 'dataLength':2})

def addSensors():
        addWeatherStationDefs()
        addSHT1xDef()

addSensors()


replicator = couch.couch['_replicator']



replicationDoc = {'source': couch.serverAddress + '/config/', 'target':'https://apitronics:12ppoopp34@apitronics.cloudant.com/' + user + 'config/', 'continuous': True}


try:
	doc_id, doc_rev = replicator.save(replicationDoc)
except:
        logging.error("Document ID conflict!")

