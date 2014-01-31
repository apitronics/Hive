function findPerpendicularDistance(point, line) {
    var pointX = point[1],
        pointY = point[0],
        lineStart = {
            x: line[0][0],
            y: line[0][1]
        },
        lineEnd = {
            x: line[1][0],
            y: line[1][1]
        },
        slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x),
        intercept = lineStart.y - (slope * lineStart.x),
        result;
    result = Math.abs(slope * pointX - pointY + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
    return result;
}

function douglasPeucker(points, epsilon) {
    var i,
        maxIndex = 0,
        maxDistance = 0,
        perpendicularDistance,
        leftRecursiveResults, rightRecursiveResults,
        filteredPoints;
    // find the point with the maximum distance
    for (i = 2; i < points.length - 1; i++) {
        perpendicularDistance = findPerpendicularDistance(points[i], [points[1], points[points.length - 1]]);
        if (perpendicularDistance > maxDistance) {
            maxIndex = i;
            maxDistance = perpendicularDistance;
        }
    }
    // if max distance is greater than epsilon, recursively simplify
    if (maxDistance >= epsilon) {
        leftRecursiveResults = douglasPeucker(points.slice(1, maxIndex), epsilon);
        rightRecursiveResults = douglasPeucker(points.slice(maxIndex), epsilon);
        filteredPoints = leftRecursiveResults.concat(rightRecursiveResults);
    } else {
        filteredPoints = points;
    }
    return filteredPoints;
}


var points = [
    [1, 10],
    [2, 15],
    [3, 25],
    [3.25, 25],
    [3.5, 30],
    [3.75, 35],
    [4, 45],
    [5, 55],
    [6, 45],
    [7, 25],
    [8, 15],
    [9, 10]
]

results = douglasPeucker(points, .1)
console.log(results.length)
console.log(results)

results = douglasPeucker(points, 35)
console.log(results.length)
console.log(results)

