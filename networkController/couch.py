import logging
from couchConfig import *
from time import mktime, gmtime,strftime
from datetime import datetime, timedelta, tzinfo
import urllib2
import urllib
import simplejson as json
import uuid
from copy import deepcopy

try:
# these are the databases we expect to find
# config stores just about everything except for sensor readings
# the main difference is the config is allowed to implement views
	config = couch['config']
# sensor readings are all put into this database
# this database should not implement views or it will get BIG
	readings = couch['readings']
except:
	logging.error("Databases don't exist")
	quit()


def replicateReadings():
	try:
		couch.replicate(serverAddress + '/readings/', "https://apitronics:12ppoopp34@apitronics.cloudant.com/readings0/") 
	except:
		logging.error("Failed to replicate readings")

# views will all be put on this path - the user application sets them up for us
viewsPath = serverAddress + "/config/_design/hive_config_api/_view/"

def updateDoc(db, UUID, newDict):
	newDoc=deepcopy(db[UUID])
	newDoc.update(newDict)
	del newDoc['_rev']
	del db[UUID]
	db.save(newDoc)
	 	
def timeUpdate(): #updates the time document to the current time
	newTime={'time':str(hex(int(time())))[1::]}
	updateDoc(config,timeUUID,newTime)
	return newTime['time']


def timeConverter(dateTime1,dateTime2): #check to make sure this works still: got rid of mktime in between hex and int
	startTime=hex(int(dateTime1.timetuple()))[2:]
	endTime=hex(int(dateTime2.timetuple()))[2:]
	return startTime,endTime

def dateTimeConverter(datetime): #same change as timeConverter
	datetime=hex(int(datetime.timetuple()))[2:]
	return datetime
		
def query(UUID,startTime, endTime):
	startTime,endTime=timeConverter(startTime,endTime)
	queryPath = serverAddress+"/readings/_all_docs?startkey=\""+UUID+str(startTime)+"\"&endkey=\""+UUID+str(endTime)+'\"'
	print queryPath
	rows=json.loads(urllib2.urlopen(queryPath).read())
	return rows

def queryRecent(UUID,tDeltaSeconds=0, tDeltaMinutes=0, tDeltaHours=0, tDeltaDays=0):
	endTime=datetime.utcnow()
	startTime=endTime - timedelta(hours=tDeltaHours,minutes=tDeltaMinutes,seconds=tDeltaSeconds,days=tDeltaDays)
	rows=query(UUID,startTime,endTime)		
	return rows

def queryRecentDays(UUID,tDeltaDays=1,tDeltaWeeks=0):
	endTime=datetime.utcnow()
        startTime=endTime - timedelta(days=tDeltaDays,weeks=tDeltaWeeks) 
        rows=query(UUID,startTime,endTime)
        return rows

# this is our custom view query function - python-couchdb was unable to _include_docs=true
def view(name):
	# there's a lot of cool metadata that we're throwing away here
	for i in range(0,3):
		try:
			rows = json.loads(urllib2.urlopen(viewsPath + name + '?include_docs=true').read())['rows']
			break
		except:
			pass
		return
	docs = []
	
	for i in rows:
		docs+=[i['doc']]
	
	return docs

# we assemble our views here
try:
	bees = view("Bees")
	print bees
	sensors = view("Sensors")
	sensorDefs = view("SensorDefs")
except:
	logging.error("Views do not exist")


# if we ever need to refresh them later
def refreshViews():
	global bees
	bees = view("Bees")
	global sensors
	sensors = view("Sensors")
	global sensorDefs
	sensorDefs = view("SensorDefs")

def getBeeDoc(address):
	for bee in bees:
		if bee['address']==address:
			return bee
	return False
	
def getBeeUUID(address):	
	beeDoc = getBeeDoc(address)
	if beeDoc:
		return beeDoc['_id']
	return False

def queryTest(UUID,lastPush):#query sensor over all time and gives the most recent entry
        startTime='ffffffff'
	endTime=lastPush
        queryPath = serverAddress+"/readings/_all_docs?include_docs=true&startkey=\""+UUID+startTime+"\"&endkey=\""+UUID+endTime+'\"'+'&descending=true'
	#print queryPath
	response=json.loads(urllib2.urlopen(queryPath).read())
	#print response
        try:
		ret =  {}
		for i in response['rows']:
			ret[i['id'][-8:]] = i['doc']['value']
		return ret
	except:
		print "No readings for this sensor"


def getSensorDefDoc(sensorDef_UUID):
	for i in sensorDefs:
		if i['_id']==sensorDef_UUID:
			return i
	return False

def sensorDefQuery(UUID):
	queryPath=serverAddress+"/config/"+UUID
	sensorDefInfo=json.loads(urllib2.urlopen(queryPath).read())
	return sensorDefInfo['sensorDef']

def sensorIndexQuery(UUID):
	queryPath=serverAddress+"/config/"+UUID
        sensorDefInfo=json.loads(urllib2.urlopen(queryPath).read())
        return sensorDefInfo['index']  


def firmwareQuery(UUID): #returns the name and the units of a sensor given its UUID
	sensorDef=sensorDefQuery(UUID)
	queryPath=serverAddress+"/config/"+sensorDef
	nameInfo=json.loads(urllib2.urlopen(queryPath).read())
	return nameInfo['name'],nameInfo['units']
	
# this function can delete everything in a view
def deleteAllKind(rows):
	for i in rows:
		del config[i['_id']]

