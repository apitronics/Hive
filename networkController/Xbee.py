#!/usr/bin/env python
import logging
from serial.tools.list_ports_posix import *

XbeePortName = '' 

while XbeePortName=='':
	for i in comports():
		#print i
		if i[2]=='USB VID:PID=0403:6001 SNR=A601ECT2' or i[2]=='USB VID:PID=0403:6001 SNR=A601ECO9' or i[2]=='USB VID:PID=0403:6001 SNR=A1012WUJ' or i[2]=='USB VID:PID=0403:6001 SNR=AE01CRRL' or i[2]=='USB VID:PID=0403:6001 SNR=AD01SRWX' or i[2]=='USB VID:PID=0403:6001 SNR=AD01ST0H' or i[2]=='USB VID:PID=0403:6001 SNR=AD01ST0M':
			XbeePortName = i[0]

import serial
import io
import array
import binascii
import os
import time


#import our saved network map if it exists
#try:
#	nM = open('./networkMap.pkl', 'rb')
#	networkMap = pickle.load(nM)
#	print "loaded Network Map"
#except:
#	networkMap={}
#	print "creating new Network Map"

networkMap={}
ser = serial.Serial(XbeePortName, 9600, timeout=1)
logging.info(XbeePortName)

ser.flush()

def test():
        hexAPI=[0x7E, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00,
               0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFE, 0x00, 0x00,
               0x54, 0x78, 0x44, 0x61, 0x74, 0x61, 0xAD]
        ser.write(array.array('B',hexAPI).tostring())
        print ser.readlines(200)

def broadcast(string):
        hexAPI=[0x7E, 0x00, 0x00, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00,
               0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFE, 0x00, 0x00]
        ser.write(formatAPI(hexAPI,string))
	listen()

def sendHex(hexArray, address):
	#initialize hexAPI with standard beginning
	hexAPI=[0x7E, 0x00, 0x00, 0x10, 0x01]
	#Start [Delimiter, MSB (length), LSB (length), Frame Type (ie: transmit), Frame ID (ie: want ACK)]

	hexAPI+=address#[0x00, 0x13, 0xA2, 0x00, 0x40, 0x8D,0x05,0x2A] #64 bit address
	hexAPI+=[0xFF, 0xFE]   #16 bit address
	hexAPI+=[0x00, 0x00]   #radius and bullshit
        
	#hexAPI+=[0xFF,0xFE]			#[maximum hops, options (disabled)]
						#add on payload
	for i in hexArray:
                        hexAPI+=[i]

	        
        hexAPI[2]=len(hexAPI)-3                      
        hexAPI+= [0xFF-sum(hexAPI[3::])&255]

	return sendTilACK(hexAPI)	

ACK = [126, 0, 7, 139, 1]
#ACK = [126, 0, 7, 139, 1, 56, 102, 0, 0, 0, 213]
#56 102 is this particular Xbee's MY address
#this will change!!! 

#not very robust but a start
#there should be the MY address and stuff
def sendTilACK(hexAPI):
	ser.write(array.array('B',hexAPI).tostring())
	#while not listenForACK():
	#	pass


def send(hexAPI):
	sendTilACK(hexAPI)

def listenForACK():
	time.sleep(0.1)
	response = listen()
	print "RESPONSES: "
	for i in response:
		print i
	#ser.write(array.array('B',hexAPI).tostring())
	for i,j in enumerate(response):
		if j[0:5]==ACK:
			print "good"
			return True
			#return response[i+1::]
	return False


def requestAT(string):
        hexAPI=[0x7E, 0x00, 0x04, 0x08, 0x01]
        ser.write(formatAPI(hexAPI, string))
        return listen()

def setAT(string, value):
        hexAPI=[0x7E, 0x00, 0x04, 0x08, 0x01]
        ser.write(formatAPI(hexAPI, string,value))
	return listen()

def requestRemoteAT(string, address):
        hexAPI=[0x7E, 0x00, 0x00, 0x17, 0x01]
        #hexAPI+=address
        hexAPI+=[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF]
	hexAPI+=[0xF0]
	hexAPI+=[0xFF, 0xFE]   #16 bit address
	hexAPI+=[0]
        for i in string:
		hexAPI+=[ord(i)]
	print "Command: " + str(hexAPI)
	tmp = formatAPI(hexAPI)
	ser.write(tmp)
	listen()

def ATCommand(string):
	hexAPI=[0x7E, 0x00, 0x00, 0x08, 0x01]
	
	send(formatAPI(hexAPI,string))
	return listen()


def formatAPI(hexAPI,string=None,value=None):
        if string is not None:
		for i in string:
			hexAPI+=[ord(i)]

        if value is not None:
                hexAPI+=[value]

        hexAPI[2]=len(hexAPI)-3                      
        hexAPI+= [0xFF-sum(hexAPI[3::])&255]
	
	print hexAPI
	return array.array('B',hexAPI).tostring()

def listen():
        received=[]
        limit=3
        tries=0
        while True:
                received += ser.readline()
                tries+=1
                if tries>limit:
                        break

        dec = []
        cur = []
        for i in received:
                cur += [binascii.b2a_qp(i,False,False,False)]
        for i in cur:
                if cmp(i[0],'='):
                        dec+=[ord(i)]
                else:
                        convert = 0
                        for j in range(1,3):
                                
                                if (ord(i[j])>64):
                                        convert += (ord(i[j])-55)
                                else:
                                        convert += (ord(i[j])-48)
                                if j==1:
                                        convert=convert*16
                                        
                        dec+=[convert]
        msgs=[]
        
        for i,j in enumerate(dec):
		try:
                	if j==126:      #if its beginning of msg
                   		length = dec[i+1]*16**2 + dec[i+2] #check how long the msg is
				msgs += [dec[i:3+(i+length+1)] ] #add element to msgs list
		except:
			print "excepted listen()"
	payloads=[]
        #check the checksum
        for i in msgs:
                if i[-1]!=(0xFF-sum(i[3:-1])&255):
                        msgs.remove(i)
                        print "Received corrupted message" 
        return msgs

def listenForPayloads():
	msgs = listen()
	payloads=[]	
	for i in msgs:
		if i[3]==144:
			payloads+= [{'origin': i[4:12], 'payload': i[15:len(i)-1]}]
	return payloads

def mapNetwork():
	nodes = []
        data = requestAT("ND")
        for i in data:
		#data is supposed to be: MY, SH, SL, DB, DB, NI
		try:
			if i[2]==25: #this means it is an ND frame
				print "node found"
				nodes+= [[i[10], i[11], i[12], i[13],i[14], i[15], i[16], i[17]]]
		except:
			print "was not ND response"
	return nodes
def getData(address):
	response = sendHex([7],address)
	return response[0][-6:-1]

def onLights(address):
	sendHex([13],address)

def offLights(address):
	sendHex([14],address)

def onPump(address):
	sendHex([17],address)

def offPump(address):
	sendHex([18],address)

