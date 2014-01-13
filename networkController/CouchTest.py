import couchdb

couch = couchdb.Server('https://apitronicsllc.cloudant.com/')

couch.resource.credentials = ('apitronicsllc', 'failsafe#apitronics@llc')

db = couch['farm1']


