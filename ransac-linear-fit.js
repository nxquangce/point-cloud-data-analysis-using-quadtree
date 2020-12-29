

function linearFit() {
    
    function Model() {
        return {a:0, b:0};
    }
    
    function estimateModel(sample) {
        console.log("estimateModel:", sample);
        var a = (sample[1].y - sample[0].y)/(sample[1].x - sample[0].x);
        var b = sample[0].y - a *sample[0].x;
        
        return {
            a: a,
            b: b
        }
    }
    
    function* generateSamples(n) {
        var x0,x1;
        var res = {};
        for(x0 = 0; x0 < n-1; x0++) {
            for(x1 = x0+1; x1 < n; x1++) {
                yield [x0,x1];
            }
        }
    }
    
    
    function sampleError(point, model) {
        console.log("sampleError:", point, model);
        
        // the model, in Ax + By + C == 0
        // y = ax + b
        var A = model.a;
        var B = -1; 
        var C = model.b
        
        return Math.abs(A*point.x + B * point.y + C)/ Math.sqrt(A*A + B*B);
    }
    
    function refine(inliers, model) {
        console.log("refine:", inliers, model);
        // we just need the inliers for a linear regression
        var n = inliers.length;
        var sx = inliers.reduce(function(a,b){return a + b.x}, 0);
        var sxx = inliers.reduce(function(a,b){return a + b.x * b.x}, 0);
        var sxy = inliers.reduce(function(a,b){return a +  b.x * b.y}, 0);
        var sy = inliers.reduce(function(a,b){return a + b.y}, 0);
        
        var a = (n*sxy - sx*sy)/(n*sxx - sx*sx);
        var b = (sy - b*sx)/n;
        
        console.log(n,sx,sxx,sxy,sy,b,a,n*sxy, sx*sy, n*sxx, sx*sx);
        
        return {
            a:a,
            b:b
        };
    }
    
    function adjustScore(score, model){
        
        return score;
    }
    
    return {
        
        k: 2,
        Model: Model,
        estimateModel: estimateModel,
        sampleError: sampleError,
        refine: refine,
        generateSamples: generateSamples
    } 
    
}

module.exports = linearFit();