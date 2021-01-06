from collections import defaultdict
import json
import sys

nRow  = (int)(str(sys.argv[1]))
nMove = (int)(str(sys.argv[2]))
dr  = [-1, -1,  0, 0, 1, 1]
dc  = [-1,  0, -1, 1, 0, 1]

def triangleNumber(i):
	return i * (i + 1) // 2

# a state is a losing state if ALL possible action lead to winning state
# a state is a winning state if ONE possible action lead to losing state
nDot = triangleNumber(nRow);
dp = defaultdict(lambda:-1)
dpMove = defaultdict(int)

def countActiveBit(num):
	binary = bin(num)[2:]
	count = 0
	for i in binary:
		count += i == '1'
	return count

def getIdx(n1, n2):
	return triangleNumber(n1) + n2

def getNextState(i, j, num):
	currIdx = getIdx(i,j)
	currNum = (num | 1 << currIdx) 
	res = []

	if (num & (1 << currIdx)):
		return res

	res.append(currNum)

	for k in range(len(dr)):
		bak = currNum
		for m in range(1, nMove):
			currI = i + (m * dr[k])
			currJ = j + (m * dc[k])

			if currI < 0 or currJ < 0 or currJ > currI or currI >= nRow:
				break

			idx = getIdx(currI, currJ)
			if not (currNum & (1 << idx)):
				currNum |= (1 << idx)
				res.append(currNum)
			else:
				break
		currNum = bak
	return res


def generateState(num):
	if countActiveBit(num) == nDot - 1: 
		return 0

	if dp[num] != -1:
		return dp[num]

	winState = 0;
	winMove = -1;
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
	dp[num] = winState 
	return winState

generateState(0)

# idx = 0
# for i in range(nDot):
# 	generateState(1 << i)

with open("soul.js", "w") as f:
    f.write("let winningMove = " + json.dumps(dpMove) + "\n")
