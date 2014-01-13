#!/bin/python

def parseTemperature(raw):
	temperature = raw*0.01 - 39.7
	return temperature

def parseHumidity(raw):
        humidity = - 4 + 0.0405*raw - 0.0000028 * raw**2
	return humidity

def correctHumidity(temperature, humidity, rawHumidity):
	correctedHumidity = (temperature - 25.0 ) * (0.01 + 0.00008 * rawHumidity) + humidity
	return correctedHumidity;
 
#def parse (raw):
#	temperature = raw['temperature']*0.01 - 39.7
#	humidity = -4+0.045*raw['humidity']-0.0000028 * raw['humidity']**2
#	return {'temperature': temperature, 'humidity': humidity}

	
