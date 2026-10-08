module.exports = function (source) {
  // Eliminates `new Function("")` probe in zod under strict CSP to prevent kEvalViolation in Chrome DevTools
  return source.replace(
    /try\s*\{\s*const F = Function;\s*new F\(""\);\s*return true;\s*\}\s*catch\s*\(_\)\s*\{\s*return false;\s*\}/g,
    "return false;",
  );
};
