import logging
import logging.handlers
import sys

# Logging configuration. Use defaults, get this out of a config file,
# from the command line, etc. according to what you want.
CONFIG = {
    'file': '/root/apitronicsnetwork.log',
    'max_bytes': 1024 * 1024, # 1 MB
    'max_oldfiles': 3,
}

def setup_logging(log_to_console=True):
    # Make a log formatter. This specifies how log messages should get
    # printed. I like to see lots of information.
    log_formatter = logging.Formatter('[%(asctime)s] '
                                      '%(levelname)s:%(filename)s:%(lineno)d: '
                                      '%(message)s',
                                      '%Y-%m-%d %I:%M:%S %p')

    # Make some log handlers. These are Python objects which decide
    # what happens when the program wants to log something.
    #
    # Deployment handler: log to a file with a maximum size, to avoid
    # filling up the disk. Keep a few old log files around for backup.
    deploy_handler = logging.handlers.RotatingFileHandler(
        CONFIG['file'],
        maxBytes=CONFIG['max_bytes'],
        backupCount=CONFIG['max_oldfiles'])
    deploy_handler.setLevel(logging.DEBUG)
    # Debug handler: print log messages to standard out.
    debug_handler = logging.StreamHandler(stream=sys.stdout)
    

    # Tell the handlers how we want messages printed -- if we leave
    # this out, the default settings are fine, too.
    debug_handler.setFormatter(log_formatter)
    deploy_handler.setFormatter(log_formatter)

    # The root logger is the "global" logger you get when you use the
    # top-level logging module calls (logging.info(), logging.error(),
    # etc.).
    root_logger = logging.getLogger()
    # This controls verbosity.
    root_logger.setLevel(logging.DEBUG)
    # Have the root logger always log to file, and also log to stdout
    # when desired.
    root_logger.addHandler(deploy_handler)
    if log_to_console:
        root_logger.addHandler(debug_handler)

def main():
    setup_logging(log_to_console=True)

    logging.info('-' * 10 + ' program started ' + '-' * 10)

if __name__ == '__main__':
    main()

import traceback

try:
	import couch
	import couchPut
	import Xbee
	import time	
	import wunderground
	import os

	lastCall = 0
	lastPush = 0	

	while True:
		if False:
		#if time.time()-lastCall>30:
			try:
				wunderground.wundergroundPush()
			except:
				logging.error('Wunderground push failed')
				logging.error(traceback.format_exc())
				quit()
			lastCall = time.time()
		for i in Xbee.listenForPayloads():
			try:
				payload = i['payload'][1::]
				payload_ID = i['payload'][0]
			except:
				payload = False
				payload_ID = False
				logging.info("a bad payload")
			i['payload']=payload
			if payload_ID==0xAB:
				logging.info("Sensor Defs: " + str(payload))
				couchPut.putSensors(i)
			elif payload_ID==0x49:
				timeStamp = time.time()
				try:
					logging.info('Readings received from: ' + couch.getBeeDoc(i['origin'])['name'])	
				except:
					logging.error('Readings received from unknown bee: ' +str(i['origin']))			
				try:
					couchPut.putRecords(i,timeStamp)
				except:
					logging.error('Failed at putting records into CouchDB')
					logging.error(traceback.format_exc())
					quit()
					#restart couchdb?
				
				try:
					couch.replicateReadings()
				except:
					logging.error("Replication failed")
					logging.error(traceback.format_exc())
			else:
				logging.error('Unhandled payload: {' + str(payload_ID) +':'+ str(payload)+'}')				
				#print i['origin']
				#print couch.bees[0]['address']
				#Xbee.sendHex([1,2,3],i['origin'])

	
except:	
	logging.error(traceback.format_exc())
