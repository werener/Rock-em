addEventListener("DOMContentLoaded", async () => {
    error_output = document.getElementById("error-output")
    error_output.innerHTML = "";
    MathJax.texReset();
    let options_error = MathJax.getMetricsFor(error_output);
    MathJax.tex2chtmlPromise("\\text{Write your formula down below}", options_error).then((node) => {
        error_output.appendChild(node);
        MathJax.startup.document.clear();
        MathJax.startup.document.updateDocument();
    });
});