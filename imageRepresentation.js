class ImageRepresentation {
    image = null;
    shapes = null
    fitness = null

    constructor(filePath) {
        let canvas = document.getElementById("srcImage");
        let ctx = canvas.getContext("2d");
        let img = new Image();
        img.onload = function () {
            canvas.height = 500;
            canvas.width = Math.round(img.width / img.height * canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = filePath + "?" + new Date().getTime();
        img.crossOrigin = ""
        this.image = canvas;
    }

    async newBatch(numGen, type, minLength, maxLength) {
        let shapes = [];
        // let onePercent = num / 100;

        for (let i = 0; i < numGen; i++) {
            // switch (type) {
            //     case 0:
            //         shapes[i] = new Triangle(height, width, parameters);
            //         break;
            //     case 1:
            //         shapes[i] = new Square(height, width, parameters);
            //         break;
            //     case 2:
            //         shapes[i] = new Circle(height, width, parameters);
            //         break;
            //     case 3:
            //         shapes[i] = new RegularTriangle(height, width, parameters);
            //         break;
            shapes[i] = new Triangle(this.image.height, this.image.width, minLength, maxLength);

            // if (i % onePercent == 0)
            // {
            // 	decimal percent = decimal.Divide(i, shapes.Length) * 100;
            // 	Console.SetCursorPosition(0, 0);
            // 	Console.WriteLine("Generating: {0:0}%", percent);
            // }
        }

        this.shapes = shapes
    }

    evaluateFitness(granularity) {
        // function RGBtoXYZ(c) {
        //     for (let i = 0; i < 3; i++) {
        //         if (c[i] <= 0.0405) {
        //             c[i] = c[i] / 12.92;
        //         }
        //         else {
        //             c[i] = Math.pow((c[i] + 0.055) / 1.055, 2.4);
        //         }
        //     }

        //     let M = [[0.4124564, 0.3575761, 0.1804375],
        //     [0.2126729, 0.7151522, 0.0721750],
        //     [0.0193339, 0.1191920, 0.9503041]];

        //     let newC = [0, 0, 0];
        //     for (let i = 0; i < 3; i++) {
        //         let temp = 0.0;
        //         for (let j = 0; j < 3; j++) {
        //             temp += c[j] * M[i][j];
        //         }
        //         newC[i] = temp;
        //     }

        //     return newC;
        // }

        // function XYZtoLab(c) {
        //     let white = [0.95047, 1.0000001, 1.08883];

        //     let epsilon = 216 / 24389.0;
        //     let kappa = 24389 / 27.0;

        //     let r = [0, 0, 0];
        //     for (let i = 0; i < 3; i++) {
        //         r[i] = c[i] / white[i];
        //     }

        //     let f = [0, 0, 0];
        //     for (let i = 0; i < 3; i++) {
        //         if (r[i] > epsilon) {
        //             f[i] = Math.pow(r[i], 1.0 / 3.0);
        //         }
        //         else {
        //             f[i] = (r[i] * kappa + 16) / 116;
        //         }
        //     }

        //     let Lab = [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
        //     return Lab;
        // }

        function rgb2lab(rgb){
            var r = rgb[0] / 255,
                g = rgb[1] / 255,
                b = rgb[2] / 255,
                x, y, z;
          
            r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
            g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
            b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
          
            x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
            y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
            z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
          
            x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
            y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
            z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
          
            return [(116 * x) - 16, 500 * (x - y), 200 * (y - z)]
          }
          function deltaE(labA, labB){
            var deltaL = labA[0] - labB[0];
            var deltaA = labA[1] - labB[1];
            var deltaB = labA[2] - labB[2];
            var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
            var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
            var deltaC = c1 - c2;
            var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
            deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
            var sc = 1.0 + 0.045 * c1;
            var sh = 1.0 + 0.015 * c1;
            var deltaLKlsl = deltaL / (1.0);
            var deltaCkcsc = deltaC / (sc);
            var deltaHkhsh = deltaH / (sh);
            var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
            return i < 0 ? 0 : Math.sqrt(i);
          }

        //evaluate shapes
        let fitness = [];

        let onePercent = this.shapes.length / 100;
        let len = this.shapes.length;
        let imageData = this.image.getContext('2d').getImageData(0, 0, this.image.width, this.image.height).data;
        let width = this.image.width
        let height = this.image.height
        for (let i = 0; i < len; i++) {
            fitness[i] = 0.0;
            let pixels = 0;
            let points = this.shapes[i].iteratePoints(granularity);
            let pointsLen = points.length;
            let color = this.shapes[i].getColor();
            for (let j = 0; j < pointsLen; j++) {
                let pointX = points[j].X
                let pointY = points[j].Y
                if (pointX >= 0 && pointX < width && pointY >= 0 && pointY < height) {
                    let startPoint = (pointX + pointY * width) * 4;
                    let pixelData = imageData.slice(startPoint, startPoint + 3);

                    let c1 = [pixelData[0] / 255.0, pixelData[1] / 255.0, pixelData[2] / 255.0];
                    let c2 = [color[0] / 255.0, color[1] / 255.0, color[2] / 255.0];

                    c1 = rgb2lab(c1)
                    c2 = rgb2lab(c2)
                    
                    // // convert RGB to XYZ
                    // c1 = RGBtoXYZ(c1);
                    // c2 = RGBtoXYZ(c2);

                    // // XYZ to Lab
                    // c1 = XYZtoLab(c1);
                    // c2 = XYZtoLab(c2);

                    

                    // Delta E (CIE 1976)
                    let E = deltaE(c1, c2);//Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2));
                    fitness[i] += E;

                    pixels++;
                }
            }

            fitness[i] = fitness[i] / Math.pow(pixels, .5);
            fitness[i] = 1 / fitness[i];

            if (i % onePercent == 0)
            {
                let percent = i / this.shapes.length * 100;
                console.log("Evaluating: " + Math.round(percent) + "% done")
            }
        }

        //sorts fitness and shapes in parallel
        let list = [];
        for (let j = 0; j < fitness.length; j++)
            list.push({ 'fitness': fitness[j], 'shape': this.shapes[j] });

        //2) sort:
        list.sort(function (a, b) {
            return ((a.fitness < b.fitness) ? -1 : ((a.fitness == b.fitness) ? 0 : 1));
        });

        //3) separate them back out:
        for (let k = 0; k < list.length; k++) {
            fitness[k] = list[k].fitness;
            this.shapes[k] = list[k].shape;
        }
        this.fitness = fitness;
    }

    draw(thisMany, type) {
        let c = document.getElementById("outImage");
        c.width = this.image.width
        c.height = this.image.height
        let ctx = c.getContext("2d");

        //draws the top ranking thisMany shapes, from worst to best
        // int onePercent = thisMany / 100;
        let len = this.shapes.length
        for (let i = len - thisMany; i < len; i++) {
            let points = this.shapes[i].points;
            let brush = this.shapes[i].brush;
            
            // switch (imageType)
            // {
            //     default:
            ctx.fillStyle = "rgb(" + brush[0] + ", " + brush[1] + ", " + brush[2] + ")"//fullColorHex(brush[0], brush[1], brush[2]);
            ctx.beginPath();
            ctx.moveTo(points[0].X, points[0].Y);
            ctx.lineTo(points[1].X, points[1].Y);
            ctx.lineTo(points[2].X, points[2].Y);
            ctx.fill();
            // break;
            // case 2:
            //     drawing.FillEllipse(shape.GetBrush(), ((Circle)shape).GetRectangle());
            //     break;
        }

        // if (i % onePercent == 0)
        // {
        //     decimal percent = decimal.Divide(i, shapes.Length) * 100;
        //     Console.SetCursorPosition(0, 2);
        //     Console.WriteLine("Drawing: {0:0}%", percent);
        // }
    }
}