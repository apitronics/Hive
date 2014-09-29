#How to parse arguments and variables on the command line

#and argument parsing library!
import argparse

import json

#we create a parsing machine, Parsley
parsley = argparse.ArgumentParser(description='Parses User Input on 0x8000: Bee Preferences')

parsley.add_argument('integers', metavar='N', type=str, nargs='*', help='an integer for the accumulator')


def bytify(number, length):
        ret = ""
        for i in range(1, length*2):
                if number < (2**4)*i:
                        ret += "0"

        ret += str(hex(number)[2::])
        return ret


def flip(userInput):
    userInput = userInput[0]
    userInput = json.loads(userInput)

    output = ""

    sampleRate = userInput["sampleRate"]
    # print "sample rate is now " + str(sampleRate)
    output += bytify(sampleRate, 2)

    logRate = userInput["logRate"]
    # print "log rate is now " + str(logRate)
    output += bytify(logRate, 2)

    sleep = userInput["sleep"] == "true"
    output += bytify(sleep, 1)

    # if sleep:
    #     print "this device sleeps"
    # else:
    #     print "this device is an insomniac"

    return output


parsley.add_argument('--sum', dest='accumulate', action='store_const', const=sum, default=flip, help='sum the integers (default: find the max)')

#arguments get processed
args = parsley.parse_args()
    #parse_args() returns an object with attributes: integer & accumulate

#here we call on the integerate attribute which forks
print args.accumulate(args.integers)
    #either it will return sum() if --sum was passed on CL
    #or it will return max()
