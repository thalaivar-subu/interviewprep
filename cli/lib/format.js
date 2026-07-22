'use strict';

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function wrap(code) {
  return (s) => (useColor ? `[${code}m${s}[0m` : s);
}

module.exports = {
  bold: wrap(1),
  cyan: wrap(36),
  green: wrap(32),
  yellow: wrap(33),
  dim: wrap(2),
};
