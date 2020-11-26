var myTree;
var dataFromFile = [];
var level = 1;
var highestLevel = 0;

function FindMinMax(taodo, data, type) {
    var result = 0;
    if (taodo == "x") {
        //MIN MAX X
        if (type == "min") {
            var minValueX = 9999999;
            for (var i = 0; i < data.length; i++) {
                var object = data[i];
                var x = parseInt(object.x);

                if (x < minValueX) {
                    minValueX = x;
                }

            }

            result = minValueX;
        } else {
            var maxValueX = 0;
            for (var i = 0; i < data.length; i++) {
                var object = data[i];
                var x = parseInt(object.x);

                if (x > maxValueX) {
                    maxValueX = x;
                }

            }

            result = maxValueX;
        }

    } else {
        //MIN MAX Y
        if (type == "min") {
            var minValueY = 9999999;
            for (var i = 0; i < data.length; i++) {
                var object = data[i];
                var y = parseInt(object.y);

                if (y < minValueY) {
                    minValueY = y;
                }

            }

            result = minValueY;
        } else {
            var maxValueY = 0;
            for (var i = 0; i < data.length; i++) {
                var object = data[i];
                var y = parseInt(object.y);

                if (y > maxValueY) {
                    maxValueY = y;
                }

            }

            result = maxValueY;
        }

    }

    return result;
}

function drawLevel_1(dataFromFile) {
    //Tìm max - min của x từ bộ dữ liệu
    var minValueX = FindMinMax("x", dataFromFile, "min");
    var maxValueX = FindMinMax("x", dataFromFile, "max");

    //Tìm max - min của y từ bộ dữ liệu
    var minValueY = FindMinMax("y", dataFromFile, "min");
    var maxValueY = FindMinMax("y", dataFromFile, "max");

    window.minX = minValueX;
    window.minY = minValueY;

    window.maxX = maxValueX;
    window.maxY = maxValueY;

}

window.requestAnimFrame = function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();


/*
 * our objects will be stored here
 */
var myObjects = [];


/*
 * our "hero", aka the mouse cursor.
 * He is not in the quadtree, we only use this object to retrieve objects from a certain area
 */
var myCursor = {
    x: 0,
    y: 0,
    width: 28,
    height: 28
};

var isMouseover = false;

var ctx = document.getElementById('canvas').getContext('2d');

var cnt_total = document.querySelector('#cnt_total'),
    cnt_cand = document.querySelector('#cnt_cand'),
    cnt_perc = document.querySelector('#cnt_perc');


function mainQTree(dataFromFile) {
    window.myTree = new Quadtree({
        x: window.minX,
        y: window.minY,
        width: window.maxX,
        height: window.maxY
    }, 2, 10);
}

function handleAddPoint(rect) {

    myObjects.push(rect);

    const node = myTree.insert(rect);

    updateTotal();
}


/*
 * clear the tree
 */
function handleClear(myObjects, myTree) {

    //empty our array
    myObjects = [];

    //empty our quadtree
    //myTree.clear();

    //update total counter
    updateTotal();
}


/*
 * draw Quadtree nodes
 */
function drawQuadtree(node) {

    var bounds = node.bounds;
    //no subnodes? draw the current node
    if (node.nodes.length === 0) {
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);


    //has subnodes? drawQuadtree them!
    } else {
        for (var i = 0; i < node.nodes.length; i = i + 1) {
            drawQuadtree(node.nodes[i]);
        }
    }
};

/*
 * draw all objects
 */
function drawObjects() {

    var obj;

    for (var i = 0; i < myObjects.length; i = i + 1) {

        obj = myObjects[i];

        if (obj.check) {
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(obj.x, obj.y, 5, 5); //obj.width, obj.height);
        } else {
            ctx.strokeStyle = 'white';
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        }
    }


};

function loop() {

    var candidates = [];

    ctx.clearRect(0, 0, window.maxX, window.maxY);

    //reset myObjects check flag
    for (var i = 0; i < myObjects.length; i = i + 1) {

        // myObjects[i].check = false;
    }

    drawQuadtree(myTree);
    drawObjects();

    // window.requestAnimFrame(loop);
};

/**
 * Update total added points
 */
function updateTotal() {
    cnt_total.innerHTML = myObjects.length;
}

function updateCandidatesInfo(candidates) {
    cnt_cand.innerHTML = candidates.length;
    if (!myObjects.length) return;
    cnt_perc.innerHTML = Math.round((candidates.length / myObjects.length) * 100);
}

/**
 * Draw all point retrieved by quadtree.retrieve
 */
var drawRetrieve = function () {
    const point = {
        x: parseInt(document.getElementById("x").value),
        y: parseInt(document.getElementById("y").value),
        width: 1,
        height: 1
    }
    var retrivedPoints = myTree.retrieve(point);
    for (var j = 0; j < retrivedPoints.length; j++) {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(obj.x, obj.y, 5, 5); //obj.width, obj.height);
    }

    console.log(retrivedPoints)
    return retrivedPoints;
}

/**
 * Check if an array contains the object or not
 */
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}

/**
 * Find and draw edge nodes
 */
var findBoundary = function (tree) {
    var edgeNodes = [];         // node biên
    var insideNodes = []        // node được chọn (bao gồm node biên)
    var emptyNodes = [];        // node empty
    var outsideNodes = [];      // node empty và node không được chọn
    // var outsideChildNodes = []; // node có con là empty

    var findInsideNodes = function (node, index = 0, parent = null) {
        if (node.nodes.length == 0) { //Đây là leaf node

            var cdt = true;
            // cdt = !containsObject(parent, outsideChildNodes)
            cdt = cdt
                && node.level > 4       // ngưỡng loại có node có mật độ point thấp (các node ít bị chia nhỏ/ node có bậc thấp)
            if (node.objects.length > 0) {
                if (cdt)
                    insideNodes.push(node);
                else {
                    outsideNodes.push(node);
                    // outsideChildNodes.push(parent);
                }
            }
            else {
                emptyNodes.push(node);
                outsideNodes.push(node);
                // outsideChildNodes.push(parent);
            }
        }
        else {
            // nếu không phải node lá thì duyệt tiếp các node con
            node.nodes.forEach((childNode, index) => findInsideNodes(childNode, index, node));
        }
    }

    findInsideNodes(tree);

    // loại các node không được chọn nằm ở bên trong (các node không được chọn có 8 node xung quanh được chọn)
    var removeNoiseInsideNodes = function () {
        outsideNodes.forEach((node, index) => {
            var nodeT = node.bounds.y;
            var nodeL = node.bounds.x
            var nodeR = node.bounds.x + node.bounds.width;
            var nodeB = node.bounds.y + node.bounds.height;
            var isRemove = false;
            var numOfBondNode = 0;

            insideNodes.forEach(inNode => {
                var inT = inNode.bounds.y;
                var inL = inNode.bounds.x
                var inR = inNode.bounds.x + inNode.bounds.width;
                var inB = inNode.bounds.y + inNode.bounds.height;

                if (((nodeT == inB) || (nodeB == inT)) && ((nodeL >= inL) && (nodeR <= inR))    // top + bot
                    || ((nodeL == inR) || (nodeR == inL)) && ((nodeT >= inT) && (nodeB <= inB))    // left + right
                    || ((nodeT == inB) && (nodeL == inR))                                            // bot right
                    || ((nodeB == inT) && (nodeR == inL))                                            // top left
                    || ((nodeT == inB) && (nodeR == inL))                                            // bot left
                    || ((nodeB == inT) && (nodeL == inR))                                            // top right
                ) {
                    // isRemove = true;
                    numOfBondNode += 1;
                }
            });

            if (numOfBondNode > 4) {
                insideNodes.push(node);
                outsideNodes.splice(index, 1);
            }
        });
    }
    // thực hiện loại bỏ đến khi số lượng các node bên trong và bên ngoài không đổi nữa
    var preInsideNodesLength = 0;
    var curInsideNodesLength = insideNodes.length;
    while (curInsideNodesLength != preInsideNodesLength) {
        removeNoiseInsideNodes();
        preInsideNodesLength = curInsideNodesLength;
        curInsideNodesLength = insideNodes.length;
    }

    // tìm node biên trong các node bên trong
    insideNodes.forEach(node => {
        var nodeT = node.bounds.y;
        var nodeL = node.bounds.x
        var nodeR = node.bounds.x + node.bounds.width;
        var nodeB = node.bounds.y + node.bounds.height;
        var isSelect = false;

        outsideNodes.forEach(outNode => {
            var outT = outNode.bounds.y;
            var outL = outNode.bounds.x
            var outR = outNode.bounds.x + outNode.bounds.width;
            var outB = outNode.bounds.y + outNode.bounds.height;

            if (((nodeT == outB) || (nodeB == outT)) && ((nodeL >= outL) && (nodeR <= outR))    // top + bot
                || ((nodeL == outR) || (nodeR == outL)) && ((nodeT >= outT) && (nodeB <= outB))    // left + right
                || ((nodeT == outB) && (nodeL == outR))                                            // bot right
                || ((nodeB == outT) && (nodeR == outL))                                            // top left
                || ((nodeT == outB) && (nodeR == outL))                                            // bot left
                || ((nodeB == outT) && (nodeL == outR))                                            // top right
            ) {
                // console.log(nodeT, outB);
                isSelect = true;
            }
        });

        if (isSelect) edgeNodes.push(node);
    });

    // outsideChildNodes.forEach(node => {
    //     ctx.fillStyle = '#666666';
    //     ctx.fillRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
    // });

    insideNodes.forEach(node => {
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
    });
    console.log('\n>> Các node thuộc về bên trong');
    console.log(insideNodes);

    edgeNodes.forEach(node => {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
    });

    outsideNodes.forEach(node => {
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
    });

    drawQuadtree(myTree);
    drawObjects();

    return edgeNodes;
}