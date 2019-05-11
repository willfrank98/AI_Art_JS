var image;

window.onload = function () {
    var clickLoad = function (event) {
        var fileIn = document.querySelector("#fileIn").value;
        image = new ImageRepresentation(fileIn);
    }
    document.querySelector("#loadButton").addEventListener("click", clickLoad);

    var clickGenerate = function (event) {
        var type = document.querySelector("#type").value
        var numGen = Number(document.querySelector("#numGen").value)
        var numDraw = Number(document.querySelector("#numDraw").value)
        var granularity = Number(document.querySelector("#granularity").value)
        var minLength = Number(document.querySelector("#minLength").value)
        var maxLength = Number(document.querySelector("#maxLength").value)
        main(type, numGen, numDraw, granularity, minLength, maxLength)
    }
    document.querySelector("#generateButton").addEventListener("click", clickGenerate)
}

function main(type, numGen, numDraw, granularity, minLength, maxLength) {
    image.newBatch(numGen, type, minLength, maxLength)
    image.evaluateFitness(granularity)
    image.draw(numDraw, type)
}