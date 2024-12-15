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
				else {
				    processedString += "==";
				    i = nextChar(i).index;
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

let latexVariable = "";
const input = document.getElementById("input");
const latexOutput = document.getElementById("main-output");

// check for inputs
input.addEventListener("input", async () => {
	let preprocessedString = preprocess(input.value);
	let latexJson = await fetch(`latex?input=${encodeURIComponent(preprocessedString)}`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	}).then((r) => r.json());

    // notify if there's an error in the formula

	if (latexJson.error) {
        error_output = document.getElementById("error-output")
		error_output.innerHTML = "";
        MathJax.texReset();
        let options_error = MathJax.getMetricsFor(error_output);
        MathJax.tex2chtmlPromise("\\text{Wrong formula syntax}", options_error).then((node) => {
            error_output.appendChild(node);
            MathJax.startup.document.clear();
            MathJax.startup.document.updateDocument();
	    });
	return;
	}
	else {
	    error_output1 = document.getElementById("error-output")
		error_output1.innerHTML = "";
        MathJax.texReset();
        let options_error1 = MathJax.getMetricsFor(error_output1);
        MathJax.tex2chtmlPromise("\\text{Write your formula down below}", options_error1).then((node) => {
            error_output1.appendChild(node);
            MathJax.startup.document.clear();
            MathJax.startup.document.updateDocument();
	    });
	}

	// LaTeX output
	output = document.getElementById("main-output");
	output.innerHTML = "";
	MathJax.texReset();
	let options = MathJax.getMetricsFor(output);
	MathJax.tex2chtmlPromise(latexJson.result, options).then((node) => {
		output.appendChild(node);
		MathJax.startup.document.clear();
		MathJax.startup.document.updateDocument();
	});
	return;
});

