function findKNN(points, k, dMax = 999) {
    var knnOfPoints = [];
    var distancesTable = [];

    // Init distancesTable
    for (var idx = 0; idx < points.length; idx++) {
        distancesTable[idx] = [];
    }

    // Calculate distance between P0 and Pi
    points.forEach((p0, p0Idx) => {
        for (var piIdx = p0Idx; piIdx < points.length; piIdx++) {
            var distance = Math.sqrt(Math.pow(points[piIdx].x - p0.x, 2) + Math.pow(points[piIdx].y - p0.y, 2));
            distancesTable[p0Idx][piIdx] = distance;
            distancesTable[piIdx][p0Idx] = distance;
        }
    });

    // Get k nearest points index
    distancesTable.forEach((dP0, p0Idx) => {
        knnOfPoints[p0Idx] = [];
        dP0Copy = [...dP0];
        dP0Copy.sort();

        for (var idx = 1; idx <= k; idx++) {
            knnOfPoints[p0Idx][idx - 1] = dP0.indexOf(dP0Copy[idx]);
            if ((idx > 1) && (knnOfPoints[p0Idx][idx - 1] == knnOfPoints[p0Idx][idx - 2])) {
                knnOfPoints[p0Idx][idx - 1] = dP0.indexOf(dP0Copy[idx], knnOfPoints[p0Idx][idx - 2] + 1);
            }
        }
    });

    return knnOfPoints;
}

function calAngle(points, knnOfPoints) {
    var angles = [];
    points.forEach((p0, p0Idx) => {
        angles[p0Idx] = [];
        knnOfPoints[p0Idx].forEach((pk, pkIdx) => {
            // alpha 0
            // trục tọa độ trong máy tính có trục y ngươc với trục y trong tọa độ Descarte
            // --> deltaY = y0 - y1
            var deltaX = points[pk].x - p0.x;
            var deltaY = p0.y - points[pk].y;
            angles[p0Idx][pkIdx] = {
                a: Math.atan(deltaY / deltaX) * 180 / Math.PI,
                idx: pk
            }

            // alpha
            if ((deltaX > 0) && (deltaY > 0)) angles[p0Idx][pkIdx].a = angles[p0Idx][pkIdx].a;
			else if ((deltaX > 0) && (deltaY < 0)) angles[p0Idx][pkIdx].a = 360 + angles[p0Idx][pkIdx].a;
			else if ((deltaX < 0) && (deltaY > 0)) angles[p0Idx][pkIdx].a = 180 + angles[p0Idx][pkIdx].a;
            else angles[p0Idx][pkIdx].a = angles[p0Idx][pkIdx].a;
        });
    });

    // Sort angles
    angles.forEach(angle => angle.sort((a0, a1) => a0.a - a1.a));

    return angles;
}

function calAngleDevitation(angles) {
    var angleDevitations = [];
    angles.forEach((ang, p0Idx) => {
        angleDevitations[p0Idx] = [];
        for (var piIdx = 0; piIdx < ang.length - 1; piIdx++) {
            angleDevitations[p0Idx].push({
                angDev: ang[piIdx + 1].a - ang[piIdx].a,
                idx1: ang[piIdx + 1].idx,
                idx0: ang[piIdx].idx
            });
        }
    });

    return angleDevitations;
}

function filterEdgePoints(points, angleDevitations, threshold) {
    var selectedPoints = [];
    points.forEach((p0, p0Idx) => {
        var isSelect = true;
		var sortedAngDev = [...angleDevitations[p0Idx]];
		sortedAngDev.sort((a0, a1) => a0.angDev - a1.angDev)
		if (sortedAngDev[sortedAngDev.length-1].angDev < threshold) {
			isSelect = false;
		}

        if (isSelect) selectedPoints.push(p0);
    });

    return selectedPoints;
}