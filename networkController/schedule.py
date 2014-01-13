import datetime
import os.path
import os
import pickle

class job:
	def __init__(self, aff, neg, timedelta, updateFunction, start=datetime.datetime.now(), recurFreq=None):
		self.state	= 'off'
		self.start 	= start
		self.end	= self.start+timedelta
		self.affirm	= aff
		self.negate	= neg
		self.update	= updateFunction
		self.length	= timedelta
		self.recurFreq  = recurFreq

	def __repr__(self):
		return "JOB - starts: " + str(self.start) + ", ends: " +str(self.end)
	
	def __str__(self):
		return "JOB- " + "starts: " + str(self.start) + ", ends: " + str(self.end) + ", currently " +self.state

def recurringJob(key,index):
	schedule[key][index].start += schedule[key][index].recurFreq
	schedule[key][index].end = schedule[key][index].start + schedule[key][index].length 


def removeJob(key,index):
	del schedule[key][index]


def updateSchedule():
	try:
		os.remove('./schedule.pkl')
	except:
		pass	
	cur = open('./schedule.pkl', 'wb',-1)
	pickle.dump(schedule, cur)
	cur.close


#import our saved schedule if it exists
try:
	cur = open('./schedule.pkl', 'rb')
	schedule = pickle.load(cur)
	print "loaded schedule"
	print schedule
except:
	schedule={}
	print "creating new schedule"
