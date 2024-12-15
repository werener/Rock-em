from idlelib.rpc import request_queue
from django.shortcuts import render
from django.db.models.fields import return_None
from pytexit import py2tex
from json import load, dump, loads
from django.contrib.staticfiles import finders
from django.http import JsonResponse, HttpResponse
from .models import Formula
from fnmatch import fnmatch

#renders

def main(request):
    return render(request, 'main/main.html')

def snake(request):
    return render(request, 'main/zmeika.html')

def show_all(request):
    return render(request, 'main/database.html')

################################################

#DB insertion through POST request
def DBinsert(request):
    givenString = loads(request.body)["input"]
    try:
        resultingString = py2tex(givenString, False, False)[2:-2:]
        params = getParameters(givenString)
        Formula.objects.create(initialUserInput=givenString,
                                              latexCode=resultingString,
                                              parameters=params
                                              )
        return HttpResponse(status=201)
    except Exception as e:
        return HttpResponse(status=400)


#GET request + pytexit
def fromPythonToLatex(request):
    givenString = request.GET.get("input")
    #print(givenString, ">>")
    try:
        resultingString = py2tex(givenString, False, False)[2:-2:]
        return JsonResponse({"request": givenString,
                             "result": resultingString})
    except Exception as e:
        #print(givenString, e)
        # raise e
        return JsonResponse({"error": True})

# GET request + DB check for matches + error output
def buttonPressResponse(request):
    firstMatch, secondMatch, thirdMatch = (0,0,0) # biggest matches
    firstLatex, secondLatex, thirdLatex = "","",""

    givenString = request.GET.get("input")
    bd = Formula.objects.all()
    givenParameters = getParameters(givenString)
    allKeys = givenParameters.keys()
    for obj in bd:
        currentParameters = obj.parameters
        if obj.initialUserInput == givenString:
            currentMatch = 100
        else:
            currentMatch = compareParameters(currentParameters, givenParameters)
        if currentMatch > firstMatch:
            firstMatch, secondMatch, thirdMatch = currentMatch, firstMatch, secondMatch
            firstLatex, secondLatex, thirdLatex = obj.latexCode, firstLatex, secondLatex
        elif currentMatch > secondMatch:
            firstMatch, secondMatch, thirdMatch = firstMatch, currentMatch, secondMatch
            firstLatex, secondLatex, thirdLatex = firstLatex, obj.latexCode, secondLatex
        elif currentMatch > thirdMatch:
            firstMatch, secondMatch, thirdMatch = firstMatch, secondMatch, currentMatch
            firstLatex, secondLatex, thirdLatex = firstLatex, secondLatex, obj.latexCode

    try:
        resultingString = py2tex(givenString, False, False)[2:-2:]
        return JsonResponse({"result": resultingString,
                             "matches": list(map(strPercent, [firstMatch, secondMatch, thirdMatch])),
                             "latexes": [firstLatex, secondLatex, thirdLatex]
                             })
    except Exception as e:
        return JsonResponse({"error": True})


# getting parameters for matching formulas
def getParameters(func):
    count, parCount, m = 0, 0, 0
    loweredFunc = func.lower()
    counts = {
        'unitStepCount': 0,
        'diracDeltaCount': 0,
        'factorialCount': 0,
        'reverseHyperbolicTrigCount': 0,
        'hyperbolicTrigCount': 0,
        'productCount': 0,
        'summationCount': 0,
        'limitCount': 0,
        'integrationCount': 0,
        'derivativeCount': 0,
        'partialCount': 0,
        'reverseTrigCount': 0,
        'logCount': 0,
        'maxDepth': 0,
        'trigCount': 0,
        'absCount': 0,
        'exponentCount': 0,
        'rootCount': 0
    }
    allChecks = ['fact',
                 'cos', 'sin', 'tg', 'tan', 'ctg', 'cot',
                 'cosh', 'sinh', 'tgh', 'tanh', 'ctgh', 'coth',
                 'arccos', 'acos', 'arcsin', 'asin', 'atan', 'arctan', 'arctg', 'atg', 'arcctg', 'actg', 'arccot', 'acot',
                 'arcsinh', 'asinh', 'arccosh', 'acosh', 'arctanh', 'atanh', 'arctgh', 'atgh', 'arcctgh', 'actgh', 'arccoth', 'acoth',
                 'derivative', 'diff',
                 'partial', 'pardev', 'delta',
                 'dirac',
                 'unitstep', 'unit_step',
                 'rt', 'root', 'surd',
                 'log', 'ln', 'lg',
                 'abs',
                 'exp',
                 'int',
                 'lim',
                 'sum',
                 'prod']

    allEntries = aho_corasick(loweredFunc, allChecks)

    for entry in allEntries.values():
        if count < 1:
            counts['factorialCount'] += len(entry)
        elif count < 7:
            counts['trigCount'] += len(entry)
        elif count < 13:
            counts['hyperbolicTrigCount'] += len(entry)
        elif count < 25:
            counts['reverseTrigCount'] += len(entry)
        elif count < 37:
            counts['reverseHyperbolicTrigCount'] += len(entry)
        elif count < 39:
            counts['derivativeCount'] += len(entry)
        elif count < 42:
            counts['partialCount'] += len(entry)
        elif count < 43:
            counts['diracDeltaCount'] += len(entry)
        elif count < 45:
            counts['unitStepCount'] += len(entry)
        elif count < 48:
            counts['rootCount'] += len(entry)
        elif count < 51:
            counts['logCount'] += len(entry)
        elif count < 52:
            counts['absCount'] += len(entry)
        elif count < 53:
            counts['exponentCount'] += len(entry)
        elif count < 54:
            counts['integrationCount'] += len(entry)
        elif count < 55:
            counts['limitCount'] += len(entry)
        elif count < 56:
            counts['summationCount'] += len(entry)
        elif count < 57:
            counts['productCount'] += len(entry)
        count += 1
    for i in loweredFunc:
        if i == "(":
            parCount += 1
        elif i == ")":
            parCount -= 1
        m = max(m, parCount)
    counts['maxDepth'] = m
    #print(counts)
    return counts

# comparing formulas
def compareParameters (param1, param2):
    matchRatio = 0
    # min / abs(x-y)
    weights = {
        'unitStepCount': 0.140,
        'diracDeltaCount': 0.140,
        'factorialCount': 0.060,
        'reverseHyperbolicTrigCount': 0.084,
        'hyperbolicTrigCount': 0.040,
        'productCount': 0.100,
        'summationCount': 0.080,
        'limitCount': 0.060,
        'integrationCount': 0.060,
        'derivativeCount': 0.060,
        'partialCount': 0.100,
        'reverseTrigCount': 0.024,
        'logCount': 0.008,
        'maxDepth': 0.021,
        'trigCount': 0.006,
        'absCount': 0.008,
        'exponentCount': 0.006,
        'rootCount': 0.003
    }
    for key in param1.keys():
        p1, p2 = int(param1[key]), int(param2[key])
        matchRatio += weights[key] * (0.1 + min(p1, p2) / (1 + abs(p1 - p2)))

    return round(matchRatio * 100, 1)

# Aho-Corasic algorithm
class TrieNode:
    def __init__(self):
        self.children = {}
        self.output = []
        self.fail = None
def build_automaton(keywords):
    root = TrieNode()

    for keyword in keywords:
        node = root
        for char in keyword:
            node = node.children.setdefault(char, TrieNode())
        node.output.append(keyword)

    queue = []
    for node in root.children.values():
        queue.append(node)
        node.fail = root
    while queue:
        current_node = queue.pop(0)
        for key, next_node in current_node.children.items():
            queue.append(next_node)
            fail_node = current_node.fail
            while fail_node and key not in fail_node.children:
                fail_node = fail_node.fail
            next_node.fail = fail_node.children[key] if fail_node else root
            next_node.output += next_node.fail.output

    return root
def aho_corasick(text, keywords):
    root = build_automaton(keywords)
    result = {keyword: [] for keyword in keywords}
    current_node = root
    for i, char in enumerate(text):
        while current_node and char not in current_node.children:
            current_node = current_node.fail

        if not current_node:
            current_node = root
            continue
        current_node = current_node.children[char]
        for keyword in current_node.output:
            result[keyword].append(i - len(keyword) + 1)

    return result
def strPercent(a):
    return str(a) + "\%"

