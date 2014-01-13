import Xbee
import time

localRSSI=[0]
remoteRSSI=[0]

while True:
  msgs = Xbee.ATCommand("DB")
  responses=[]
  for i in msgs:
    if i[2]==20:
      responses+= [{'origin': i[4:12], 'payload': i[15:len(i)-1]}]
    elif i[2]==6:
		  tmp = i[-2]			
   
    if tmp!=localRSSI[-1]:
      localRSSI+=[tmp]
  print "local strength" + str(localRSSI)
	
  for i in responses:
    Xbee.sendHex([1,2,3],i['origin'])
