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

/***/ "(app-pages-browser)/./src/app/pages/ActivityLog.tsx":
/*!***************************************!*\
  !*** ./src/app/pages/ActivityLog.tsx ***!
  \***************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ActivityLog: function() { return /* binding */ ActivityLog; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_MessageBusContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/MessageBusContext */ \"(app-pages-browser)/./src/app/contexts/MessageBusContext.tsx\");\n/* harmony import */ var _barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! __barrel_optimize__?names=Col,Divider,Input,Row!=!antd */ \"(app-pages-browser)/./node_modules/antd/es/row/index.js\");\n/* harmony import */ var _barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! __barrel_optimize__?names=Col,Divider,Input,Row!=!antd */ \"(app-pages-browser)/./node_modules/antd/es/col/index.js\");\n/* harmony import */ var _barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! __barrel_optimize__?names=Col,Divider,Input,Row!=!antd */ \"(app-pages-browser)/./node_modules/antd/es/divider/index.js\");\n/* harmony import */ var _barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! __barrel_optimize__?names=Col,Divider,Input,Row!=!antd */ \"(app-pages-browser)/./node_modules/antd/es/input/index.js\");\n/* harmony import */ var _DiceRoller__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./DiceRoller */ \"(app-pages-browser)/./src/app/pages/DiceRoller.tsx\");\n/* harmony import */ var _barrel_optimize_names_ArrowRightOutlined_ant_design_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! __barrel_optimize__?names=ArrowRightOutlined!=!@ant-design/icons */ \"(app-pages-browser)/./node_modules/@ant-design/icons/es/icons/ArrowRightOutlined.js\");\n/* harmony import */ var _comps_AnimatedList__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../comps/AnimatedList */ \"(app-pages-browser)/./src/app/comps/AnimatedList.tsx\");\n\nvar _s = $RefreshSig$();\n\n\n\n\n\n\nfunction alertPlayer(target, sender, send) {\n    let data = {\n        content: {\n            message: \"CUIDADO!\"\n        },\n        metadata: {\n            sender,\n            data: {\n                target: target.metadata.sender.name\n            },\n            code: 3,\n            type: \"Alert\"\n        }\n    };\n    send(data);\n}\nfunction ActivityLog(props) {\n    _s();\n    const { messageLog, senderData, send, isHost } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_contexts_MessageBusContext__WEBPACK_IMPORTED_MODULE_2__.MessageBusContext);\n    const [inputText, setInputText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const ref = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const inputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (ref.current) {\n            ref.current.scrollIntoView({\n                behavior: \"smooth\"\n            });\n        }\n    }, [\n        messageLog\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_DiceRoller__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {}, void 0, false, {\n                fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                lineNumber: 33,\n                columnNumber: 5\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_5__[\"default\"], {\n                style: {\n                    justifyItems: \"space-between\"\n                },\n                gutter: [\n                    16,\n                    16\n                ],\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_6__[\"default\"], {\n                        span: 24,\n                        style: {\n                            height: 250,\n                            overflow: \"auto\"\n                        },\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_7__[\"default\"], {\n                                children: \"Chat\"\n                            }, void 0, false, {\n                                fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                                lineNumber: 36,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_comps_AnimatedList__WEBPACK_IMPORTED_MODULE_4__.AnimatedList, {\n                                list: messageLog\n                            }, void 0, false, {\n                                fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                                lineNumber: 37,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                ref: ref\n                            }, void 0, false, {\n                                fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                                lineNumber: 38,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                        lineNumber: 35,\n                        columnNumber: 7\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_6__[\"default\"], {\n                        span: 24,\n                        style: {\n                            paddingBottom: 15\n                        },\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_Col_Divider_Input_Row_antd__WEBPACK_IMPORTED_MODULE_8__[\"default\"], {\n                            ref: inputRef,\n                            value: inputText,\n                            onChange: (event)=>{\n                                setInputText(event.target.value);\n                            },\n                            onPressEnter: ()=>{\n                                let data = {\n                                    content: {\n                                        message: inputText\n                                    },\n                                    metadata: {\n                                        sender: senderData,\n                                        type: \"message\",\n                                        code: 2\n                                    }\n                                };\n                                send(data);\n                                inputRef.current.focus({\n                                    cursor: \"all\"\n                                });\n                            },\n                            suffix: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ArrowRightOutlined_ant_design_icons__WEBPACK_IMPORTED_MODULE_9__[\"default\"], {}, void 0, false, {\n                                fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                                lineNumber: 56,\n                                columnNumber: 21\n                            }, void 0)\n                        }, void 0, false, {\n                            fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                            lineNumber: 41,\n                            columnNumber: 11\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                        lineNumber: 40,\n                        columnNumber: 7\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/wykthor/Desktop/Git/soundboard/src/app/pages/ActivityLog.tsx\",\n                lineNumber: 34,\n                columnNumber: 5\n            }, this)\n        ]\n    }, void 0, true);\n}\n_s(ActivityLog, \"HdeC0WyRbCOO6tqqPIbzxsRXkcU=\");\n_c = ActivityLog;\nvar _c;\n$RefreshReg$(_c, \"ActivityLog\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9hcHAvcGFnZXMvQWN0aXZpdHlMb2cudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQTJGO0FBQ1U7QUFDNUM7QUFDcEI7QUFDaUI7QUFDRjtBQUVwRCxTQUFTWSxZQUFhQyxNQUFlLEVBQUVDLE1BQXdDLEVBQUVDLElBQTJCO0lBQzFHLElBQUlDLE9BQU87UUFDVEMsU0FBUztZQUFDQyxTQUFTO1FBQVU7UUFDN0JDLFVBQVU7WUFDUkw7WUFDQUUsTUFBTTtnQkFBQ0gsUUFBUUEsT0FBT00sUUFBUSxDQUFDTCxNQUFNLENBQUNNLElBQUk7WUFBQTtZQUMxQ0MsTUFBTTtZQUNOQyxNQUFNO1FBQ1I7SUFDRjtJQUNBUCxLQUFLQztBQUNQO0FBRU8sU0FBU08sWUFBYUMsS0FBVTs7SUFDbkMsTUFBTSxFQUFDQyxVQUFVLEVBQUVDLFVBQVUsRUFDM0JYLElBQUksRUFBRVksTUFBTSxFQUFDLEdBQW1CM0IsaURBQVVBLENBQUNJLDBFQUFpQkE7SUFDOUQsTUFBTSxDQUFDd0IsV0FBV0MsYUFBYSxHQUFHMUIsK0NBQVFBLENBQUM7SUFDM0MsTUFBTTJCLE1BQTRCNUIsNkNBQU1BLENBQWlCO0lBQ3pELE1BQU02QixXQUE0QjdCLDZDQUFNQSxDQUFXO0lBQ25ERCxnREFBU0EsQ0FBQztRQUNSLElBQUc2QixJQUFJRSxPQUFPLEVBQUU7WUFDZEYsSUFBSUUsT0FBTyxDQUFDQyxjQUFjLENBQUM7Z0JBQUNDLFVBQVU7WUFBUTtRQUNoRDtJQUNGLEdBQUc7UUFBQ1Q7S0FBVztJQUNmLHFCQUFPOzswQkFDUCw4REFBQ2hCLG1EQUFVQTs7Ozs7MEJBQ1gsOERBQUNELHlGQUFHQTtnQkFBQzJCLE9BQU87b0JBQUNDLGNBQWM7Z0JBQWU7Z0JBQUdDLFFBQVE7b0JBQUM7b0JBQUc7aUJBQUc7O2tDQUMxRCw4REFBQ2hDLHlGQUFHQTt3QkFBQ2lDLE1BQU07d0JBQUlILE9BQU87NEJBQUNJLFFBQVE7NEJBQUtDLFVBQVU7d0JBQU07OzBDQUNoRCw4REFBQ2xDLHlGQUFPQTswQ0FBQzs7Ozs7OzBDQUNULDhEQUFDSyw2REFBWUE7Z0NBQUM4QixNQUFNaEI7Ozs7OzswQ0FDcEIsOERBQUNpQjtnQ0FBSVosS0FBS0E7Ozs7Ozs7Ozs7OztrQ0FFZCw4REFBQ3pCLHlGQUFHQTt3QkFBQ2lDLE1BQU07d0JBQUlILE9BQU87NEJBQUNRLGVBQWU7d0JBQUU7a0NBQ3BDLDRFQUFDcEMseUZBQUtBOzRCQUNKdUIsS0FBS0M7NEJBQ0xhLE9BQU9oQjs0QkFDUGlCLFVBQVUsQ0FBQ0M7Z0NBQVNqQixhQUFhaUIsTUFBTWpDLE1BQU0sQ0FBQytCLEtBQUs7NEJBQUM7NEJBQ3BERyxjQUFjO2dDQUNaLElBQUkvQixPQUFPO29DQUNUQyxTQUFTO3dDQUFDQyxTQUFTVTtvQ0FBUztvQ0FDNUJULFVBQVU7d0NBQ1JMLFFBQVFZO3dDQUNSSixNQUFNO3dDQUNORCxNQUFNO29DQUFDO2dDQUNYO2dDQUNBTixLQUFLQztnQ0FDTGUsU0FBU0MsT0FBTyxDQUFFZ0IsS0FBSyxDQUFDO29DQUFDQyxRQUFRO2dDQUFLOzRCQUN4Qzs0QkFDQUMsc0JBQVEsOERBQUN4QyxrR0FBa0JBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlyQztHQXZDY2E7S0FBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2FwcC9wYWdlcy9BY3Rpdml0eUxvZy50c3g/NjY3ZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbGVtZW50UmVmLCBSZWYsIFJlZk9iamVjdCwgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCJcbmltcG9ydCB7IExvZ0RhdGEsIExvZ0RhdGFNZXRhZGF0YVNlbmRlckRhdGEsIE1lc3NhZ2VCdXNDb250ZXh0IH0gZnJvbSBcIi4uL2NvbnRleHRzL01lc3NhZ2VCdXNDb250ZXh0XCJcbmltcG9ydCB7IENvbCwgRGl2aWRlciwgSW5wdXQsIElucHV0UmVmLCBSb3cgfSBmcm9tIFwiYW50ZFwiXG5pbXBvcnQgRGljZVJvbGxlciBmcm9tIFwiLi9EaWNlUm9sbGVyXCJcbmltcG9ydCB7IEFycm93UmlnaHRPdXRsaW5lZCB9IGZyb20gXCJAYW50LWRlc2lnbi9pY29uc1wiXG5pbXBvcnQgeyBBbmltYXRlZExpc3QgfSBmcm9tIFwiLi4vY29tcHMvQW5pbWF0ZWRMaXN0XCJcblxuZnVuY3Rpb24gYWxlcnRQbGF5ZXIgKHRhcmdldDogTG9nRGF0YSwgc2VuZGVyOiBMb2dEYXRhTWV0YWRhdGFTZW5kZXJEYXRhIHwgbnVsbCwgc2VuZDogKGRhdGE6IExvZ0RhdGEpPT52b2lkKSB7XG4gIGxldCBkYXRhID0ge1xuICAgIGNvbnRlbnQ6IHttZXNzYWdlOiBcIkNVSURBRE8hXCJ9LFxuICAgIG1ldGFkYXRhOiB7XG4gICAgICBzZW5kZXIsXG4gICAgICBkYXRhOiB7dGFyZ2V0OiB0YXJnZXQubWV0YWRhdGEuc2VuZGVyLm5hbWV9LFxuICAgICAgY29kZTogMyxcbiAgICAgIHR5cGU6IFwiQWxlcnRcIlxuICAgIH1cbiAgfSBhcyBMb2dEYXRhXG4gIHNlbmQoZGF0YSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFjdGl2aXR5TG9nIChwcm9wczogYW55KSB7XG4gICAgY29uc3Qge21lc3NhZ2VMb2csIHNlbmRlckRhdGEsIFxuICAgICAgc2VuZCwgaXNIb3N0fSAgICAgICAgICAgICAgICAgPSB1c2VDb250ZXh0KE1lc3NhZ2VCdXNDb250ZXh0KVxuICAgIGNvbnN0IFtpbnB1dFRleHQsIHNldElucHV0VGV4dF0gPSB1c2VTdGF0ZShcIlwiKVxuICAgIGNvbnN0IHJlZiAgICAgICAgICAgICAgICAgICAgICAgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gICAgY29uc3QgaW5wdXRSZWYgICAgICAgICAgICAgICAgICA9IHVzZVJlZjxJbnB1dFJlZj4obnVsbClcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgIGlmKHJlZi5jdXJyZW50KSB7XG4gICAgICAgIHJlZi5jdXJyZW50LnNjcm9sbEludG9WaWV3KHtiZWhhdmlvcjogXCJzbW9vdGhcIn0pXG4gICAgICB9XG4gICAgfSwgW21lc3NhZ2VMb2ddKVxuICAgIHJldHVybiA8PlxuICAgIDxEaWNlUm9sbGVyLz5cbiAgICA8Um93IHN0eWxlPXt7anVzdGlmeUl0ZW1zOiBcInNwYWNlLWJldHdlZW5cIn19IGd1dHRlcj17WzE2LDE2XX0+XG4gICAgICA8Q29sIHNwYW49ezI0fSBzdHlsZT17e2hlaWdodDogMjUwLCBvdmVyZmxvdzogXCJhdXRvXCJ9fT5cbiAgICAgICAgICA8RGl2aWRlcj5DaGF0PC9EaXZpZGVyPlxuICAgICAgICAgIDxBbmltYXRlZExpc3QgbGlzdD17bWVzc2FnZUxvZ30vPlxuICAgICAgICAgIDxkaXYgcmVmPXtyZWZ9Lz5cbiAgICAgIDwvQ29sPlxuICAgICAgPENvbCBzcGFuPXsyNH0gc3R5bGU9e3twYWRkaW5nQm90dG9tOiAxNX19PlxuICAgICAgICAgIDxJbnB1dCBcbiAgICAgICAgICAgIHJlZj17aW5wdXRSZWZ9XG4gICAgICAgICAgICB2YWx1ZT17aW5wdXRUZXh0fSBcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpPT57c2V0SW5wdXRUZXh0KGV2ZW50LnRhcmdldC52YWx1ZSl9fSBcbiAgICAgICAgICAgIG9uUHJlc3NFbnRlcj17KCk9PntcbiAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgY29udGVudDoge21lc3NhZ2U6IGlucHV0VGV4dH0sXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgIHNlbmRlcjogc2VuZGVyRGF0YSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgICAgY29kZTogMn1cbiAgICAgICAgICAgICAgfSBhcyBMb2dEYXRhXG4gICAgICAgICAgICAgIHNlbmQoZGF0YSlcbiAgICAgICAgICAgICAgaW5wdXRSZWYuY3VycmVudCEuZm9jdXMoe2N1cnNvcjogXCJhbGxcIn0pXG4gICAgICAgICAgICB9fSBcbiAgICAgICAgICAgIHN1ZmZpeD17PEFycm93UmlnaHRPdXRsaW5lZC8+fS8+XG4gICAgICA8L0NvbD5cbiAgICA8L1Jvdz5cbiAgICA8Lz5cbiAgfSJdLCJuYW1lcyI6WyJ1c2VDb250ZXh0IiwidXNlRWZmZWN0IiwidXNlUmVmIiwidXNlU3RhdGUiLCJNZXNzYWdlQnVzQ29udGV4dCIsIkNvbCIsIkRpdmlkZXIiLCJJbnB1dCIsIlJvdyIsIkRpY2VSb2xsZXIiLCJBcnJvd1JpZ2h0T3V0bGluZWQiLCJBbmltYXRlZExpc3QiLCJhbGVydFBsYXllciIsInRhcmdldCIsInNlbmRlciIsInNlbmQiLCJkYXRhIiwiY29udGVudCIsIm1lc3NhZ2UiLCJtZXRhZGF0YSIsIm5hbWUiLCJjb2RlIiwidHlwZSIsIkFjdGl2aXR5TG9nIiwicHJvcHMiLCJtZXNzYWdlTG9nIiwic2VuZGVyRGF0YSIsImlzSG9zdCIsImlucHV0VGV4dCIsInNldElucHV0VGV4dCIsInJlZiIsImlucHV0UmVmIiwiY3VycmVudCIsInNjcm9sbEludG9WaWV3IiwiYmVoYXZpb3IiLCJzdHlsZSIsImp1c3RpZnlJdGVtcyIsImd1dHRlciIsInNwYW4iLCJoZWlnaHQiLCJvdmVyZmxvdyIsImxpc3QiLCJkaXYiLCJwYWRkaW5nQm90dG9tIiwidmFsdWUiLCJvbkNoYW5nZSIsImV2ZW50Iiwib25QcmVzc0VudGVyIiwiZm9jdXMiLCJjdXJzb3IiLCJzdWZmaXgiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/app/pages/ActivityLog.tsx\n"));

/***/ })

});