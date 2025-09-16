const fs = require("fs");

const t1 = fs.readFileSync("first.json");
const t2 = fs.readFileSync("second.json");

main(t1);
main(t2);

function main(rawData) {
  const data = JSON.parse(rawData);

  const k = data.keys.k;

  // Decode (x, y) pairs from JSON
  let points = [];
  function parseBigIntFromBase(str, base) {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    const baseBigInt = BigInt(base);
    let result = 0n;
    for (let i = 0; i < str.length; i++) {
      const digit = chars.indexOf(str[i].toLowerCase());
      if (digit === -1 || digit >= base) {
        throw new Error(`Invalid digit '${str[i]}' for base ${base}`);
      }
      result = result * baseBigInt + BigInt(digit);
    }
    return result;
  }

  for (const key in data) {
    if (key === "keys") continue;
    const x = BigInt(key);
    const base = parseInt(data[key].base);
    const yString = data[key].value;
    const y = parseBigIntFromBase(yString, base);
    points.push({ x, y });
  }

  points.sort((a, b) => (a.x < b.x ? -1 : 1));
  const selectedPoints = points.slice(0, k);

  // Perform Lagrange Interpolation at x = 0
  function lagrangeAtZero(points) {
    let result = 0n;

    for (let i = 0; i < points.length; i++) {
      const xi = points[i].x;
      const yi = points[i].y;

      let num = 1n;
      let den = 1n;

      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;

        const xj = points[j].x;
        num *= -xj;
        den *= xi - xj;
      }
      const term = (yi * num) / den;
      result += term;
    }

    return result;
  }

  const constantTerm = lagrangeAtZero(selectedPoints);
  console.log("Secret (constant term c) =", constantTerm.toString());
}
