import logging
import couchConfig
import couch
import urllib2
import urllib

# the next few functions are just wrappers to make certain puts easier
def put(payload):	
	global config
	try:
		doc_id, doc_rev = couch.config.save(payload)
	except:
		logging.error("Document ID conflict!")


def putBee(payload):	
	payload.update({'kind': 'bee'})
	put(payload)

def putSensor(payload):
	logging.info("Adding sensor document" + str(payload))
	payload.update({'kind': 'sensor'})
	put(payload)
	logging.info("Adding sensor DB")
	print str(payload)
	print payload['_id']
	couch.couch.create("s"+payload['_id'])
	

# we have to find a scalable way of dealing with these things
# right now, just import your data parsing libraries here
# or implement them below
import SHT1x
import SHT2x
import bisect
import json

def putRecord(value, sensor, time):
	#time = str(hex(int(mktime(gmtime()))))[1::]
	payload = {'_id': time, 'value': value}
	#put record readings DB
	couch.readings
	try:	
		sensorURL = couchConfig.serverAddress+"/s"+str(sensor)+"/"
		#couch.readings.save(payload)
		data = json.dumps(payload)
		req = urllib2.Request(sensorURL, data, {'Content-Type': 'application/json'})
		print req
		f = urllib2.urlopen(req)
		response = f.read()
		print response
		f.close()
	except:
		logging.error("Error saving record to CouchDB")

def createBee(address):
        name = raw_input("New bee found - name: ")
	plugType = raw_input("plugType: ")
	beeDoc = {'address': address}
	if plugType=='weatherStation':
		wunderground_ID = raw_input("wunderground ID: ")
		beeDoc['wunderground_ID'] = wunderground_ID	
        putBee(beeDoc)

def queryLast(UUID):
	queryPath = couch.serverAddress+"/readings/_all_docs?startkey=\""+ UUID +"ffffffff\"&endkey=\""+ UUID+ '00000000\"&descending=true&limit=1'
	#print queryPath
	raw =  urllib2.urlopen(queryPath).read()
	try:
		 return json.loads(raw)['rows'][0]
	except:
		 return False

def queryFirst(UUID):
	queryPath = serverAddress+"/readings/_all_docs?startkey=\""+ UUID +"00000000\"&endkey=\""+ UUID+ 'ffffffff\"&limit=1'
        #print queryPath
	raw =  urllib2.urlopen(queryPath).read()
        try:
                 return json.loads(raw)['rows'][0]
        except:
                 return False



def putRecords(dict, timeStamp):
	timeStamp = hex(int(timeStamp))[2::]
	address = dict['origin']
	rawPayload = dict['payload']
	#get bee_UUID	
	bee_UUID = couch.getBeeUUID(address)
	#bees should only be created when they give ID for now	
	#needs to be created if it doesn't exist
	#if bee_UUID==False:
	#	createBee(address)
	#	bee_UUID = couch.getBeeUUID(address)

	if bee_UUID==False:
		for bee in couch.bees:
			logging.error(bee)
		logging.error(str(address)+ " does not exist!")

	beeSensor={}
	for sensor in couch.sensors:
		if sensor['bee']==bee_UUID:
			beeSensor[sensor['index']]=sensor
	
	if beeSensor=={}:
		logging.error(str(bee_UUID) + " has no sensors!")
		#for sensor in couch.sensors:
		#	logging.error(sensor)
		return
	
	payload={}
	count = 0
	for i in range(0,len(beeSensor)):
		sensorDef = beeSensor[i]['sensorDef']
        	length = couch.getSensorDefDoc(sensorDef)['dataLength']
        	unit = 0
        	for j in range(0,length):
                	unit |= rawPayload[count+j]<<(8*(length-j-1))
        	count+=length
        	payload[i]=unit
	
	#this is a hack to get corrected humidity... worthwhile?
	shared = 0

	for index,item in enumerate(payload):
		sensorDefDoc = couch.getSensorDefDoc(beeSensor[index]['sensorDef'])
		if sensorDefDoc == False:
			logging.error("No sensor def!")
		else:
			firmware_UUID = sensorDefDoc['firmware_UUID']
			name = sensorDefDoc['name']
			sensor_UUID = beeSensor[index]['_id']
			# SHT TEMP
			if firmware_UUID==1:
				shared = round(SHT2x.convertT(payload[item]),2)
				logging.info(str(shared)+"C")
				putRecord(shared, sensor_UUID, timeStamp)
			# SHT HUMIDITY
			elif firmware_UUID==2:
				shared = round(SHT2x.convertRH(payload[item]),2)
				logging.info(str(shared)+"%")
				putRecord(shared, sensor_UUID, timeStamp)	
			# MPL TEMP
			elif firmware_UUID==3:
				value = payload[item]/100.0
				#logging.info('MPL Temp: ' + str(value)+'C')
				putRecord(value,sensor_UUID, timeStamp)
			# MPL PRESSURE
			elif firmware_UUID==4:
				value = payload[item]/100.0
				putRecord(value,sensor_UUID, timeStamp)
				#logging.info('MPL Pressure: '+ str(value)+'kPa')
			# WIND DIRECTION
			elif firmware_UUID==5:
				value = payload[item]/100.0
				putRecord(value,sensor_UUID, timeStamp)
			# WIND SPEED
			elif firmware_UUID==6:
				last = queryLast(sensor_UUID)
				if not last or payload[item]==0xFFFFFFFF:
					putRecord(-1, sensor_UUID, timeStamp)
				else:
					last = int(last['id'][-8::],16)
					delta=float(int(mktime(gmtime()))-last)/60.0
					if delta!=0:
						kmPerh = payload[item]/delta*2.4
					else:
						kmPerh = -1
					logging.info("Wind Speed: " + str(kmPerh))
					putRecord(kmPerh, sensor_UUID, timeStamp)			
			# TSL LIGHT
			elif firmware_UUID==7:
				putRecord(shared,sensor_UUID, timeStamp)
			# RAINBUCKET RAIN FALL
			elif firmware_UUID==8:
				last = queryLast(sensor_UUID)
                        	if not last or payload[item]==0xFFFFFFFF:
					print "rainfall init"
                                	putRecord(-1, sensor_UUID, timeStamp)
                        	else:
                                	last = int(last['id'][-8::],16)
                                	delta=float(int(mktime(gmtime()))-last)
                                	if delta!=0:
                                        	mmRainFall = payload[item]/delta*0.2794
                                	else:   
                                        	mmRainFall = -1
                                	putRecord(mmRainFall, sensor_UUID,timeStamp)
			
			elif firmware_UUID==0x11:
				shared = SHT1x.parseTemperature(payload[item])
				#logging.info(str(shared)+"C")
				putRecord(shared, sensor_UUID, timeStamp)
			elif firmware_UUID==0x12:
				temporary = SHT1x.parseHumidity(payload[item])
				shared = SHT1x.correctHumidity(shared, temporary, payload[item])
				#logging.info(str(shared)+"%")
				putRecord(shared, sensor_UUID, timeStamp)	
			else:
				logging.error("Don't know how to parse this") 

def putSensors(dict):
	address = dict['origin']
	rawPayload = dict['payload']
        payload = []

	for i in range(0,len(rawPayload)/2):
		payload+=[rawPayload[i*2]<<8|rawPayload[i*2+1]]
	
	#GET BEE_UUID FROM ADDRESS
	bee_UUID = couch.getBeeUUID(address)	
	if bee_UUID==False:
		createBee(address)
		couch.refreshViews()
		bee_UUID = couch.getBeeUUID(address)
	

	#GET SENSORS ON BEE FROM BEE_UUID	
	beeSensors = {}
	for i in couch.sensors:
		if i['bee']==bee_UUID:
			beeSensors[i['index']]=couch.config[i['sensorDef']]['firmware_UUID']
	
	#FOR EACH SENSOR
	for index,item in enumerate(payload):
		if index in beeSensors:
			if beeSensors[index]!=item:
				addSensorInstance(bee_UUID,item,index)
			else:
				logging.info( "sensor already defined :)")
		else:
			addSensorInstance(bee_UUID,item,index)

	couch.refreshViews()
	logging.info( "done loading Bee")

def addSensorInstance(beeId, item,index):
	for i in couch.sensorDefs:
		if i['firmware_UUID']==item:
			sensorDef_UUID = i['_id']
			putSensor({'name': couch.config[sensorDef_UUID]['name'], 'index': index, 'bee': beeId, 'sensorDef': sensorDef_UUID })
			return		
	logging.info( "UNKNOWN SENSOR TYPE: " + str(item))


#def logging.info(Temps():
#	for i in temps:
#		logging.info( strftime("%a, %d %b %Y %H:%M:%S", gmtime(float(i.key))) +", temp: "+ str(i.value['Value']))

def addWeatherStationDefs():
	try:
		del couch.config['361688c531dca8b6fc7212f5a5003f9e']
		del couch.config['361688c531dca8b6fc7212f5a5004bba']
		del couch.config['361688c531dca8b6fc7212f5a5005454']
		del couch.config['361688c531dca8b6fc7212f5a5005c84']
		del couch.config['361688c531dca8b6fc7212f5a5005ea9']
		del couch.config['361688c531dca8b6fc7212f5a50063c6']
	except:
		pass	


	put({'_id': '361688c531dca8b6fc7212f5a5003f9e','kind': 'sensorDef', 'name': 'Temperature', 'units':'C', 'partRef': 'MPL115A2', 'firmware_UUID': 0x0003, 'dataLength': 4})
	put({'_id': '361688c531dca8b6fc7212f5a5004bba','kind': 'sensorDef', 'name': 'Barometric Pressure', 'units':'kPa', 'partRef': 'MPL115A2', 'firmware_UUID': 0x0004, 'dataLength': 4})
	put({'_id': '361688c531dca8b6fc7212f5a5005454','kind': 'sensorDef', 'name': 'Wind Direction', 'units':u'\u00b0', 'partRef': 'Argent_80422', 'firmware_UUID': 0x0005, 'dataLength': 2})
	put({'_id': '361688c531dca8b6fc7212f5a5005c84','kind': 'sensorDef', 'name': 'Wind Speed', 'units':'km/h', 'partRef': 'Argent_80422', 'firmware_UUID': 0x0006, 'dataLength': 4})
	put({'_id': '361688c531dca8b6fc7212f5a5005ea9','kind': 'sensorDef', 'name': 'Luminosity', 'units':'lux', 'partRef': 'TSL2561', 'firmware_UUID': 0x0007, 'dataLength': 4})
	put({'_id': '361688c531dca8b6fc7212f5a50063c6','kind': 'sensorDef', 'name': 'Rainfall', 'units':'mm', 'partRef': 'Argent_80422_rain', 'firmware_UUID': 0x0008, 'dataLength': 4})

def addSHT2xDef():
	try:
		del couch.config['3ebb7ddfd3b824e485a352cb160007aa']
		del couch.config['3ebb7ddfd3b824e485a352cb16000c2c']
	except:
		pass
	put({'_id': '3ebb7ddfd3b824e485a352cb160007aa','kind': 'sensorDef', 'name': 'Temperature', 'units':'C', 'partRef': 'SHT21', 'firmware_UUID': 0x0001, 'dataLength': 2})	
	put({'_id': '3ebb7ddfd3b824e485a352cb16000c2c','kind': 'sensorDef', 'name': 'Humidity', 'units':'%', 'partRef': 'SHT21', 'firmware_UUID': 0x0002, 'dataLength':2})

def addSensors():
	addWeatherStationDefs()
	addSHT2xDef()

#addSensors()
#deleteAllKind(bees)
#deleteAllKind(sensors)
#refreshViews()
