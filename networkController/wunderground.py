from couch import *
from time import time, mktime, gmtime,strftime,strptime
from datetime import datetime, timedelta
import urllib2
import urllib
import couchdb
import os
import pickle
import logging

def findWeatherSensors():
        weatherStations=set()
        weatherSensors={}
	stationID = {}
        
	global bees
	for i in bees:
                if i['plugType']=='weatherStation':
				stationID[i['_id']]=i['wunderground_ID']
                                weatherStations.add(i['_id'])
				weatherSensors[i['wunderground_ID']]=[]
	
        for i in sensors:
                if i['bee'] in  weatherStations:
			weatherSensors[stationID[i['bee']]].append(i['_id'])

        return weatherSensors

#creates a list of dictionaries with the keys being the sensors firmwareUUID and values are the readings
def createValueDict(lastPush):
        list=findWeatherSensors()
        weatherStations=[]
	for i in list:
		data={}
		data['wunderground_ID']=i
                for j in list[i]:
                        x={sensorIndexQuery(j):queryTest(j,lastPush)} 
			for k in x:
				if k==0:
					data['tempf']=x[k]
				elif k==1:
					data['humidity']=x[k]
				elif k==2:
					data['temp2f']=x[k]
				elif k==3:
					data['baromin']=x[k]
				elif k==4:
					data['winddir']=x[k]
				elif k==5:
					data['windspeedmph']=x[k]
				elif k==6:
					pass #can add in luminosity here
				elif k==7:
					data['rainin']=x[k]
		weatherStations.append(data)
	return weatherStations

def createList(lastPush,data,wundergroundID):
	times=set()
	for i in data:
		for j in data[i]:
			if j not in times:
				times.add(j)
	list=[]
	for i in times:
		readings={}
		readings['time']=i
		readings['wundergroundID'] = wundergroundID
		for j in data:
			for k in data[j]:
				if k==i:
					readings[j]=data[j][k]
		list.append(readings)
	return list

def dictCreator(lastPush):
	data=createValueDict(lastPush)
	a=[]
	for i in data:
		wunderground_ID = i['wunderground_ID']
		del i['wunderground_ID']
		x=createList(lastPush,i,wunderground_ID)
		a.append(x)
		
	return a

def tempConverter(tempC):
        tempF=(9.0/5.0)*tempC+32
        return tempF

def milliConverter(milli):
        inches=milli*.03937
        return inches

def pressureConverter(pressureKpA):
        pressureIn=pressureKpA*.295333727
        return pressureIn

def speedConverter(speedKmH):
        speedMPH=speedKmH*.621371
        return speedMPH

def wundergroundConvert(lastPush): #converts the dictionary with firmwareUUID and values to one with the appropriate wunderground names and conve$
        data=dictCreator(lastPush)
        for j in data:
        	for i in j:
			for k in i:
                		if k=='tempf':
                               		i[k]=tempConverter(i[k])
                       		elif k=='humidity':
                               		i[k]=i[k]
                       		elif k=='temp2f':
                                	i[k]=tempConverter(i[k])
                       		elif k=='baromin':
                               		i[k]=pressureConverter(i[k])
                       		elif k=='winddir':
                               		i[k]=i[k]
                       		elif k=='windspeedmph':
                               		if speedConverter(i[k])>=0: #check to make sure windspeed is non negative
						i[k]=speedConverter(i[k])
                        		else:
						pass
				elif k=='luminosity': # can add in luminosity here
                               		pass
                       		elif k=='rainin':
                               		i[k]=milliConverter(i[k])
	return data

def pickleLoad(filePath):
	file = open("./" + filePath, "rb")
	ret = pickle.load(file)
	file.close()
	return ret

def pickleLoadPush():
	return pickleLoad("lastPush.pkl")
	
def pickleLoadPushRain():
	return pickleLoad("lastRainPush.pkl")

def cleanUp(filePath):
	try:
		os.remove("./" + filePath)
	except:
		pass

def pickleDump(data,filePath):
	cleanUp(filePath)
	file = open("./"+filePath, "wb")
	pickle.dump(data, file)
	file.close()

def pickleDumpPush(currentTime):
	pickleDump(currentTime, "lastPush.pkl")

def pickleDumpPushRain(lastRainPush):
	pickleDump(lastRainPush, "lastRainPush.pkl")

_rainReadings={}

def hexTimeConverter(time):
	time=int(time,16)
       	time=datetime.fromtimestamp(time)
        time=str(time)
        time=strptime(time,'%Y-%m-%d %H:%M:%S')
        time=strftime("%Y-%m-%d+%H:%M:%S",gmtime(mktime(time)))
	return time


def wundergroundPush():
	currentTime=hex(int(time()))[2:]

	try:	
		lastPush=pickleLoadPush()
		lastRainPush=pickleLoadPushRain()
	except:
		logging.info("Initializing pickle files")
		pickleDumpPush(currentTime)
		pickleDumpPushRain({})
		return

	valueDict=wundergroundConvert(lastPush)
        currentTimeEpoch=int(currentTime,16)
	pickleDumpPush(currentTime)
	global _rainReadings
	for i in valueDict:
		for j in i:
			currentTime=hex(int(time()))[2:]
			currentTimeEpoch=int(currentTime,16)
			ID=j['wundergroundID']
			
			if ID in lastRainPush:
				pass
			else:
				lastRainPush[ID]=currentTime
			
			time2=hexTimeConverter(j['time'])
			
			if ID in _rainReadings:
				_rainReadings[ID]=_rainReadings[ID]+j['rainin']
			else:
				_rainReadings[ID]=j['rainin']
			
			
			lastRainPushEpoch=int(lastRainPush[ID],16)
			
			#elapsed=currentTimeEpoch-lastRainPushEpoch
			#if elapsed >= 3600:
			#	rainin=0
				#rainin=_rainReadings[ID]
				#getPathRain='http://weatherstation.wunderground.com/weatherstation/updateweatherstation.php?ID='+ID+'&PASSWORD=12ppoopp34&acton=updateraw&dateutc='+time2+'&rainin='+str(rainin)
				#print urllib2.urlopen(getPathRain).read()
				
				#lastRainPush[ID]=currentTime
				#pickleDumpPushRain(lastRainPush)
				#_rainReadings[ID]=0
			getPath='http://weatherstation.wunderground.com/weatherstation/updateweatherstation.php?ID='+ID+'&PASSWORD=12ppoopp34&action=updateraw&dateutc='+time2

			if 'tempf' in j:
				temp="&tempf="+str(j['tempf'])
				getPath=getPath+temp
			if 'baromin' in j:
				barom="&baromin="+str(j['baromin'])
				getPath=getPath+barom
			if 'humidity' in j:
				humidity='&humidity='+str(j['humidity'])
				getPath=getPath+humidity
			if 'windspeedmph' in j:
				if j['windspeedmph']!=-1:
					windspeed='&windspeedmph='+str(j['windspeedmph'])
					windgust='&windgustmph='+str(j['windspeedmph'])
					getPath=getPath+windspeed+windgust
			if 'winddir' in j:
				winddir='&winddir_avg2m='+str(j['winddir'])+'&winddir='+str(j['winddir'])
				getPath=getPath+winddir
			if 'temp2f' in j:
				temp2='&temp2f='+str(j['temp2f'])
				getPath=getPath+temp2
			logging.info("Wunderground push: " + urllib2.urlopen(getPath).read()[:7])
			return
			#print getPath
