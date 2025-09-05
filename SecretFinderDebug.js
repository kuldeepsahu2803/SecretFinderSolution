// SecretFinder.js
// Assignment solution in JavaScript (Node.js)

function parseShare(x, base, value) {
    return { x: parseInt(x), y: parseInt(value, base) };
}

// Lagrange interpolation at x = 0
function lagrangeInterpolation(shares) {
    let secret = 0;

    for (let i = 0; i < shares.length; i++) {
        let xi = shares[i].x;
        let yi = shares[i].y;

        let term = yi;
        for (let j = 0; j < shares.length; j++) {
            if (i !== j) {
                let xj = shares[j].x;
                term *= (0 - xj) / (xi - xj);
            }
        }
        secret += term;
    }
    return Math.round(secret);
}

// Main function to solve assignment
function findSecret(jsonInput) {
    const n = jsonInput.keys.n;
    const k = jsonInput.keys.k;

    // Step 1: decode all shares
    let shares = [];
    for (let key in jsonInput) {
        if (key !== "keys") {
            shares.push(parseShare(key, jsonInput[key].base, jsonInput[key].value));
        }
    }

    // Step 2: generate all subsets of size k
    function getCombinations(arr, k) {
        if (k === 0) return [[]];
        if (arr.length === 0) return [];
        let [first, ...rest] = arr;

        let withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
        let withoutFirst = getCombinations(rest, k);

        return withFirst.concat(withoutFirst);
    }

    let subsets = getCombinations(shares, k);

    // Step 3: calculate secrets for each subset
    let results = {};
    for (let subset of subsets) {
        let secret = lagrangeInterpolation(subset);
        results[secret] = (results[secret] || 0) + 1;
    }

    // Step 4: find majority secret
    let secret = Object.entries(results).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    return { secret: parseInt(secret), allResults: results };
}

// ----------------------------
// Run on sample test case
// ----------------------------
const sample = {
    "keys": { "n": 4, "k": 3 },
    "1": { "base": "10", "value": "4" },
    "2": { "base": "2", "value": "111" },
    "3": { "base": "10", "value": "12" },
    "6": { "base": "4", "value": "213" }
};

const result = findSecret(sample);
console.log("Final Secret:", result.secret);
console.log("All Subset Results:", result.allResults);
