import pickle
import os


a = {}

def pickleLoad():
        lastPush=pickle.load(open("lastPush.pkl","rb"))
        return lastPush

def pickleLoadRain():
        lastRainPush=pickle.load(open("lastRain.pkl","rb"))
        return lastRainPush

def cleanUp(filePath):
        try:
                os.remove(filePath)
        except:
                pass

def pickleSave(data,filePath):
        cleanUp(filePath)
        pickle.dump(data,open(filePath, "wb"))

pickleSave(a, "a.pkl")

print a

a={3}

pickleSave(a, "a.pkl")

print pickle.loads(open("a.pkl","rb"))
