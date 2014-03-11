import json
import unicodedata
import requests
 
#get all dbs
response = requests.get('http://127.0.0.1:5984/_all_dbs').text
#import json object as python array
raw = json.loads(response)
#clean it up
db = []
for i in raw:
         db+=[i.encode('ascii', 'ignore')]
#result is all the databases!
#print db
 
headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
 
for i in db:
         print requests.post('http://127.0.0.1:5984/' + i + '/_compact', headers=headers).text
