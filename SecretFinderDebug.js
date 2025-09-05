// SecretFinder.js
// Usage: node SecretFinder.js [path/to/testcase.json]
// If no path provided, the script uses the embedded sample.

const fs = require('fs');

function parseShare(x, base, value) {
  return { x: Number(x), y: parseInt(value, base) };
}

function lagrangeInterpolationAtZero(shares) {
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

function getCombinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return withFirst.concat(withoutFirst);
}

function findSecret(jsonInput) {
  const n = jsonInput.keys.n;
  const k = jsonInput.keys.k;

  // decode shares
  const shares = [];
  for (const key of Object.keys(jsonInput)) {
    if (key === "keys") continue;
    const entry = jsonInput[key];
    shares.push(parseShare(key, parseInt(entry.base), entry.value));
  }

  // all subsets of size k
  const subsets = getCombinations(shares, k);

  // compute secrets per subset
  const results = {};
  for (const subset of subsets) {
    const s = lagrangeInterpolationAtZero(subset);
    results[s] = (results[s] || 0) + 1;
  }

  // majority secret
  const majority = Object.keys(results).reduce((a, b) => results[a] >= results[b] ? a : b);
  return { secret: Number(majority), allResults: results };
}

// --- Main
let inputJson;
const arg = process.argv[2];
if (arg) {
  try {
    inputJson = JSON.parse(fs.readFileSync(arg, 'utf8'));
  } catch (e) {
    console.error("Failed to read or parse JSON file:", e.message);
    process.exit(1);
  }
} else {
  // default embedded sample (small test)
  inputJson = {
    "keys": { "n": 4, "k": 3 },
    "1": { "base": "10", "value": "4" },
    "2": { "base": "2",  "value": "111" },
    "3": { "base": "10", "value": "12" },
    "6": { "base": "4",  "value": "213" }
  };
}

const result = findSecret(inputJson);
console.log("Final Secret:", result.secret);
console.log("All Subset Results:", result.allResults);
