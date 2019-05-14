class ImageRepresentation {
    image = null;
    shapes = null
    fitness = null

    constructor(filepath) {
        let canvas = document.getElementById("srcImage");
        let ctx = canvas.getContext("2d");
        let img = new Image();
        img.onload = function () {
            canvas.width = img.width / image.height * 800;//img.width;
            canvas.height = 800;//img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = filepath + "?" + new Date().getTime();
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
        function RGBtoXYZ(c) {
            for (let i = 0; i < 3; i++) {
                if (c[i] <= 0.0405) {
                    c[i] = c[i] / 12.92;
                }
                else {
                    c[i] = Math.pow((c[i] + 0.055) / 1.055, 2.4);
                }
            }

            let M = [[0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041]];

            let newC = [];
            for (let i = 0; i < 3; i++) {
                let temp = 0.0;
                for (let j = 0; j < 3; j++) {
                    temp += c[j] * M[i][j];
                }
                newC[i] = temp;
            }

            return newC;
        }

        function XYZtoLab(c) {
            let white = [0.95047, 1.0000001, 1.08883];

            let epsilon = 216 / 24389.0;
            let kappa = 24389 / 27.0;

            let r = [];
            for (let i = 0; i < 3; i++) {
                r[i] = c[i] / white[i];
            }

            let f = [];
            for (let i = 0; i < 3; i++) {
                if (r[i] > epsilon) {
                    f[i] = Math.pow(r[i], 1.0 / 3.0);
                }
                else {
                    f[i] = (r[i] * kappa + 16) / 116;
                }
            }

            let Lab = [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
            return Lab;
        }

        //evaluate shapes
        let fitness = [];

        let onePercent = this.shapes.length / 100;
        let len = this.shapes.length;
        let imageData = this.image.getContext('2d').getImageData(0, 0, this.image.width, this.image.height);

        for (let i = 0; i < len; i++) {
            fitness[i] = 0;
            let pixels = 0;
            let points = this.shapes[i].iteratePoints(granularity);
            let pointsLen = points.length;
            for (let j = 0; j < pointsLen; j++) {
                if (points[j].X >= 0 && points[j].X < this.image.width && points[j].Y >= 0 && points[j].Y < this.image.height) {
                    let startPoint = (points[j].X + points[j].Y * this.image.width) * 4;
                    let pixelData = imageData.data.slice(startPoint, startPoint + 4);
                    let color = this.shapes[i].getColorAtPoint(points[j]);

                    let c1 = [pixelData[0] / 255.0, pixelData[1] / 255.0, pixelData[2] / 255.0];
                    let c2 = [color[0] / 255.0, color[1] / 255.0, color[2] / 255.0];

                    // convert RGB to XYZ
                    c1 = RGBtoXYZ(c1);
                    c2 = RGBtoXYZ(c2);

                    // XYZ to Lab
                    c1 = XYZtoLab(c1);
                    c2 = XYZtoLab(c2);

                    // Delta E (CIE 1976)
                    let E = Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2));
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

        this.fitness = fitness;
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
            var rgbToHex = function (rgb) {
                var hex = Number(rgb).toString(16);
                if (hex.length < 2) {
                    hex = "0" + hex;
                }
                return hex;
            };
            var fullColorHex = function (r, g, b) {
                var red = rgbToHex(r);
                var green = rgbToHex(g);
                var blue = rgbToHex(b);
                return '#' + red + green + blue;
            };
            // switch (imageType)
            // {
            //     default:
            ctx.fillStyle = fullColorHex(brush[0], brush[1], brush[2])
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