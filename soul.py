from collections import defaultdict
import json
import sys

nRow  = (int)(str(sys.argv[1]))
nMove = (int)(str(sys.argv[2]))
dr  = [-1, -1,  0, 0, 1, 1]
dc  = [-1,  0, -1, 1, 0, 1]

def triangleNumber(i):
	return i * (i + 1) // 2

nDot 	= triangleNumber(nRow);
dp 		= defaultdict(lambda:-1)
dpMove 	= defaultdict(int)

def countActiveBit(num):
	return bin(num)[2:].count('1');

def getIdx(n1, n2):
	return triangleNumber(n1) + n2

def getNextState(i, j, num):
	currIdx = getIdx(i,j)
	res = []

	#check if curr dot selected
	if (num & (1 << currIdx)):
		return res

	#select current row and col (i, j)
	currNum = (num | 1 << currIdx) 
	res.append(currNum)


	for k in range(len(dr)):
		#backup currNum
		bak = currNum

		for m in range(1, nMove):
			currI = i + (m * dr[k])
			currJ = j + (m * dc[k])

			#Unreachable dot
			if currI < 0 or currJ < 0 or currJ > currI or currI >= nRow:
				break

			idx = getIdx(currI, currJ)

			#check if dot is selected
			if not (currNum & (1 << idx)):
				currNum |= (1 << idx)
				res.append(currNum)
			else:
				break

		currNum = bak
	return res


def generateState(num):
	activeBit = countActiveBit(num)

	# return winning or losing state (base case)
	if activeBit >= nDot - 1:
		return (activeBit != nDot - 1)

	if dp[num] != -1:
		return dp[num]

	winState =  0;
	winMove  = -1;

	for i in range(nRow):
		for j in range(i + 1):
			nextState = getNextState(i, j, num)

			for state in nextState:
				isWin = not generateState(state)
				winState |= isWin

				if winMove == -1:
					winMove = state;
				elif(isWin == 1):
					winMove = state

	dpMove[num] = winMove 
	dp[num]     = winState 
	
	return winState

generateState(0)

with open("soul.js", "w") as f:
    f.write("let winningMove = " + json.dumps(dpMove) + "\n")
