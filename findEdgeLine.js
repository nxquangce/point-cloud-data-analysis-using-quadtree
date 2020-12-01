/**
 * Chia mặt phẳng thành các vùng nhỏ theo tập các điểm đã lọc
 * @param {*} tree Quadtree đã xây dựng
 * @param {*} points Tập các điểm đã lọc ở bước trước
 * @param {*} numOfHCell số cột
 * @param {*} numOfVCell số hàng
 */
function splitRegion(tree, points, numOfHCell = 8, numOfVCell = 8) {
    var minX = tree.bounds.width, maxX = 0, minY = tree.bounds.height, maxY = 0;

    // Tìm giới hạn vùng chứa điểm
    points.forEach(point => {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
    });

    // Chia nhỏ vùng và tìm tập các điểm thuộc vùng đã chia nhỏs
    var cells = [];

    // > Khởi tạo cell
    var cellWidth = (maxX - minX) / numOfHCell;
    var cellHeight = (maxY - minY) / numOfVCell;
    for (var cellVIdx = 0; cellVIdx < numOfVCell; cellVIdx++) {
        for (var cellHIdx = 0; cellHIdx < numOfHCell; cellHIdx++) {
            var cell = {
                id: '' + cellVIdx + ', ' + cellHIdx,
                left: minX + cellHIdx * cellWidth,
                right: minX + (cellHIdx + 1) * cellWidth,
                top: minY + cellVIdx * cellHeight,
                bottom: minY + (cellVIdx + 1) * cellHeight,
                points: []
            }
            cells.push(cell);
        }
    }

    // > Thêm điểm vào cell
    points.forEach(point => {
        cells.some(cell => {
            var isInCell = (point.x >= cell.left) && (point.x <= cell.right) && (point.y >= cell.top) && (point.y <= cell.bottom);
            if (isInCell) {
                cell.points.push(point);
                return true;
            }
            else return false;
        })
    });

    return cells;
}

/**
 * Tìm 2 đầu mút của đường thẳng y = ax + b trong cell
 * @param {*} cell 
 * @param {*} a 
 * @param {*} b 
 */
function findLineNodes(cell, a, b) {
    var p1 = { x: 0, y: 0 }, p2 = { x: 0, y: 0 };

    // Đầu mút 1 ở biên trái
    var yLeft = a * cell.left + b;
    if ((yLeft >= cell.top) && (yLeft <= cell.bottom)) {
        p1.x = cell.left;
        p1.y = yLeft;
    }
    else {  // Đầu mút 1 không nằm ở biên trái
        var xTop = (cell.top - b) / a;
        var xBottom = (cell.bottom - b) / a;

        if ((xTop >= cell.left) && (xTop <= cell.right)) {
            // Đầu mút 1 ở biên trên
            p1.x = xTop;
            p1.y = cell.top;
        }
        else if (((p1.x == 0) && (p1.y == 0)) && ((xBottom >= cell.left) && (xBottom <= cell.right))) {
            // Đầu mút 1 ở biên dưới
            p1.x = xBottom;
            p1.y = cell.bottom;
        }
    }

    // Đầu mút 2 ở biên phải
    var yRight = a * cell.right + b;
    if ((yRight >= cell.top) && (yRight <= cell.bottom)) {
        p2.x = cell.right;
        p2.y = yRight;
    }
    else {  // Đầu mút 2 không ở biên phải
        var xTop = (cell.top - b) / a;
        var xBottom = (cell.bottom - b) / a;

        if ((xTop >= cell.left) && (xTop <= cell.right)) {
            // Đầu mút 2 ở biên trên
            p2.x = xTop;
            p2.y = cell.top;
        }
        else if (((p2.x == 0) && (p2.y == 0)) && ((xBottom >= cell.left) && (xBottom <= cell.right))) {
            // Đầu mút 2 ở biên dưới
            p2.x = xBottom;
            p2.y = cell.bottom;
        }
    }

    return [p1, p2];
}

/**
 * Tìm đường hồi quy của cell bằng phương pháp bình phương cực tiểu
 * @param {*} cell 
 */
function leastSquares(cell) {
    var sumX = 0, sumY = 0, sumX2 = 0, sumXY = 0;
    cell.points.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumX2 += point.x * point.x;
        sumXY += point.x * point.y;
    });

    var numOfPoints = cell.points.length;
    var a = (numOfPoints * sumXY - sumX * sumY) / (numOfPoints * sumX2 - sumX * sumX);
    var b = (sumY - a * sumX) / numOfPoints;

    var [p1, p2] = findLineNodes(cell, a, b);

    var line = {
        cell: cell,
        a: a,
        b: b,
        p1: p1,
        p2: p2
    }

    return line;
}

/**
 * Điều chỉnh các đường thẳng cho liền nhau
 * @param {*} rawLines 
 */
function adjustLines(rawLines) {
    var connectCells = [];
    var lines = [];
    var rawLinesCopy = [...rawLines];
    rawLinesCopy.forEach(rLine0 => {
        rawLinesCopy.forEach(rLine1 => {
            var isConnectLR = (rLine0.cell.right == rLine1.cell.left) && (
                (rLine0.cell.top == rLine1.cell.bottom) ||
                (rLine0.cell.bottom == rLine1.cell.top) ||
                (rLine0.cell.top == rLine1.cell.top));
            var isConnectTB = (rLine0.cell.bottom == rLine1.cell.top) && (
                // (rLine0.cell.right == rLine1.cell.left) ||
                // (rLine0.cell.left == rLine1.cell.right) ||
                (rLine0.cell.left == rLine1.cell.left));

            if (isConnectLR) {
                connectCells.push({
                    line0: rLine0,
                    line1: rLine1,
                    connectEdge: 0
                });

                // // Add new line by adjust line 0
                // var yRight0 = (rLine0.a * rLine0.cell.right + rLine0.b);
                // var yLeft1 = (rLine1.a * rLine1.cell.left + rLine1.b);
                // var p1 = rLine0.p1;
                // var p2 = {
                //     x: rLine0.cell.right,
                //     y: (yRight0 + yLeft1) / 2
                // }
                // var line = {
                //     p1: p1,
                //     p2: p2
                // }
                // lines.push(line);

                // // Adjust line 1
                // rLine1.p1.y = (yRight0 + yLeft1) / 2;
                // rLine1.p1.x = rLine1.cell.left;
            }
            // else lines.push({
            //     p1: rLine0.p1,
            //     p2: rLine0.p2
            // });

            if (isConnectTB) connectCells.push({
                line0: rLine0,
                line1: rLine1,
                connectEdge: 1
            });
        });
    });

    var checkSame = function (obj1, obj2) {
        return JSON.stringify(obj1) == JSON.stringify(obj2);
    }

    var toRemoveIdxs = [];
    connectCells.forEach((pairConnectedCells0, pcc0Idx) => {
        var countConnect = 1;
        connectCells.forEach((pairConnectedCells1, pcc1Idx) => {
            if (checkSame(pairConnectedCells0.line0, pairConnectedCells1.line0)) {
                if (!checkSame(pairConnectedCells0.line1, pairConnectedCells1.line1)) {
                    countConnect += 1;

                    var cellConnect0 = 0;
                    var cellConnect1 = 0;
                    connectCells.forEach(checkPair => {
                        if (JSON.stringify(checkPair.line0) == JSON.stringify(pairConnectedCells0.line1)) {
                            cellConnect0 += 1;
                        }
                        if (JSON.stringify(checkPair.line0) == JSON.stringify(pairConnectedCells1.line1)) {
                            cellConnect1 += 1;
                        }
                    });

                    var toRemovePccIdx = (cellConnect1 > cellConnect0) ? pcc0Idx : pcc1Idx;
                    if (!toRemoveIdxs.includes(toRemovePccIdx)) toRemoveIdxs.push(toRemovePccIdx);
                }
            }
        });
    });

    console.log(toRemoveIdxs)
    toRemoveIdxs.forEach((toRemoveIdx, idx) => {
        connectCells.splice(toRemoveIdx - idx, 1);
    });

    console.log(connectCells);

    connectCells.forEach(pairCells => {
        var rLine0 = pairCells.line0;
        var rLine1 = pairCells.line1;

        if (pairCells.connectEdge == 0) {
            // Left - Right
            // Adjust line 0
            var yRight0 = (rLine0.a * rLine0.cell.right + rLine0.b);
            var yLeft1 = (rLine1.a * rLine1.cell.left + rLine1.b);
            rLine0.p2.x = rLine0.cell.right;
            rLine0.p2.y = (yRight0 + yLeft1) / 2

            // Adjust line 1
            rLine1.p1.y = (yRight0 + yLeft1) / 2;
            rLine1.p1.x = rLine1.cell.left;
        }
        else {
            // Top - Bottom
            // Adjust line 0
            var xBottom0 = (rLine0.cell.bottom - rLine0.b) / rLine0.a;
            var xTop1 = (rLine1.cell.top - rLine1.b) / rLine1.a;
            rLine0.p2.x = (xBottom0 + xTop1) / 2;
            rLine0.p2.y = rLine0.cell.bottom

            // Adjust line 1
            rLine1.p1.x = (xBottom0 + xTop1) / 2;
            rLine1.p1.y = rLine1.cell.top;
        }

    });

    return rawLinesCopy;
}