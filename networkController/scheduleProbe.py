import datetime
import Xbee
import pickle
import os.path
import os
from schedule import *

now = datetime.datetime.now()

d1 = datetime.date(2013, 1, 18)
t1 = datetime.time(0,0)

d2 = datetime.date(2013, 1, 18)
t2 = datetime.time(6,0)

l_length = datetime.timedelta(hours=6)
l_start = datetime.datetime.combine(d1,t1) 
l_recurFreq = datetime.timedelta(hours=12)

p_length = datetime.timedelta(minutes=2)
p_start = datetime.datetime.combine(d2,t2)
p_recurFreq = datetime.timedelta(hours = 12)

#def __init__(self, aff, neg, timedelta, updateFunction, start=datetime.datetime.now(), recurFreq=None):
def loadJobs():
	try:
		schedule[(56,102)]+=[job(Xbee.onLights, Xbee.offLights, l_length, recurringJob, l_start, l_recurFreq)]
	except:
		schedule[(56,102)]=[job(Xbee.onLights, Xbee.offLights, l_length, recurringJob, l_start, l_recurFreq)]
	schedule[(56,102)]+=[job(Xbee.onPump, Xbee.offPump, p_length, recurringJob, p_start, p_recurFreq)]	
	updateSchedule()


print schedule



