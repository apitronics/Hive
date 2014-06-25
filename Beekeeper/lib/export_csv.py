import collections
import json
import requests
import sys

from datetime import datetime
from six import string_types
from pytz import timezone

beeId = sys.argv[1]

utc = timezone('UTC')
tz = utc

t1 = datetime(1970, 1, 1, 0, 00, 00)
t2 = datetime(2100, 12, 31, 23, 59, 00)

maxPoints = 4096


def convertCouchView(req):
    #load the get request as raw
    raw = json.loads(req.content)
    #convert it into a non unicode python dict
    result = convert(raw[u'rows'])
    return result


def convertCouchDoc(req):
    #load the get request as raw
    raw = json.loads(req.content)
    #convert it into a non unicode python dict
    return convert(raw)


def convert(data):
    if isinstance(data, string_types):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data

##################################################################################
#
# The first part of this script just takes the configuration files
# and imports them into nice python structures
#
##################################################################################
server = 'http://127.0.0.1:5984/'
config = 'config/'
url = server + config + '_design/api/_view/SensorsByBeeId?include_docs=true&key="' + beeId + '"'
r = requests.get(url)

#convert result into a nice python object
result = convertCouchView(r)

sensors = []
firmwareDocs = {}
for sensor in result:
    firmwareUUID = sensor['doc']['sensorDefinitionFirmwareUUID'][2:]

    if firmwareUUID not in firmwareDocs:
        firmwareDocUUIDInteger = int(str(firmwareUUID), 16)
        url = server + config + '/_design/api/_view/SensorDefinitionsByFirmwareUUIDInteger?include_docs=true&key=' + str(firmwareDocUUIDInteger)
        doc = json.loads(requests.get(url).content)[u'rows'][0][u'doc']

        firmwareDocs[firmwareUUID] = {'name': doc[u'name'], 'units': doc[u'units'].encode('ascii', 'ignore')}

    name = sensor['doc']['name']
    sensorBeeId = sensor['doc']['beeId']
    _id = sensor['doc']['_id']
    units = firmwareDocs[firmwareUUID]['units']

    sensor = {'id': _id, 'name': name, 'beeId': sensorBeeId, 'units': units}
    sensors += [sensor]

##################################################################################
#
# Now that we know all about the bees and sensors,
# the rest of the script selects relevant sensors
# and downloads data for a specific time range
#
##################################################################################


def getEpoch(naiveDatetime, tz):
    t = tz.localize(naiveDatetime)
    t0 = utc.localize(datetime(1970, 1, 1))
    return int((t-t0).total_seconds())


def getReadableAndLocal(epoch):
    # pick our format
    fmt = '%Y-%m-%d %H:%M:%S %Z%z'
    utc_dt = utc.localize(datetime.utcfromtimestamp(epoch))
    local = tz.normalize(utc_dt.astimezone(tz))
    return local.strftime(fmt)


def output(data):
    timestamps = sorted(data[sensors[0]['id']])
    for key in timestamps:
        # this will print time in normal human format given the timezone above
        humanReadable = getReadableAndLocal(key)
        row = [humanReadable, key]

        for sensor in sensors:
            record = data[sensor['id']].get(key)
            row += [record]

        print(",".join(('' if x is None else str(x)) for x in row))


t1 = str(getEpoch(t1, tz))
t2 = str(getEpoch(t2, tz))

cols = []

for sensor in sensors:
    cols += [sensor['name'] + " (" + sensor['units'] + ")"]

print("Date,Epoch," + ",".join(cols))

maxPointsPerSensor = int(maxPoints / len(sensors))

startkey = t1

# process datapoints by chunks
while startkey != t2:
    data = {}

    for sensor in sensors:
        _id = sensor['id']
        url = server + 'sensor_' + _id + '/_all_docs?include_docs=true&startkey="' + str(startkey) + '"&endkey="' + str(t2) + '"' + '&limit=' + str(maxPointsPerSensor)

        sensorData = convertCouchView(requests.get(url))

        data[_id] = {}

        for x in sensorData:
            data[_id][int(x['key'])] = x['doc']['d']

    output(data)

    if sensorData:
        startkey = int(sensorData[-1]['key']) + 1
        if startkey > t2:
            break
    else:
        break
