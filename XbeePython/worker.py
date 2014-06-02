import requests
import json

from Xbee import *

# manually input address to make testing faster
Coordinator = Xbee('/dev/ttyO4')

import time
import datetime
address = Coordinator.address()

idURL="http://hive.local:125/egg/new"
dataURL="http://hive.local:126"
headers= {'Content-type': 'application/json', 'Accept': 'text/plain'}

while True:
	if len(Coordinator.ids)>0:
		tmp = Coordinator.ids.pop(0)
		
		#turn the address from hex string to array of bytes
		address = tmp['origin']
		addressBytes = []
		for i in range(0,len(address)/2):
			addressBytes+=[ int(address[i*2:i*2+2],16) ]
		#teach end device who we coordinator is
		Coordinator.sendData(addressBytes,[0],0)

		
		data=[]
		for index in range(0,len(tmp['data'])/2):
			#cur="\""
			cur=hex(tmp['data'][index*2]<<8 | tmp['data'][index*2+1])[-4:]	
			#cur+="\""
			data+=[cur]		
		
		JSON_STRING= { "address": str(tmp['origin']), "sensors": data }
		print json.dumps(JSON_STRING)	
		r = requests.post(idURL, data=json.dumps(JSON_STRING), headers=headers)
		print r.text
		time.sleep(1)
	
	if len(Coordinator.data)>0:
		tmp = Coordinator.data.pop(0)
		timestamp=datetime.datetime.utcnow().strftime('%H:%M:%S, %d/%m/%y')
		data=""
                for byte in tmp['data']:
			cur = hex(byte)[2:]
			while len(cur)<2:
				cur= '0'+cur
			data+= cur
		JSON_STRING = {"address": str(tmp['origin']), "data":{ timestamp : data }}
		print json.dumps(JSON_STRING)
		print requests.post(dataURL, data=json.dumps(JSON_STRING), headers=headers).text
	#try:
	#	tmp = Coordinator.ids.pop(0)
	#	print "booyah"
#
#	except:
#		pass
#
#	
#	try:
	#	print Coordinator.data.pop(0)
	#e#xcept:
	#	pass

		
	#Coordinator.sendData(address, program, ApitronicsFrame['programFlash'])
	#Coordinator.broadcast([2,3,4])
	#time.sleep(10)
	#Router.setAT("D0",5)
	#time.sleep(0.5)
	#Router.setAT("D0",4)
	##time.sleep(0.5)
