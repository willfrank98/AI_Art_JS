class Triangle {
    points = []
    brush = [0, 0, 0]

    constructor(height, width, minLength, maxLength) {
        let tempX1 = Math.round(this.random(minLength / 2, width - minLength / 2));
        let tempY1 = Math.round(this.random(minLength / 2, height - minLength / 2));
        let p1 = new Point(tempX1, tempY1);

        let sideLength = this.random(minLength, maxLength);
        let rotation = Math.random() * 2 * Math.PI;

        let shiftX = Math.sin(rotation) * sideLength;
        let shiftY = Math.cos(rotation) * sideLength;
        let tempX2 = Math.round(tempX1 + Math.floor(shiftX));
        let tempY2 = Math.round(tempY1 + Math.floor(shiftY));
        let p2 = new Point(tempX2, tempY2);

        rotation -= (Math.PI / 3) % Math.PI;

        shiftX = Math.sin(rotation) * sideLength;
        shiftY = Math.cos(rotation) * sideLength;
        let tempX3 = Math.round(tempX1 + Math.floor(shiftX));
        let tempY3 = Math.round(tempY1 + Math.floor(shiftY));
        let p3 = new Point(tempX3, tempY3);

        this.points = [p1, p2, p3];

        this.brush = [Math.round(Math.random() * 256), Math.round(Math.random() * 256), Math.round(Math.random() * 256)];
    }

    iteratePoints(granularity) {
        function getRange(y1, y2) {
            if (y1 < y2) {
                return [Math.ceil(y1), Math.floor(y2)];
            }
    
            return [Math.floor(y1), Math.ceil(y2)];
        }
    
        function createFunc(pt1, pt2) {
            let y0 = pt1.Y;
    
            if (y0 == pt2.Y) {
                return x => y0;
            }
    
            let m = (pt2.Y - y0) / (pt2.X - pt1.X);
    
            return x => m * (x - pt1.X) + y0;
        }

        let returnList = [];

        let pt1 = this.points[0];
        let pt2 = this.points[1];
        let pt3 = this.points[2];

        let tmp;

        if (pt2.X < pt1.X) {
            tmp = pt1;
            pt1 = pt2;
            pt2 = tmp;
        }

        if (pt3.X < pt2.X) {
            tmp = pt2;
            pt2 = pt3;
            pt3 = tmp;

            if (pt2.X < pt1.X) {
                tmp = pt1;
                pt1 = pt2;
                pt2 = tmp;
            }
        }

        let baseFunc = createFunc(pt1, pt3);
        let line1Func = pt1.X == pt2.X ? (x => pt2.Y) : createFunc(pt1, pt2);

        for (let x = pt1.X; x < pt2.X; x += granularity) {
            let minMax = getRange(line1Func(x), baseFunc(x));
            let minY = minMax[0];
            let maxY = minMax[1];

            for (let y = minY; y <= maxY; y += granularity) {
                returnList.push(new Point(x, y));
            }
        }

        let line2Func = pt2.X == pt3.X ? (x => pt2.Y) : createFunc(pt2, pt3);

        for (let x = pt2.X; x <= pt3.X; x += granularity) {
            let minMax = getRange(line2Func(x), baseFunc(x));
            let minY = minMax[0];
            let maxY = minMax[1];

            for (let y = minY; y <= maxY; y += granularity) {
                returnList.push(new Point(x, y));
            }
        }

        return returnList;
    }

    getColor() {
        return this.brush;
    }

    random(min, max) {
        let rand = Math.random()
        rand *= (max - min)
        rand += min
        return rand
    }
}