"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/throttle-debounce";
exports.ids = ["vendor-chunks/throttle-debounce"];
exports.modules = {

/***/ "(ssr)/./node_modules/throttle-debounce/esm/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/throttle-debounce/esm/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   debounce: () => (/* binding */ debounce),\n/* harmony export */   throttle: () => (/* binding */ throttle)\n/* harmony export */ });\n/* eslint-disable no-undefined,no-param-reassign,no-shadow */\n\n/**\n * Throttle execution of a function. Especially useful for rate limiting\n * execution of handlers on events like resize and scroll.\n *\n * @param {number} delay -                  A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher)\n *                                            are most useful.\n * @param {Function} callback -               A function to be executed after delay milliseconds. The `this` context and all arguments are passed through,\n *                                            as-is, to `callback` when the throttled-function is executed.\n * @param {object} [options] -              An object to configure options.\n * @param {boolean} [options.noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds\n *                                            while the throttled-function is being called. If noTrailing is false or unspecified, callback will be executed\n *                                            one final time after the last throttled-function call. (After the throttled-function has not been called for\n *                                            `delay` milliseconds, the internal counter is reset).\n * @param {boolean} [options.noLeading] -   Optional, defaults to false. If noLeading is false, the first throttled-function call will execute callback\n *                                            immediately. If noLeading is true, the first the callback execution will be skipped. It should be noted that\n *                                            callback will never executed if both noLeading = true and noTrailing = true.\n * @param {boolean} [options.debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is\n *                                            false (at end), schedule `callback` to execute after `delay` ms.\n *\n * @returns {Function} A new, throttled, function.\n */\nfunction throttle (delay, callback, options) {\n  var _ref = options || {},\n    _ref$noTrailing = _ref.noTrailing,\n    noTrailing = _ref$noTrailing === void 0 ? false : _ref$noTrailing,\n    _ref$noLeading = _ref.noLeading,\n    noLeading = _ref$noLeading === void 0 ? false : _ref$noLeading,\n    _ref$debounceMode = _ref.debounceMode,\n    debounceMode = _ref$debounceMode === void 0 ? undefined : _ref$debounceMode;\n  /*\n   * After wrapper has stopped being called, this timeout ensures that\n   * `callback` is executed at the proper times in `throttle` and `end`\n   * debounce modes.\n   */\n  var timeoutID;\n  var cancelled = false;\n\n  // Keep track of the last time `callback` was executed.\n  var lastExec = 0;\n\n  // Function to clear existing timeout\n  function clearExistingTimeout() {\n    if (timeoutID) {\n      clearTimeout(timeoutID);\n    }\n  }\n\n  // Function to cancel next exec\n  function cancel(options) {\n    var _ref2 = options || {},\n      _ref2$upcomingOnly = _ref2.upcomingOnly,\n      upcomingOnly = _ref2$upcomingOnly === void 0 ? false : _ref2$upcomingOnly;\n    clearExistingTimeout();\n    cancelled = !upcomingOnly;\n  }\n\n  /*\n   * The `wrapper` function encapsulates all of the throttling / debouncing\n   * functionality and when executed will limit the rate at which `callback`\n   * is executed.\n   */\n  function wrapper() {\n    for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {\n      arguments_[_key] = arguments[_key];\n    }\n    var self = this;\n    var elapsed = Date.now() - lastExec;\n    if (cancelled) {\n      return;\n    }\n\n    // Execute `callback` and update the `lastExec` timestamp.\n    function exec() {\n      lastExec = Date.now();\n      callback.apply(self, arguments_);\n    }\n\n    /*\n     * If `debounceMode` is true (at begin) this is used to clear the flag\n     * to allow future `callback` executions.\n     */\n    function clear() {\n      timeoutID = undefined;\n    }\n    if (!noLeading && debounceMode && !timeoutID) {\n      /*\n       * Since `wrapper` is being called for the first time and\n       * `debounceMode` is true (at begin), execute `callback`\n       * and noLeading != true.\n       */\n      exec();\n    }\n    clearExistingTimeout();\n    if (debounceMode === undefined && elapsed > delay) {\n      if (noLeading) {\n        /*\n         * In throttle mode with noLeading, if `delay` time has\n         * been exceeded, update `lastExec` and schedule `callback`\n         * to execute after `delay` ms.\n         */\n        lastExec = Date.now();\n        if (!noTrailing) {\n          timeoutID = setTimeout(debounceMode ? clear : exec, delay);\n        }\n      } else {\n        /*\n         * In throttle mode without noLeading, if `delay` time has been exceeded, execute\n         * `callback`.\n         */\n        exec();\n      }\n    } else if (noTrailing !== true) {\n      /*\n       * In trailing throttle mode, since `delay` time has not been\n       * exceeded, schedule `callback` to execute `delay` ms after most\n       * recent execution.\n       *\n       * If `debounceMode` is true (at begin), schedule `clear` to execute\n       * after `delay` ms.\n       *\n       * If `debounceMode` is false (at end), schedule `callback` to\n       * execute after `delay` ms.\n       */\n      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);\n    }\n  }\n  wrapper.cancel = cancel;\n\n  // Return the wrapper function.\n  return wrapper;\n}\n\n/* eslint-disable no-undefined */\n\n/**\n * Debounce execution of a function. Debouncing, unlike throttling,\n * guarantees that a function is only executed a single time, either at the\n * very beginning of a series of calls, or at the very end.\n *\n * @param {number} delay -               A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.\n * @param {Function} callback -          A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,\n *                                        to `callback` when the debounced-function is executed.\n * @param {object} [options] -           An object to configure options.\n * @param {boolean} [options.atBegin] -  Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds\n *                                        after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.\n *                                        (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).\n *\n * @returns {Function} A new, debounced function.\n */\nfunction debounce (delay, callback, options) {\n  var _ref = options || {},\n    _ref$atBegin = _ref.atBegin,\n    atBegin = _ref$atBegin === void 0 ? false : _ref$atBegin;\n  return throttle(delay, callback, {\n    debounceMode: atBegin !== false\n  });\n}\n\n\n//# sourceMappingURL=index.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdGhyb3R0bGUtZGVib3VuY2UvZXNtL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQSxXQUFXLFVBQVU7QUFDckI7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQSxhQUFhLFVBQVU7QUFDdkI7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEVBQThFLGFBQWE7QUFDM0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFVBQVU7QUFDckI7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLGFBQWEsVUFBVTtBQUN2QjtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUU4QjtBQUM5QiIsInNvdXJjZXMiOlsid2VicGFjazovL3NvdW5kYm9hcmQvLi9ub2RlX21vZHVsZXMvdGhyb3R0bGUtZGVib3VuY2UvZXNtL2luZGV4LmpzPzQ4NDYiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWZpbmVkLG5vLXBhcmFtLXJlYXNzaWduLG5vLXNoYWRvdyAqL1xuXG4vKipcbiAqIFRocm90dGxlIGV4ZWN1dGlvbiBvZiBhIGZ1bmN0aW9uLiBFc3BlY2lhbGx5IHVzZWZ1bCBmb3IgcmF0ZSBsaW1pdGluZ1xuICogZXhlY3V0aW9uIG9mIGhhbmRsZXJzIG9uIGV2ZW50cyBsaWtlIHJlc2l6ZSBhbmQgc2Nyb2xsLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWxheSAtICAgICAgICAgICAgICAgICAgQSB6ZXJvLW9yLWdyZWF0ZXIgZGVsYXkgaW4gbWlsbGlzZWNvbmRzLiBGb3IgZXZlbnQgY2FsbGJhY2tzLCB2YWx1ZXMgYXJvdW5kIDEwMCBvciAyNTAgKG9yIGV2ZW4gaGlnaGVyKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZSBtb3N0IHVzZWZ1bC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gICAgICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIGRlbGF5IG1pbGxpc2Vjb25kcy4gVGhlIGB0aGlzYCBjb250ZXh0IGFuZCBhbGwgYXJndW1lbnRzIGFyZSBwYXNzZWQgdGhyb3VnaCxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcy1pcywgdG8gYGNhbGxiYWNrYCB3aGVuIHRoZSB0aHJvdHRsZWQtZnVuY3Rpb24gaXMgZXhlY3V0ZWQuXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gICAgICAgICAgICAgIEFuIG9iamVjdCB0byBjb25maWd1cmUgb3B0aW9ucy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9UcmFpbGluZ10gLSAgIE9wdGlvbmFsLCBkZWZhdWx0cyB0byBmYWxzZS4gSWYgbm9UcmFpbGluZyBpcyB0cnVlLCBjYWxsYmFjayB3aWxsIG9ubHkgZXhlY3V0ZSBldmVyeSBgZGVsYXlgIG1pbGxpc2Vjb25kc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIHRoZSB0aHJvdHRsZWQtZnVuY3Rpb24gaXMgYmVpbmcgY2FsbGVkLiBJZiBub1RyYWlsaW5nIGlzIGZhbHNlIG9yIHVuc3BlY2lmaWVkLCBjYWxsYmFjayB3aWxsIGJlIGV4ZWN1dGVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25lIGZpbmFsIHRpbWUgYWZ0ZXIgdGhlIGxhc3QgdGhyb3R0bGVkLWZ1bmN0aW9uIGNhbGwuIChBZnRlciB0aGUgdGhyb3R0bGVkLWZ1bmN0aW9uIGhhcyBub3QgYmVlbiBjYWxsZWQgZm9yXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYGRlbGF5YCBtaWxsaXNlY29uZHMsIHRoZSBpbnRlcm5hbCBjb3VudGVyIGlzIHJlc2V0KS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9MZWFkaW5nXSAtICAgT3B0aW9uYWwsIGRlZmF1bHRzIHRvIGZhbHNlLiBJZiBub0xlYWRpbmcgaXMgZmFsc2UsIHRoZSBmaXJzdCB0aHJvdHRsZWQtZnVuY3Rpb24gY2FsbCB3aWxsIGV4ZWN1dGUgY2FsbGJhY2tcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbW1lZGlhdGVseS4gSWYgbm9MZWFkaW5nIGlzIHRydWUsIHRoZSBmaXJzdCB0aGUgY2FsbGJhY2sgZXhlY3V0aW9uIHdpbGwgYmUgc2tpcHBlZC4gSXQgc2hvdWxkIGJlIG5vdGVkIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayB3aWxsIG5ldmVyIGV4ZWN1dGVkIGlmIGJvdGggbm9MZWFkaW5nID0gdHJ1ZSBhbmQgbm9UcmFpbGluZyA9IHRydWUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlYm91bmNlTW9kZV0gLSBJZiBgZGVib3VuY2VNb2RlYCBpcyB0cnVlIChhdCBiZWdpbiksIHNjaGVkdWxlIGBjbGVhcmAgdG8gZXhlY3V0ZSBhZnRlciBgZGVsYXlgIG1zLiBJZiBgZGVib3VuY2VNb2RlYCBpc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlIChhdCBlbmQpLCBzY2hlZHVsZSBgY2FsbGJhY2tgIHRvIGV4ZWN1dGUgYWZ0ZXIgYGRlbGF5YCBtcy5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgbmV3LCB0aHJvdHRsZWQsIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiB0aHJvdHRsZSAoZGVsYXksIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gIHZhciBfcmVmID0gb3B0aW9ucyB8fCB7fSxcbiAgICBfcmVmJG5vVHJhaWxpbmcgPSBfcmVmLm5vVHJhaWxpbmcsXG4gICAgbm9UcmFpbGluZyA9IF9yZWYkbm9UcmFpbGluZyA9PT0gdm9pZCAwID8gZmFsc2UgOiBfcmVmJG5vVHJhaWxpbmcsXG4gICAgX3JlZiRub0xlYWRpbmcgPSBfcmVmLm5vTGVhZGluZyxcbiAgICBub0xlYWRpbmcgPSBfcmVmJG5vTGVhZGluZyA9PT0gdm9pZCAwID8gZmFsc2UgOiBfcmVmJG5vTGVhZGluZyxcbiAgICBfcmVmJGRlYm91bmNlTW9kZSA9IF9yZWYuZGVib3VuY2VNb2RlLFxuICAgIGRlYm91bmNlTW9kZSA9IF9yZWYkZGVib3VuY2VNb2RlID09PSB2b2lkIDAgPyB1bmRlZmluZWQgOiBfcmVmJGRlYm91bmNlTW9kZTtcbiAgLypcbiAgICogQWZ0ZXIgd3JhcHBlciBoYXMgc3RvcHBlZCBiZWluZyBjYWxsZWQsIHRoaXMgdGltZW91dCBlbnN1cmVzIHRoYXRcbiAgICogYGNhbGxiYWNrYCBpcyBleGVjdXRlZCBhdCB0aGUgcHJvcGVyIHRpbWVzIGluIGB0aHJvdHRsZWAgYW5kIGBlbmRgXG4gICAqIGRlYm91bmNlIG1vZGVzLlxuICAgKi9cbiAgdmFyIHRpbWVvdXRJRDtcbiAgdmFyIGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhc3QgdGltZSBgY2FsbGJhY2tgIHdhcyBleGVjdXRlZC5cbiAgdmFyIGxhc3RFeGVjID0gMDtcblxuICAvLyBGdW5jdGlvbiB0byBjbGVhciBleGlzdGluZyB0aW1lb3V0XG4gIGZ1bmN0aW9uIGNsZWFyRXhpc3RpbmdUaW1lb3V0KCkge1xuICAgIGlmICh0aW1lb3V0SUQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SUQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZ1bmN0aW9uIHRvIGNhbmNlbCBuZXh0IGV4ZWNcbiAgZnVuY3Rpb24gY2FuY2VsKG9wdGlvbnMpIHtcbiAgICB2YXIgX3JlZjIgPSBvcHRpb25zIHx8IHt9LFxuICAgICAgX3JlZjIkdXBjb21pbmdPbmx5ID0gX3JlZjIudXBjb21pbmdPbmx5LFxuICAgICAgdXBjb21pbmdPbmx5ID0gX3JlZjIkdXBjb21pbmdPbmx5ID09PSB2b2lkIDAgPyBmYWxzZSA6IF9yZWYyJHVwY29taW5nT25seTtcbiAgICBjbGVhckV4aXN0aW5nVGltZW91dCgpO1xuICAgIGNhbmNlbGxlZCA9ICF1cGNvbWluZ09ubHk7XG4gIH1cblxuICAvKlxuICAgKiBUaGUgYHdyYXBwZXJgIGZ1bmN0aW9uIGVuY2Fwc3VsYXRlcyBhbGwgb2YgdGhlIHRocm90dGxpbmcgLyBkZWJvdW5jaW5nXG4gICAqIGZ1bmN0aW9uYWxpdHkgYW5kIHdoZW4gZXhlY3V0ZWQgd2lsbCBsaW1pdCB0aGUgcmF0ZSBhdCB3aGljaCBgY2FsbGJhY2tgXG4gICAqIGlzIGV4ZWN1dGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gd3JhcHBlcigpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJndW1lbnRzXyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3VtZW50c19bX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZWxhcHNlZCA9IERhdGUubm93KCkgLSBsYXN0RXhlYztcbiAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRXhlY3V0ZSBgY2FsbGJhY2tgIGFuZCB1cGRhdGUgdGhlIGBsYXN0RXhlY2AgdGltZXN0YW1wLlxuICAgIGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICBsYXN0RXhlYyA9IERhdGUubm93KCk7XG4gICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBhcmd1bWVudHNfKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIElmIGBkZWJvdW5jZU1vZGVgIGlzIHRydWUgKGF0IGJlZ2luKSB0aGlzIGlzIHVzZWQgdG8gY2xlYXIgdGhlIGZsYWdcbiAgICAgKiB0byBhbGxvdyBmdXR1cmUgYGNhbGxiYWNrYCBleGVjdXRpb25zLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgdGltZW91dElEID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoIW5vTGVhZGluZyAmJiBkZWJvdW5jZU1vZGUgJiYgIXRpbWVvdXRJRCkge1xuICAgICAgLypcbiAgICAgICAqIFNpbmNlIGB3cmFwcGVyYCBpcyBiZWluZyBjYWxsZWQgZm9yIHRoZSBmaXJzdCB0aW1lIGFuZFxuICAgICAgICogYGRlYm91bmNlTW9kZWAgaXMgdHJ1ZSAoYXQgYmVnaW4pLCBleGVjdXRlIGBjYWxsYmFja2BcbiAgICAgICAqIGFuZCBub0xlYWRpbmcgIT0gdHJ1ZS5cbiAgICAgICAqL1xuICAgICAgZXhlYygpO1xuICAgIH1cbiAgICBjbGVhckV4aXN0aW5nVGltZW91dCgpO1xuICAgIGlmIChkZWJvdW5jZU1vZGUgPT09IHVuZGVmaW5lZCAmJiBlbGFwc2VkID4gZGVsYXkpIHtcbiAgICAgIGlmIChub0xlYWRpbmcpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogSW4gdGhyb3R0bGUgbW9kZSB3aXRoIG5vTGVhZGluZywgaWYgYGRlbGF5YCB0aW1lIGhhc1xuICAgICAgICAgKiBiZWVuIGV4Y2VlZGVkLCB1cGRhdGUgYGxhc3RFeGVjYCBhbmQgc2NoZWR1bGUgYGNhbGxiYWNrYFxuICAgICAgICAgKiB0byBleGVjdXRlIGFmdGVyIGBkZWxheWAgbXMuXG4gICAgICAgICAqL1xuICAgICAgICBsYXN0RXhlYyA9IERhdGUubm93KCk7XG4gICAgICAgIGlmICghbm9UcmFpbGluZykge1xuICAgICAgICAgIHRpbWVvdXRJRCA9IHNldFRpbWVvdXQoZGVib3VuY2VNb2RlID8gY2xlYXIgOiBleGVjLCBkZWxheSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIEluIHRocm90dGxlIG1vZGUgd2l0aG91dCBub0xlYWRpbmcsIGlmIGBkZWxheWAgdGltZSBoYXMgYmVlbiBleGNlZWRlZCwgZXhlY3V0ZVxuICAgICAgICAgKiBgY2FsbGJhY2tgLlxuICAgICAgICAgKi9cbiAgICAgICAgZXhlYygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9UcmFpbGluZyAhPT0gdHJ1ZSkge1xuICAgICAgLypcbiAgICAgICAqIEluIHRyYWlsaW5nIHRocm90dGxlIG1vZGUsIHNpbmNlIGBkZWxheWAgdGltZSBoYXMgbm90IGJlZW5cbiAgICAgICAqIGV4Y2VlZGVkLCBzY2hlZHVsZSBgY2FsbGJhY2tgIHRvIGV4ZWN1dGUgYGRlbGF5YCBtcyBhZnRlciBtb3N0XG4gICAgICAgKiByZWNlbnQgZXhlY3V0aW9uLlxuICAgICAgICpcbiAgICAgICAqIElmIGBkZWJvdW5jZU1vZGVgIGlzIHRydWUgKGF0IGJlZ2luKSwgc2NoZWR1bGUgYGNsZWFyYCB0byBleGVjdXRlXG4gICAgICAgKiBhZnRlciBgZGVsYXlgIG1zLlxuICAgICAgICpcbiAgICAgICAqIElmIGBkZWJvdW5jZU1vZGVgIGlzIGZhbHNlIChhdCBlbmQpLCBzY2hlZHVsZSBgY2FsbGJhY2tgIHRvXG4gICAgICAgKiBleGVjdXRlIGFmdGVyIGBkZWxheWAgbXMuXG4gICAgICAgKi9cbiAgICAgIHRpbWVvdXRJRCA9IHNldFRpbWVvdXQoZGVib3VuY2VNb2RlID8gY2xlYXIgOiBleGVjLCBkZWJvdW5jZU1vZGUgPT09IHVuZGVmaW5lZCA/IGRlbGF5IC0gZWxhcHNlZCA6IGRlbGF5KTtcbiAgICB9XG4gIH1cbiAgd3JhcHBlci5jYW5jZWwgPSBjYW5jZWw7XG5cbiAgLy8gUmV0dXJuIHRoZSB3cmFwcGVyIGZ1bmN0aW9uLlxuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWZpbmVkICovXG5cbi8qKlxuICogRGVib3VuY2UgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24uIERlYm91bmNpbmcsIHVubGlrZSB0aHJvdHRsaW5nLFxuICogZ3VhcmFudGVlcyB0aGF0IGEgZnVuY3Rpb24gaXMgb25seSBleGVjdXRlZCBhIHNpbmdsZSB0aW1lLCBlaXRoZXIgYXQgdGhlXG4gKiB2ZXJ5IGJlZ2lubmluZyBvZiBhIHNlcmllcyBvZiBjYWxscywgb3IgYXQgdGhlIHZlcnkgZW5kLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWxheSAtICAgICAgICAgICAgICAgQSB6ZXJvLW9yLWdyZWF0ZXIgZGVsYXkgaW4gbWlsbGlzZWNvbmRzLiBGb3IgZXZlbnQgY2FsbGJhY2tzLCB2YWx1ZXMgYXJvdW5kIDEwMCBvciAyNTAgKG9yIGV2ZW4gaGlnaGVyKSBhcmUgbW9zdCB1c2VmdWwuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtICAgICAgICAgIEEgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgYWZ0ZXIgZGVsYXkgbWlsbGlzZWNvbmRzLiBUaGUgYHRoaXNgIGNvbnRleHQgYW5kIGFsbCBhcmd1bWVudHMgYXJlIHBhc3NlZCB0aHJvdWdoLCBhcy1pcyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGBjYWxsYmFja2Agd2hlbiB0aGUgZGVib3VuY2VkLWZ1bmN0aW9uIGlzIGV4ZWN1dGVkLlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtICAgICAgICAgICBBbiBvYmplY3QgdG8gY29uZmlndXJlIG9wdGlvbnMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmF0QmVnaW5dIC0gIE9wdGlvbmFsLCBkZWZhdWx0cyB0byBmYWxzZS4gSWYgYXRCZWdpbiBpcyBmYWxzZSBvciB1bnNwZWNpZmllZCwgY2FsbGJhY2sgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGBkZWxheWAgbWlsbGlzZWNvbmRzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZnRlciB0aGUgbGFzdCBkZWJvdW5jZWQtZnVuY3Rpb24gY2FsbC4gSWYgYXRCZWdpbiBpcyB0cnVlLCBjYWxsYmFjayB3aWxsIGJlIGV4ZWN1dGVkIG9ubHkgYXQgdGhlIGZpcnN0IGRlYm91bmNlZC1mdW5jdGlvbiBjYWxsLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKEFmdGVyIHRoZSB0aHJvdHRsZWQtZnVuY3Rpb24gaGFzIG5vdCBiZWVuIGNhbGxlZCBmb3IgYGRlbGF5YCBtaWxsaXNlY29uZHMsIHRoZSBpbnRlcm5hbCBjb3VudGVyIGlzIHJlc2V0KS5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgbmV3LCBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlIChkZWxheSwgY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgdmFyIF9yZWYgPSBvcHRpb25zIHx8IHt9LFxuICAgIF9yZWYkYXRCZWdpbiA9IF9yZWYuYXRCZWdpbixcbiAgICBhdEJlZ2luID0gX3JlZiRhdEJlZ2luID09PSB2b2lkIDAgPyBmYWxzZSA6IF9yZWYkYXRCZWdpbjtcbiAgcmV0dXJuIHRocm90dGxlKGRlbGF5LCBjYWxsYmFjaywge1xuICAgIGRlYm91bmNlTW9kZTogYXRCZWdpbiAhPT0gZmFsc2VcbiAgfSk7XG59XG5cbmV4cG9ydCB7IGRlYm91bmNlLCB0aHJvdHRsZSB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/throttle-debounce/esm/index.js\n");

/***/ })

};
;