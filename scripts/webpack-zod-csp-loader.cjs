const PROBE_PATTERN =
  /try\s*\{\s*const F = Function;\s*new F\(""\);\s*return true;\s*\}\s*catch\s*\(_\)\s*\{\s*return false;\s*\}/g;

/**
 * Eliminates the `new Function("")` dynamic code evaluation probe in Zod under strict CSP.
 * This prevents CSP `script-src` eval violations (kEvalViolation) from firing in browsers / Lighthouse.
 *
 * Requirements:
 * - Only modifies the exact `allowsEval` probe in Zod util files.
 * - Fails closed if the expected probe pattern is not found (e.g., after a Zod upgrade),
 *   preventing silent regressions that would trigger production CSP violations.
 */
module.exports = function (source) {
  if (typeof source !== "string") {
    throw new TypeError("[webpack-zod-csp-loader] Expected source to be a string");
  }

  if (!PROBE_PATTERN.test(source)) {
    const resource = this && this.resourcePath ? this.resourcePath : "unknown module";
    throw new Error(
      `[webpack-zod-csp-loader] Failed to locate 'allowsEval' Function probe in ${resource}. ` +
        "Fail-closed: Zod utility implementation may have changed. Update the loader pattern to match.",
    );
  }

  // Reset regex index after test()
  PROBE_PATTERN.lastIndex = 0;

  return source.replace(PROBE_PATTERN, "return false;");
};
