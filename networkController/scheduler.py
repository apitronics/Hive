import Xbee
import datetime
import pickle
import os.path
import os
import urllib2
import sys
from schedule import *

import couch

import simplejson as json

from time import mktime, gmtime

now = datetime.datetime.now()

print "Start-up @ " + str(now)

#import our saved revL if it exists
try:
	cur = open('./revL.pkl', 'rb')
	revL = pickle.load(cur)
	cur.close()
	print "loaded revL"
except:
	revL={}
	print "creating new revL"

#import our saved revP if it exists
try:
	cur = open('./revP.pkl', 'rb')
	revP = pickle.load(cur)
	cur.close()
	print "loaded revP"
except:
	revP={}
	print "creating new revP"

sys.stdout.flush()

def onLights(secs):
	secs = int(secs)
	try:
		schedule[(56,102)]+=[job(Xbee.onLights, Xbee.offLights, datetime.timedelta(seconds=secs), removeJob, datetime.datetime.now())]
	except:
		schedule[(56,102)]=[job(Xbee.onLights, Xbee.offLights, datetime.timedelta(seconds=secs), removeJob, datetime.datetime.now())] 
	updateSchedule()	
	checkSchedule()

def onPump(secs):
	secs = int(secs)
	try:
		schedule[(56,102)]+=[job(Xbee.onPump, Xbee.offPump, datetime.timedelta(seconds=secs), removeJob)]
	except:
		schedule[(56,102)]=[job(Xbee.onPump, Xbee.offPump, datetime.timedelta(seconds=secs), removeJob)]
	updateSchedule()
	checkSchedule()	



def checkCouch():
	lights = urllib2.urlopen('http://www.apitronics.iriscouch.com/highland/lights')
	parsed = json.loads(lights.readline())
	global revL
	if revL!=parsed['_rev']:
		revL=parsed['_rev']
		onLights(parsed['on_for'])
		#delete previous network pickle if it exists	
		try:
			os.remove('./revL.pkl')
		except:
			pass	
		cur = open('./revL.pkl', 'wb')
		pickle.dump(revL, cur)
		cur.close()
	
	pump = urllib2.urlopen('http://www.apitronics.iriscouch.com/highland/pump')
	parsed = json.loads(pump.readline())
	global revP
	if revP!=parsed['_rev']:
		revP=parsed['_rev']
		onPump(parsed['on_for'])
		#delete previous network pickle if it exists	
		try:
			os.remove('./revP.pkl')
		except:
			pass
		cur = open('./revP.pkl', 'wb')
		pickle.dump(revP, cur)
		cur.close()

def checkSchedule():
	for key in schedule:
		for index,job in enumerate(schedule[key]):
			now = datetime.datetime.now()		
			if now>job.start and now<job.end and job.state=='off':
				job.state='on'
				job.affirm(key)
				print str(datetime.datetime.now())+ ": " + str(job.affirm) + "@" + str(key)
			elif now>job.end:	
				job.state='off'			
				job.negate(key)
				job.update(key,index)
				print str(datetime.datetime.now())+ ": " + str(job.negate) + "@" + str(key)
				updateSchedule()


def getReadings():	
	data = Xbee.getData((56,102))
	temp = data[1]+data[2]+data[3])/3.0
	humidity = data[4]
	
	couch.putRecord({'sensor': "temperature", 'value': temp})
	couch.putRecord({'sensor': "humidity", 'value': humidity})	
	
lastReading = 0
delta = 60*5

getReadings()

#while True:
#	sys.stdout.flush()
	#checkSchedule()
	#try:
	#	checkCouch()
	#except:
	#	pass
#	if(lastReading+delta<mktime(gmtime())):
#		lastReading = mktime(gmtime())
#		try:				
#			getReadings()
#		except:
#			print "Error getting readings"
#			pass
