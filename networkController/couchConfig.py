import couchdb

# you can point us to a different couch instance here
serverAddress = "http://127.0.0.1:5984"

# initialize the couch server as an object
couch = couchdb.Server(serverAddress)
# some servers require credentials
#couch.resource.credentials = ('apitronics', 'failsafe#apitronicsllc')

