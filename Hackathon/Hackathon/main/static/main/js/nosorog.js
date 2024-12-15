function preprocess(string) {
	let processedString = "";
	let parCount = 0;
	let flagged = false;
	let rememberPar = 0;

	function isChar(element) {
		if (element >= "A" && element <= "Z") return true;
		if (element >= "a" && element <= "z") return true;
		else return false;
	}

	function isNum(element) {
		if (element >= "0" && element <= "9") return true;
		else return false;
	}

	function nextChar(i) {
		for (let j = i + 1; j < string.length; j++) {
			if (string[j] != " " && string[j]) {
				return {
					value: string[j],
					index: j,
				};
			}
		}
		return {
			value: undefined,
			index: string.length - 1,
		};
	}

	function prevChar(i) {
		for (let j = i - 1; j > 0; j--) {
			if (string[j] != " ") {
				return {
					value: string[j],
					index: j,
				};
			}
		}
		return {
			value: undefined,
			index: 0,
		};
	}

	for (let i = 0; i < string.length; i++) {
		if (isChar(string[i]) && isNum(nextChar(i).value)) {
			processedString += string[i];
			processedString += "*";
			continue;
		}
		if (isNum(string[i]) && isChar(nextChar(i).value)) {
			processedString += string[i];
			processedString += "*";
			continue;
		}
		switch (string[i]) {
			case ",":
				processedString += ",";
				let p = nextChar(i);
				if (p.value == "{" || p.value == "(" || p.value == "[") {
					flagged = true;
					rememberPar = parCount;
					console.log(parCount);
					i = p.index;
				}
				break;

			case " ":
				break;
			case "(":
				parCount++;
				processedString += "(";
				break;
			case ")":
				if (flagged) {
					if (rememberPar == parCount) {
						flagged = false;
						break;
					}
				}
				parCount--;
				processedString += ")";
				if (isNum(nextChar(i).value) || isChar(nextChar(i).value))
					processedString += "*"
				break;
			case "[":
				parCount++;
				processedString += "(";
				break;
			case "]":
				if (flagged) {
					if (rememberPar == parCount) {
						flagged = false;
						break;
					}
				}
				if (isNum(nextChar(i).value) || isChar(nextChar(i).value))
					processedString += "*"
				parCount--;
				processedString += ")";
				break;
			case "{":
				parCount++;
				processedString += "(";
				break;
			case "}":
				if (flagged) {
					if (rememberPar == parCount) {
						flagged = false;
						break;
					}
				}
				if (isNum(nextChar(i).value) || isChar(nextChar(i).value))
					processedString += "*"
				parCount--;
				processedString += ")";
				break;
			case "^":
				processedString += "**";
				break;
			case ":":
				processedString += "/";
				break;
			case "<":
				if (nextChar(i).value == "=") {
					processedString += "=";
					i++;
				} else processedString += "<";
				break;
			case ">":
				if (nextChar(i).value == "=") {
					processedString += "=";
					i++;
				} else processedString += ">";
				break;
			case "=":
				if (nextChar(i).value != "=" && prevChar(i).value != "=") {
					processedString += "==";
				}
				break;
			case "!":
				if (
					nextChar(i).value == "=" &&
					nextChar(nextChar(i).index).value == "="
				) {
					processedString += "*fact()==";
					i = nextChar(nextChar(i).index).index;
				} else if (string[i + 1] == "=") {
					processedString += "!=";
					i++;
				} else processedString += "*fact()";
				break;
			default:
				processedString += string[i];
		}
	}

	if (parCount > 0) {
		processedString += ")".repeat(parCount);
	} else if (parCount < 0) {
		processedString = "(".repeat(-parCount) + processedString;
	}
	return processedString;
}
const vvod = document.getElementById("input");
const press = document.getElementById("submit");

press.addEventListener("click", async () => {
    let preprocessedString = preprocess(vvod.value);
    console.log("abc")
    let latexJson = await fetch(`press?input=${encodeURIComponent(preprocessedString)}`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    }).then((r) => r.json());
    output = document.getElementById("originality-output");
    err = document.getElementById("error-originality")
	MathJax.texReset();
	let options = MathJax.getMetricsFor(output);
	output.innerHTML = "";
	if (latexJson.error) {
	        MathJax.tex2chtmlPromise("\\text{Error in the formula}", options).then((node) => {
            output.appendChild(node);
            MathJax.startup.document.clear();
            MathJax.startup.document.updateDocument();
        });
        return;
    }
	for (let i = 0; i < 3; i++){
        MathJax.tex2chtmlPromise(latexJson.matches[i], options).then((node) => {
            output.appendChild(node);
            MathJax.startup.document.clear();
            MathJax.startup.document.updateDocument();
        });
        MathJax.tex2chtmlPromise(latexJson.latexes[i], options).then((node) => {
            output.appendChild(node);
            MathJax.startup.document.clear();
            MathJax.startup.document.updateDocument();
        });
}

});
