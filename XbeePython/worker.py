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

#Coordinator.deviceList=[{'origin':"DEADBEEF", 'data':[0x00, 0x01, 0x00, 0x02, 0x80, 0x00]}]

def ack(address, msg=[1]):
        #turn the address from hex string to array of bytes
        address = tmp['origin']
        addressBytes = []
        for i in range(0,len(address)/2):
                addressBytes+=[ int(address[i*2:i*2+2],16) ]
        #teach end device who we coordinator is
        Coordinator.sendData(addressBytes, msg, ApitronicsFrame['ACK'])

def sendCommand(address, command):
        addressBytes = []
        for i in range(0,len(address)/2):
                addressBytes+=[ int(address[i*2:i*2+2],16) ]
        commandBytes = []
        for i in range(0, len(command)/2):
                #print command[i*2:i*2+2]
                commandBytes+=[int(command[i*2:i*2+2],16)]
        Coordinator.sendData(addressBytes,commandBytes,ApitronicsFrame['writeN'])     
           


while True:

        if len(Coordinator.deviceList)>0:
                tmp = Coordinator.deviceList.pop(0)        
                
                ack(tmp['origin'])
		
                devices=[]
                sensors=[]
		for index in range(0,len(tmp['data'])/2):
                        cur=tmp['data'][index*2]<<8 | tmp['data'][index*2+1]
                        if(cur>=0x8000):
                                devices+=[hex(cur)]
                        else:
                                sensors+=[hex(cur)]
		
		JSON_STRING= { "address": str(tmp['origin']), "devices": devices, "sensors": sensors }
		print json.dumps(JSON_STRING)	
		r = requests.post(idURL, data=json.dumps(JSON_STRING), headers=headers)
                if r.status_code != 200:
                        print "failed posting device list"
                else:
                        print r.text
	
        #Coordinator.data=[{'origin':"DEADBEEF", 'data':[75,00,13,00]}]
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
                r = requests.post(dataURL, data=json.dumps(JSON_STRING), headers=headers)
                if r.status_code != 200:
                        print r_status_code
                        print r.text
                        print "failed posting data"
                else:
                        response = r.json
                        if u'command' in response:
                                print "sending command"
                                sendCommand(tmp['origin'],response[u'command'])                 
                        elif response[u'status']=='ok':
                                print "sending ack"
                                ack(tmp['origin'])
