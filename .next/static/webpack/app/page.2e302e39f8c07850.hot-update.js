"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./src/app/pages/DiceRoller.tsx":
/*!**************************************!*\
  !*** ./src/app/pages/DiceRoller.tsx ***!
  \**************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ DiceRoller; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var _barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! __barrel_optimize__?names=FloatButton,Input,Row!=!antd */ \"(app-pages-browser)/./node_modules/antd/es/row/index.js\");\n/* harmony import */ var _barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! __barrel_optimize__?names=FloatButton,Input,Row!=!antd */ \"(app-pages-browser)/./node_modules/antd/es/float-button/index.js\");\n/* harmony import */ var _barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! __barrel_optimize__?names=FloatButton,Input,Row!=!antd */ \"(app-pages-browser)/./node_modules/antd/es/input/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_MessageBusContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/MessageBusContext */ \"(app-pages-browser)/./src/app/contexts/MessageBusContext.tsx\");\n\nvar _s = $RefreshSig$();\n\n\n\nfunction DiceRoller(props) {\n    _s();\n    const { messageApi, send, senderData } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_contexts_MessageBusContext__WEBPACK_IMPORTED_MODULE_2__.MessageBusContext);\n    const [toRoll, setToRoll] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(1);\n    const inputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    function nroll(size, count) {\n        let acc = [];\n        for(let index = 0; index < count; index++){\n            acc.push(Math.ceil(Math.random() * 100) % size + 1);\n        }\n        return acc;\n    }\n    function parseRoll(rolls, size) {\n        let toString;\n        let crits = rolls.map((item)=>{\n            if (item == size) {\n                return Number(1);\n            } else return Number(0);\n        }).reduce((acc, curr)=>acc + curr);\n        if (rolls.length == 1) {\n            toString = \"\".concat(rolls[0]);\n        } else {\n            toString = rolls.join(\" + \") + \" = \" + rolls.reduce((acc, curr)=>acc + curr);\n        }\n        return [\n            crits,\n            toString\n        ];\n    }\n    function rollDice(size) {\n        let roll = nroll(size, toRoll);\n        let [crits, toString] = parseRoll(roll, size);\n        let message = \"\";\n        if (toRoll == 1 && size == 10) {\n            if (crits) {\n                let critRoll = nroll(10, 1);\n                let sum = roll[0] + critRoll[0];\n                message = \"CR\\xcdTICO PORRA!!! DEU \".concat(roll[0], \" + \").concat(critRoll[0], \" = \").concat(sum);\n            } else {\n                message = \"1d10 = \" + roll[0];\n            }\n        } else {\n            if (toRoll == 1) {\n                message = \"\".concat(toRoll, \"d\").concat(size, \" = \").concat(toString, \" \").concat(crits ? \", CRIT!\" : \"\");\n            }\n            message = \"\".concat(toRoll, \"d\").concat(size, \" = \").concat(toString, \", \").concat(crits, \" cr\\xedticos! \").concat(crits ? \"\\uD83D\\uDCA5\" : \"\");\n        }\n        if (senderData) {\n            send({\n                content: {\n                    message\n                },\n                metadata: {\n                    sender: senderData,\n                    code: 2,\n                    type: \"message\",\n                    data: {}\n                }\n            });\n        }\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_4__[\"default\"].Group, {\n                trigger: \"hover\",\n                onOpenChange: ()=>{\n                    var _inputRef_current;\n                    (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.focus({\n                        cursor: \"all\"\n                    });\n                },\n                type: \"primary\",\n                style: {\n                    insetInlineEnd: 94,\n                    marginBottom: 10\n                },\n                icon: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                    src: \"d10.svg\"\n                }, void 0, false, {\n                    fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n                    lineNumber: 75,\n                    columnNumber: 17\n                }, void 0),\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n                        tooltip: \"Rolar \".concat(toRoll, \"d10\"),\n                        type: \"primary\",\n                        icon: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                            src: \"d10.svg\"\n                        }, void 0, false, {\n                            fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n                            lineNumber: 79,\n                            columnNumber: 19\n                        }, void 0),\n                        onClick: ()=>{\n                            rollDice(10);\n                        }\n                    }, void 0, false, {\n                        fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n                        lineNumber: 76,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n                        tooltip: \"Rolar \".concat(toRoll, \"d6\"),\n                        type: \"primary\",\n                        icon: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                            src: \"d6.svg\"\n                        }, void 0, false, {\n                            fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n                            lineNumber: 87,\n                            columnNumber: 19\n                        }, void 0),\n                        onClick: ()=>{\n                            rollDice(6);\n                        }\n                    }, void 0, false, {\n                        fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n                        lineNumber: 84,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_FloatButton_Input_Row_antd__WEBPACK_IMPORTED_MODULE_5__[\"default\"], {\n                        value: toRoll,\n                        onChange: (event)=>{\n                            setToRoll(Number(event.target.value));\n                        },\n                        ref: inputRef\n                    }, void 0, false, {\n                        fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n                        lineNumber: 92,\n                        columnNumber: 13\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n                lineNumber: 68,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/DiceRoller.tsx\",\n            lineNumber: 67,\n            columnNumber: 7\n        }, this)\n    }, void 0, false);\n}\n_s(DiceRoller, \"9NEwTUVJzcA4PTh9857x9GILESU=\");\n_c = DiceRoller;\nvar _c;\n$RefreshReg$(_c, \"DiceRoller\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9hcHAvcGFnZXMvRGljZVJvbGxlci50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUF5RDtBQUNKO0FBQ2E7QUFHbkQsU0FBU08sV0FBWUMsS0FBVTs7SUFDMUMsTUFBTSxFQUFDQyxVQUFVLEVBQUVDLElBQUksRUFBRUMsVUFBVSxFQUFDLEdBQVlSLGlEQUFVQSxDQUFDRywwRUFBaUJBO0lBQzVFLE1BQU0sQ0FBQ00sUUFBUUMsVUFBVSxHQUFLUiwrQ0FBUUEsQ0FBQztJQUN2QyxNQUFNUyxXQUF3QlYsNkNBQU1BLENBQVc7SUFFL0MsU0FBU1csTUFBT0MsSUFBWSxFQUFFQyxLQUFhO1FBQ3ZDLElBQUlDLE1BQU0sRUFBRTtRQUNaLElBQUssSUFBSUMsUUFBUSxHQUFHQSxRQUFRRixPQUFPRSxRQUFTO1lBQ3hDRCxJQUFJRSxJQUFJLENBQUNDLEtBQUtDLElBQUksQ0FBRUQsS0FBS0UsTUFBTSxLQUFHLE9BQU1QLE9BQUs7UUFDakQ7UUFDQSxPQUFPRTtJQUNYO0lBRUEsU0FBU00sVUFBVUMsS0FBZSxFQUFFVCxJQUFZO1FBQzVDLElBQUlVO1FBQ0osSUFBSUMsUUFBUUYsTUFBTUcsR0FBRyxDQUFDLENBQUNDO1lBQ25CLElBQUdBLFFBQVFiLE1BQU07Z0JBQUUsT0FBT2MsT0FBTztZQUFFLE9BQzlCLE9BQU9BLE9BQU87UUFDdkIsR0FBR0MsTUFBTSxDQUFDLENBQUNiLEtBQUtjLE9BQVNkLE1BQUljO1FBQzdCLElBQUdQLE1BQU1RLE1BQU0sSUFBSSxHQUFHO1lBQ2xCUCxXQUFXLEdBQVksT0FBVEQsS0FBSyxDQUFDLEVBQUU7UUFDMUIsT0FDSztZQUNEQyxXQUFXRCxNQUFNUyxJQUFJLENBQUMsU0FBUyxRQUFRVCxNQUFNTSxNQUFNLENBQUMsQ0FBQ2IsS0FBS2MsT0FBU2QsTUFBSWM7UUFDM0U7UUFDQSxPQUFPO1lBQUNMO1lBQU9EO1NBQVM7SUFDNUI7SUFFQSxTQUFTUyxTQUFVbkIsSUFBWTtRQUMzQixJQUFJb0IsT0FBT3JCLE1BQU1DLE1BQU1KO1FBQ3ZCLElBQUksQ0FBQ2UsT0FBT0QsU0FBUyxHQUFHRixVQUFVWSxNQUFNcEI7UUFDeEMsSUFBSXFCLFVBQVU7UUFDZCxJQUFHekIsVUFBVSxLQUFLSSxRQUFRLElBQUk7WUFDMUIsSUFBR1csT0FBTztnQkFDTixJQUFJVyxXQUFXdkIsTUFBTSxJQUFJO2dCQUN6QixJQUFJd0IsTUFBTUgsSUFBSSxDQUFDLEVBQUUsR0FBR0UsUUFBUSxDQUFDLEVBQUU7Z0JBQy9CRCxVQUFVLDJCQUFxQ0MsT0FBYkYsSUFBSSxDQUFDLEVBQUUsRUFBQyxPQUFzQkcsT0FBakJELFFBQVEsQ0FBQyxFQUFFLEVBQUMsT0FBUyxPQUFKQztZQUNwRSxPQUNLO2dCQUNERixVQUFVLFlBQVlELElBQUksQ0FBQyxFQUFFO1lBQ2pDO1FBQ0osT0FBTztZQUNILElBQUd4QixVQUFVLEdBQUc7Z0JBQ1p5QixVQUFVLEdBQWFyQixPQUFWSixRQUFPLEtBQWFjLE9BQVZWLE1BQUssT0FBaUJXLE9BQVpELFVBQVMsS0FBeUIsT0FBdEJDLFFBQVEsWUFBVztZQUNwRTtZQUNBVSxVQUFVLEdBQWFyQixPQUFWSixRQUFPLEtBQWFjLE9BQVZWLE1BQUssT0FBa0JXLE9BQWJELFVBQVMsTUFBdUJDLE9BQW5CQSxPQUFNLGtCQUE4QixPQUFqQkEsUUFBUSxpQkFBTTtRQUNuRjtRQUNBLElBQUdoQixZQUFZO1lBQ1hELEtBQUs7Z0JBQ0Q4QixTQUFTO29CQUFDSDtnQkFBTztnQkFDakJJLFVBQVU7b0JBQ05DLFFBQVEvQjtvQkFDUmdDLE1BQU07b0JBQ05DLE1BQU07b0JBQ05DLE1BQU0sQ0FBQztnQkFDWDtZQUNKO1FBQ0o7SUFDSjtJQUNBLHFCQUNFO2tCQUNBLDRFQUFDM0MseUZBQUdBO3NCQUNGLDRFQUFDRix5RkFBV0EsQ0FBQzhDLEtBQUs7Z0JBQ2hCQyxTQUFRO2dCQUNSQyxjQUFjO3dCQUNWbEM7cUJBQUFBLG9CQUFBQSxTQUFTbUMsT0FBTyxjQUFoQm5DLHdDQUFBQSxrQkFBa0JvQyxLQUFLLENBQUM7d0JBQUNDLFFBQVE7b0JBQUs7Z0JBQzFDO2dCQUNBUCxNQUFLO2dCQUNMUSxPQUFPO29CQUFDQyxnQkFBZ0I7b0JBQUlDLGNBQWM7Z0JBQUU7Z0JBQzVDQyxvQkFBTSw4REFBQ0M7b0JBQUlDLEtBQUs7Ozs7Ozs7a0NBQ2hCLDhEQUFDekQseUZBQVdBO3dCQUNWMEQsU0FBUyxTQUFnQixPQUFQOUMsUUFBTzt3QkFDekJnQyxNQUFLO3dCQUNMVyxvQkFBTSw4REFBQ0M7NEJBQUlDLEtBQUs7Ozs7Ozt3QkFDaEJFLFNBQVM7NEJBQ0x4QixTQUFTO3dCQUNiOzs7Ozs7a0NBRUYsOERBQUNuQyx5RkFBV0E7d0JBQ1YwRCxTQUFTLFNBQWdCLE9BQVA5QyxRQUFPO3dCQUN6QmdDLE1BQUs7d0JBQ0xXLG9CQUFNLDhEQUFDQzs0QkFBSUMsS0FBSzs7Ozs7O3dCQUNoQkUsU0FBUzs0QkFDTHhCLFNBQVM7d0JBQ2I7Ozs7OztrQ0FFQSw4REFBQ2xDLHlGQUFLQTt3QkFBQzJELE9BQU9oRDt3QkFBUWlELFVBQVUsQ0FBQ0M7NEJBQVNqRCxVQUFVaUIsT0FBT2dDLE1BQU1DLE1BQU0sQ0FBQ0gsS0FBSzt3QkFBRTt3QkFBR0ksS0FBS2xEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLakc7R0EzRnNCUDtLQUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvYXBwL3BhZ2VzL0RpY2VSb2xsZXIudHN4PzNkN2QiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmxvYXRCdXR0b24sIElucHV0LCBJbnB1dFJlZiwgUm93IH0gZnJvbSBcImFudGRcIjtcbmltcG9ydCB7IHVzZUNvbnRleHQsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE1lc3NhZ2VCdXNDb250ZXh0IH0gZnJvbSBcIi4uL2NvbnRleHRzL01lc3NhZ2VCdXNDb250ZXh0XCI7XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRGljZVJvbGxlciAocHJvcHM6IGFueSkge1xuICAgIGNvbnN0IHttZXNzYWdlQXBpLCBzZW5kLCBzZW5kZXJEYXRhfSAgICAgICAgICA9IHVzZUNvbnRleHQoTWVzc2FnZUJ1c0NvbnRleHQpXG4gICAgY29uc3QgW3RvUm9sbCwgc2V0VG9Sb2xsXSAgID0gdXNlU3RhdGUoMSlcbiAgICBjb25zdCBpbnB1dFJlZiAgICAgICAgICAgICAgPSB1c2VSZWY8SW5wdXRSZWY+KG51bGwpXG5cbiAgICBmdW5jdGlvbiBucm9sbCAoc2l6ZTogbnVtYmVyLCBjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBhY2MgPSBbXVxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY291bnQ7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGFjYy5wdXNoKE1hdGguY2VpbCgoTWF0aC5yYW5kb20oKSoxMDApKSVzaXplKzEpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlUm9sbChyb2xsczogbnVtYmVyW10sIHNpemU6IG51bWJlcikge1xuICAgICAgICBsZXQgdG9TdHJpbmc7XG4gICAgICAgIGxldCBjcml0cyA9IHJvbGxzLm1hcCgoaXRlbSk9PntcbiAgICAgICAgICAgIGlmKGl0ZW0gPT0gc2l6ZSkgeyByZXR1cm4gTnVtYmVyKDEpfVxuICAgICAgICAgICAgZWxzZSByZXR1cm4gTnVtYmVyKDApXG4gICAgICAgIH0pLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MrY3VycilcbiAgICAgICAgaWYocm9sbHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHRvU3RyaW5nID0gYCR7cm9sbHNbMF19YFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdG9TdHJpbmcgPSByb2xscy5qb2luKFwiICsgXCIpICsgXCIgPSBcIiArIHJvbGxzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiBhY2MrY3VycilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW2NyaXRzLCB0b1N0cmluZ11cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByb2xsRGljZSAoc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIGxldCByb2xsID0gbnJvbGwoc2l6ZSwgdG9Sb2xsKVxuICAgICAgICBsZXQgW2NyaXRzLCB0b1N0cmluZ10gPSBwYXJzZVJvbGwocm9sbCwgc2l6ZSlcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIlwiXG4gICAgICAgIGlmKHRvUm9sbCA9PSAxICYmIHNpemUgPT0gMTApIHtcbiAgICAgICAgICAgIGlmKGNyaXRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNyaXRSb2xsID0gbnJvbGwoMTAsIDEpXG4gICAgICAgICAgICAgICAgbGV0IHN1bSA9IHJvbGxbMF0gKyBjcml0Um9sbFswXVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQ1LDjVRJQ08gUE9SUkEhISEgREVVICR7cm9sbFswXX0gKyAke2NyaXRSb2xsWzBdfSA9ICR7c3VtfWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIjFkMTAgPSBcIiArIHJvbGxbMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKHRvUm9sbCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGAke3RvUm9sbH1kJHtzaXplfSA9ICR7dG9TdHJpbmd9ICR7Y3JpdHMgPyBcIiwgQ1JJVCFcIjogXCJcIn1gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXNzYWdlID0gYCR7dG9Sb2xsfWQke3NpemV9ID0gJHt0b1N0cmluZ30sICR7Y3JpdHN9IGNyw610aWNvcyEgJHtjcml0cyA/IFwi8J+SpVwiOiBcIlwifWBcbiAgICAgICAgfVxuICAgICAgICBpZihzZW5kZXJEYXRhKSB7XG4gICAgICAgICAgICBzZW5kKHtcbiAgICAgICAgICAgICAgICBjb250ZW50OiB7bWVzc2FnZX0sXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVyOiBzZW5kZXJEYXRhLFxuICAgICAgICAgICAgICAgICAgICBjb2RlOiAyLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8PlxuICAgICAgPFJvdz5cbiAgICAgICAgPEZsb2F0QnV0dG9uLkdyb3VwXG4gICAgICAgICAgdHJpZ2dlcj1cImhvdmVyXCJcbiAgICAgICAgICBvbk9wZW5DaGFuZ2U9eygpPT57XG4gICAgICAgICAgICAgIGlucHV0UmVmLmN1cnJlbnQ/LmZvY3VzKHtjdXJzb3I6IFwiYWxsXCJ9KVxuICAgICAgICAgIH19XG4gICAgICAgICAgdHlwZT1cInByaW1hcnlcIlxuICAgICAgICAgIHN0eWxlPXt7aW5zZXRJbmxpbmVFbmQ6IDk0LCBtYXJnaW5Cb3R0b206IDEwfX1cbiAgICAgICAgICBpY29uPXs8aW1nIHNyYz17XCJkMTAuc3ZnXCJ9PjwvaW1nPn0+XG4gICAgICAgICAgPEZsb2F0QnV0dG9uIFxuICAgICAgICAgICAgdG9vbHRpcD17YFJvbGFyICR7dG9Sb2xsfWQxMGB9IFxuICAgICAgICAgICAgdHlwZT1cInByaW1hcnlcIiBcbiAgICAgICAgICAgIGljb249ezxpbWcgc3JjPXtcImQxMC5zdmdcIn0+PC9pbWc+fVxuICAgICAgICAgICAgb25DbGljaz17KCk9PntcbiAgICAgICAgICAgICAgICByb2xsRGljZSgxMClcbiAgICAgICAgICAgIH19Lz5cblxuICAgICAgICAgIDxGbG9hdEJ1dHRvbiBcbiAgICAgICAgICAgIHRvb2x0aXA9e2BSb2xhciAke3RvUm9sbH1kNmB9IFxuICAgICAgICAgICAgdHlwZT1cInByaW1hcnlcIiBcbiAgICAgICAgICAgIGljb249ezxpbWcgc3JjPXtcImQ2LnN2Z1wifT48L2ltZz59XG4gICAgICAgICAgICBvbkNsaWNrPXsoKT0+e1xuICAgICAgICAgICAgICAgIHJvbGxEaWNlKDYpXG4gICAgICAgICAgICB9fS8+XG5cbiAgICAgICAgICAgIDxJbnB1dCB2YWx1ZT17dG9Sb2xsfSBvbkNoYW5nZT17KGV2ZW50KT0+e3NldFRvUm9sbChOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKSl9fSByZWY9e2lucHV0UmVmfT48L0lucHV0PlxuICAgICAgICA8L0Zsb2F0QnV0dG9uLkdyb3VwPlxuICAgICAgPC9Sb3c+XG4gICAgICA8Lz5cbiAgICApXG4gIH0iXSwibmFtZXMiOlsiRmxvYXRCdXR0b24iLCJJbnB1dCIsIlJvdyIsInVzZUNvbnRleHQiLCJ1c2VSZWYiLCJ1c2VTdGF0ZSIsIk1lc3NhZ2VCdXNDb250ZXh0IiwiRGljZVJvbGxlciIsInByb3BzIiwibWVzc2FnZUFwaSIsInNlbmQiLCJzZW5kZXJEYXRhIiwidG9Sb2xsIiwic2V0VG9Sb2xsIiwiaW5wdXRSZWYiLCJucm9sbCIsInNpemUiLCJjb3VudCIsImFjYyIsImluZGV4IiwicHVzaCIsIk1hdGgiLCJjZWlsIiwicmFuZG9tIiwicGFyc2VSb2xsIiwicm9sbHMiLCJ0b1N0cmluZyIsImNyaXRzIiwibWFwIiwiaXRlbSIsIk51bWJlciIsInJlZHVjZSIsImN1cnIiLCJsZW5ndGgiLCJqb2luIiwicm9sbERpY2UiLCJyb2xsIiwibWVzc2FnZSIsImNyaXRSb2xsIiwic3VtIiwiY29udGVudCIsIm1ldGFkYXRhIiwic2VuZGVyIiwiY29kZSIsInR5cGUiLCJkYXRhIiwiR3JvdXAiLCJ0cmlnZ2VyIiwib25PcGVuQ2hhbmdlIiwiY3VycmVudCIsImZvY3VzIiwiY3Vyc29yIiwic3R5bGUiLCJpbnNldElubGluZUVuZCIsIm1hcmdpbkJvdHRvbSIsImljb24iLCJpbWciLCJzcmMiLCJ0b29sdGlwIiwib25DbGljayIsInZhbHVlIiwib25DaGFuZ2UiLCJldmVudCIsInRhcmdldCIsInJlZiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/app/pages/DiceRoller.tsx\n"));

/***/ })

});