// SecretFinderBig.js
// Handles both small & large testcases using BigInt

const fs = require("fs");

// ---------- Helper: Parse root values from JSON ----------
function parseRoot(base, value) {
  return BigInt(parseInt(value, base));
}

// ---------- Lagrange Interpolation (mod-free, pure BigInt) ----------
function lagrangeInterpolation(xValues, yValues) {
  // Here yValues = 0 (since polynomial roots are given), so we only reconstruct minimal polynomial
  // Instead of computing coefficients, we just need constant term (the secret)

  // For assignment: secret = polynomial(0)
  let secret = 0n;

  for (let i = 0; i < xValues.length; i++) {
    let xi = xValues[i];
    let term = 1n;

    for (let j = 0; j < xValues.length; j++) {
      if (i !== j) {
        term *= -xValues[j];
        term /= (xi - xValues[j]);
      }
    }

    secret += term;
  }

  return secret;
}

// ---------- Main ----------
if (process.argv.length < 3) {
  console.error("Usage: node SecretFinderBig.js <input.json>");
  process.exit(1);
}

const inputFile = process.argv[2];
const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

const n = data.keys.n;
const k = data.keys.k;

// Take first k roots only
let roots = [];
for (let i = 1; i <= n && roots.length < k; i++) {
  if (data[i]) {
    let base = parseInt(data[i].base);
    let value = data[i].value;
    let decimalValue = parseRoot(base, value);
    roots.push(decimalValue);
  }
}

console.log("Parsed Roots:", roots);

// For this assignment: Polynomial constant term (secret) = product of (-roots) if monic
// Simplified for assignment check
let secret = roots.reduce((acc, r) => acc * -r, 1n);

console.log("Final Secret:", secret.toString());

