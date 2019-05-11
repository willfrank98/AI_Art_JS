window.onload = function()
{
    var clickGenerate = function(event)
    {
        var fileIn = document.querySelector("#fileIn").value
        var type = document.querySelector("#type").value
        var numGen = document.querySelector("#numGen").value
        var numDraw = document.querySelector("#numDraw").value
        var granularity = document.querySelector("#granularity").value
        var minLength = document.querySelector("#minLength").value
        var maxLength = document.querySelector("#maxLength").value
        main(fileIn, type, numGen, numDraw, granularity, minLength, maxLength)
    }

    document.querySelector("#generateButton").addEventListener("click", clickGenerate)
}

function main(fileIn, type, numGen, numDraw, granularity, minLength, maxLength)
{
    
}