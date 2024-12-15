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

async function callBack() {
    //console.log(typeof input.value)
	let preprocessedString = preprocess(input.value);
    //console.log(encodeURIComponent(preprocessedString))
	let latexJson = await fetch(`latex?input=${encodeURIComponent(preprocessedString)}`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	}).then((r) => r.json());
    //console.log(latexJson, latexJson.result)
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


	output = document.getElementById("main-output");
	output.innerHTML = "";
	MathJax.texReset();
	let options = MathJax.getMetricsFor(output);
	MathJax.tex2chtmlPromise(latexJson.result, options).then((node) => {
		output.appendChild(node);
		MathJax.startup.document.clear();
		MathJax.startup.document.updateDocument();
	});
}

function placeCursor(input, len, right = 1) {
        const length = input.value.length;
        input.focus();
        input.setSelectionRange(length - len, length - right);
}

function undint() {
    let input = document.querySelector("input");
    input.value = input.value + "integral(f(x),x)";
    callBack();
    input.focus();
    placeCursor(input, 7);
}

function defint() {
    let input = document.querySelector("input");
    input.value = input.value + "integral(f(x),{x,a,b})";
    callBack();
    input.focus();
    placeCursor(input, 13);
}


function lim() {
    let input = document.querySelector("input");
    input.value = input.value + "lim(f(x),x,inf)";
    callBack();
    input.focus();
    placeCursor(input, 11);
}


function derivative1() {
    let input = document.querySelector("input");
    input.value = input.value + "d(y,x)";
    callBack();
    input.focus();
    placeCursor(input, 4);
}


function partial1() {
    let input = document.querySelector("input");
    input.value = input.value + "partial(y,x)";
    callBack();
    input.focus();
    placeCursor(input, 4);
}

function sqrt() {
    let input = document.querySelector("input");
    input.value = input.value + "sqrt(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}

function cbrt() {
    let input = document.querySelector("input");
    input.value = input.value + "cbrt(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function root() {
    let input = document.querySelector("input");
    input.value = input.value + "root(n,x)";
    callBack();
    input.focus();
    placeCursor(input, 4);
}


function sum() {
    let input = document.querySelector("input");
    input.value = input.value + "sum(i,{i,a,b})";
    callBack();
    input.focus();
    placeCursor(input, 10);
}


function product() {
    let input = document.querySelector("input");
    input.value = input.value + "product(i,{i,a,b})";
    callBack();
    input.focus();
    placeCursor(input, 10);
}


function ln() {
    let input = document.querySelector("input");
    input.value = input.value + "ln(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function log() {
    let input = document.querySelector("input");
    input.value = input.value + "log(a,b)";
    callBack();
    input.focus();
    placeCursor(input, 4);
}


function lg() {
    let input = document.querySelector("input");
    input.value = input.value + "lg(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function exp() {
    let input = document.querySelector("input");
    input.value = input.value + "exp(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function derivative2() {
    let input = document.querySelector("input");
    input.value = input.value + "d(y,x,x)";
    callBack();
    input.focus();
    placeCursor(input, 6);
}


function partial2() {
    let input = document.querySelector("input");
    input.value = input.value + "partial(f,x,y)";
    callBack();
    input.focus();
    placeCursor(input, 6);
}


function abs() {
    let input = document.querySelector("input");
    input.value = input.value + "abs(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function inf() {
    let input = document.querySelector("input");
    input.value = input.value + "inf";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function deltabig() {
    let input = document.querySelector("input");
    input.value = input.value + "Delta";
    callBack();
    input.focus();
    placeCursor(input, 0,0);
}


function empty() {
    let input = document.querySelector("input");
    input.value = input.value + "empty()";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function gamma_function() {
    let input = document.querySelector("input");
    input.value = input.value + "Gamma(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function beta_function() {
    let input = document.querySelector("input");
    input.value = input.value + "Beta(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function unit_step() {
    let input = document.querySelector("input");
    input.value = input.value + "unitstep(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function dirac_delta() {
    let input = document.querySelector("input");
    input.value = input.value + "dirac(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function sin() {
    let input = document.querySelector("input");
    input.value = input.value + "sin(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function cos() {
    let input = document.querySelector("input");
    input.value = input.value + "cos(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function tg() {
    let input = document.querySelector("input");
    input.value = input.value + "tg(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function ctg() {
    let input = document.querySelector("input");
    input.value = input.value + "ctg(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function arcsin() {
    let input = document.querySelector("input");
    input.value = input.value + "arcsin(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function arccos() {
    let input = document.querySelector("input");
    input.value = input.value + "arccos(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function arctg() {
    let input = document.querySelector("input");
    input.value = input.value + "arctg(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function arcctg() {
    let input = document.querySelector("input");
    input.value = input.value + "arcctg(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function sinh() {
    let input = document.querySelector("input");
    input.value = input.value + "sinh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function cosh() {
    let input = document.querySelector("input");
    input.value = input.value + "cosh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function tgh() {
    let input = document.querySelector("input");
    input.value = input.value + "tgh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function ctgh() {
    let input = document.querySelector("input");
    input.value = input.value + "ctgh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function asinh() {
    let input = document.querySelector("input");
    input.value = input.value + "asinh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function acosh() {
    let input = document.querySelector("input");
    input.value = input.value + "acosh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function atagh() {
    let input = document.querySelector("input");
    input.value = input.value + "atagh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function actgh() {
    let input = document.querySelector("input");
    input.value = input.value + "actgh(x)";
    callBack();
    input.focus();
    placeCursor(input, 2);
}


function degree() {
    let input = document.querySelector("input");
    input.value = input.value + "degree(90)";
    callBack();
    input.focus();
    placeCursor(input, 3);
}


function yota() {
    let input = document.querySelector("input");
    input.value = input.value + "iota";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function pi() {
    let input = document.querySelector("input");
    input.value = input.value + "pi";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function theta() {
    let input = document.querySelector("input");
    input.value = input.value + "theta";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function phi() {
    let input = document.querySelector("input");
    input.value = input.value + "phi";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function omega() {
    let input = document.querySelector("input");
    input.value = input.value + "omega";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function epsilon() {
    let input = document.querySelector("input");
    input.value = input.value + "epsilon";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function alpha() {
    let input = document.querySelector("input");
    input.value = input.value + "alpha";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function beta() {
    let input = document.querySelector("input");
    input.value = input.value + "beta";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function gamma() {
    let input = document.querySelector("input");
    input.value = input.value + "gamma";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function delta() {
    let input = document.querySelector("input");
    input.value = input.value + "delta";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function epsilon() {
    let input = document.querySelector("input");
    input.value = input.value + "epsilon";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function eta() {
    let input = document.querySelector("input");
    input.value = input.value + "eta";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function phi() {
    let input = document.querySelector("input");
    input.value = input.value + "phi";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function theta() {
    let input = document.querySelector("input");
    input.value = input.value + "theta";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function thetabig() {
    let input = document.querySelector("input");
    input.value = input.value + "Theta";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function kappa() {
    let input = document.querySelector("input");
    input.value = input.value + "kappa";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function lambda() {
    let input = document.querySelector("input");
    input.value = input.value + "lambda";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function mu() {
    let input = document.querySelector("input");
    input.value = input.value + "mu";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}

function sigma() {
    let input = document.querySelector("input");
    input.value = input.value + "sigma";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}
function sigmabig() {
    let input = document.querySelector("input");
    input.value = input.value + "Sigma";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function ksi() {
    let input = document.querySelector("input");
    input.value = input.value + "xi";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function ksibig() {
    let input = document.querySelector("input");
    input.value = input.value + "Xi";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function ro() {
    let input = document.querySelector("input");
    input.value = input.value + "rho";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function tau() {
    let input = document.querySelector("input");
    input.value = input.value + "tau";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function psi() {
    let input = document.querySelector("input");
    input.value = input.value + "psi";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function psibig() {
    let input = document.querySelector("input");
    input.value = input.value + "Psi";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function omega() {
    let input = document.querySelector("input");
    input.value = input.value + "omega";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}


function omegabig() {
    let input = document.querySelector("input");
    input.value = input.value + "Omega";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}



// change layouts
function elements1() {
    document.getElementById("elements1").style.display = "block";
    document.getElementById("elements2").style.display = "none";
    document.getElementById("greek").style.display = "none";
}
function elements2() {
    document.getElementById("elements1").style.display = "none";
    document.getElementById("elements2").style.display = "block";
    document.getElementById("greek").style.display = "none";
}
function greek() {
    document.getElementById("elements1").style.display = "none";
    document.getElementById("elements2").style.display = "none";
    document.getElementById("greek").style.display = "block";
}

// presets
function preset1() {
    let input = document.querySelector("input");
    input.value = input.value + "ax^2 + bx + c";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}

function preset2() {
    let input = document.querySelector("input");
    input.value = input.value + "2*pi*k";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}

function preset3() {
    let input = document.querySelector("input");
    input.value = input.value + "exp(i*theta) = cos(theta) + i * sin(theta)";
    callBack();
    input.focus();
    placeCursor(input, 0, 0);
}

// copy
function copyToClipboard(text) {
    let dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

input = document.getElementById("input");
cop = document.getElementById("copy");
cop.addEventListener("click", async () => {
let preprocessedString = preprocess(input.value);
let latexJson = await fetch(`latex?input=${encodeURIComponent(preprocessedString)}`, {
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
}).then((r) => r.json());
console.log(latexJson)
if (latexJson.error) {
        copy1 = document.getElementById("copy-output")
		copy1.innerHTML = "";
        MathJax.texReset();
        let options_copy1 = MathJax.getMetricsFor(copy1);
        copy1.style.color = "red";
        MathJax.tex2chtmlPromise("\\times", options_copy1).then((node) => {
            copy1.appendChild(node);
            MathJax.startup.document.clear();
            MathJax.startup.document.updateDocument();
	    });
	return;
	}
	else {
	    copyToClipboard(latexJson.result)
	    copy2 = document.getElementById("copy-output")
		copy2.innerHTML = "";
        MathJax.texReset();
        copy2.style.color = "green";
        let options_copy2 = MathJax.getMetricsFor(copy2);
        MathJax.tex2chtmlPromise("\\checkmark", options_copy2).then((node) => {
            copy2.appendChild(node);
            MathJax.startup.document.clear();
            MathJax.startup.document.updateDocument();
	    });
	}
});


