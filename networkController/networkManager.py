import couch
import Xbee


#results = Xbee.mapNetwork()

nodes = []


for bee in couch.bees:	
	nodes+=[bee['address']]


def refreshNodes():
	global nodes
	results = Xbee.mapNetwork()
	for response in results:
		if response not in nodes:
			string = raw_input("New bee found - name: ")
			couch.putBee({'address': response, 'name': string})
			nodes+=[response]

def getReadings():
	data = Xbee.getData(nodes[0])
	temp = str((data[1]+data[2]+data[3])/3.0)
	humidity = str(data[4])
	couch.putRecord({'sensor': "temperature", 'value': temp})
	couch.putRecord({'sensor': "humidity", 'value': humidity})

#refreshNodes()
