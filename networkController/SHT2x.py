from math import exp

T = 0


def convertT(uint16_t):
	global T
	T = -46.85 + 175.72*uint16_t/2**16
	return T


def convertRH(uint16_t):
	betaW =17.62
	lambdaW = 243.12
	
	global T
	betaI = 22.46
	lambdaI = 272.62

	RH = -6+125*uint16_t/float(2**16)
	#this is RH above ice??
	#RH *= exp(betaW*T/lambdaW+T)/exp(betaI*T/lambdaI*T)
	return RH
