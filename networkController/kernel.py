from time import gmtime, mktime, strftime
from sys import stdout

print "start up at " + str(strftime("%Y-%m-%d %H:%M:%S", gmtime()))
stdout.flush()

import networkManager
import couch
import Xbee

for i in networkManager.nodes:
	print i

def getReadings():
	data = Xbee.getData(networkManager.nodes[0])
	temp = (data[1]+data[2]+data[3])/3.0
	humidity = data[4]
	#print temp
	#print humidity
	couch.updateRecord({'sensor': 'ecd5ace659f7cc4e405e395b59462d00', 'value': temp}, '6ed0456ea56511e28ace94dbc9b725bf')
	couch.updateRecord({'sensor': 'fee3019c58fceedfc71965fbfc4a80dc', 'value': humidity}, '6ed0456ea56511e28ace94dbc9b725af')

lastReading = 0
delta = 60*5

while True:
	stdout.flush()
	if(lastReading+delta<mktime(gmtime())):
		lastReading = mktime(gmtime())
		try:		
			getReadings()
		except:
			print "Error getting readings at " + str(strftime("%Y-%m-%d %H:%M:%S", gmtime()))
			stdout.flush()

