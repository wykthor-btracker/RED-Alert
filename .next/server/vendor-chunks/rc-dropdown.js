"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/rc-dropdown";
exports.ids = ["vendor-chunks/rc-dropdown"];
exports.modules = {

/***/ "(ssr)/./node_modules/rc-dropdown/es/Dropdown.js":
/*!*************************************************!*\
  !*** ./node_modules/rc-dropdown/es/Dropdown.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ \"(ssr)/./node_modules/@babel/runtime/helpers/esm/extends.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ \"(ssr)/./node_modules/@babel/runtime/helpers/esm/defineProperty.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ \"(ssr)/./node_modules/@babel/runtime/helpers/esm/slicedToArray.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ \"(ssr)/./node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js\");\n/* harmony import */ var _rc_component_trigger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @rc-component/trigger */ \"(ssr)/./node_modules/@rc-component/trigger/es/index.js\");\n/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! classnames */ \"(ssr)/./node_modules/classnames/index.js\");\n/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rc-util/es/ref */ \"(ssr)/./node_modules/rc-util/es/ref.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _hooks_useAccessibility__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./hooks/useAccessibility */ \"(ssr)/./node_modules/rc-dropdown/es/hooks/useAccessibility.js\");\n/* harmony import */ var _Overlay__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Overlay */ \"(ssr)/./node_modules/rc-dropdown/es/Overlay.js\");\n/* harmony import */ var _placements__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./placements */ \"(ssr)/./node_modules/rc-dropdown/es/placements.js\");\n\n\n\n\nvar _excluded = [\"arrow\", \"prefixCls\", \"transitionName\", \"animation\", \"align\", \"placement\", \"placements\", \"getPopupContainer\", \"showAction\", \"hideAction\", \"overlayClassName\", \"overlayStyle\", \"visible\", \"trigger\", \"autoFocus\", \"overlay\", \"children\", \"onVisibleChange\"];\n\n\n\n\n\n\n\nfunction Dropdown(props, ref) {\n  var _children$props;\n  var _props$arrow = props.arrow,\n    arrow = _props$arrow === void 0 ? false : _props$arrow,\n    _props$prefixCls = props.prefixCls,\n    prefixCls = _props$prefixCls === void 0 ? 'rc-dropdown' : _props$prefixCls,\n    transitionName = props.transitionName,\n    animation = props.animation,\n    align = props.align,\n    _props$placement = props.placement,\n    placement = _props$placement === void 0 ? 'bottomLeft' : _props$placement,\n    _props$placements = props.placements,\n    placements = _props$placements === void 0 ? _placements__WEBPACK_IMPORTED_MODULE_10__[\"default\"] : _props$placements,\n    getPopupContainer = props.getPopupContainer,\n    showAction = props.showAction,\n    hideAction = props.hideAction,\n    overlayClassName = props.overlayClassName,\n    overlayStyle = props.overlayStyle,\n    visible = props.visible,\n    _props$trigger = props.trigger,\n    trigger = _props$trigger === void 0 ? ['hover'] : _props$trigger,\n    autoFocus = props.autoFocus,\n    overlay = props.overlay,\n    children = props.children,\n    onVisibleChange = props.onVisibleChange,\n    otherProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(props, _excluded);\n  var _React$useState = react__WEBPACK_IMPORTED_MODULE_7___default().useState(),\n    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(_React$useState, 2),\n    triggerVisible = _React$useState2[0],\n    setTriggerVisible = _React$useState2[1];\n  var mergedVisible = 'visible' in props ? visible : triggerVisible;\n  var triggerRef = react__WEBPACK_IMPORTED_MODULE_7___default().useRef(null);\n  var overlayRef = react__WEBPACK_IMPORTED_MODULE_7___default().useRef(null);\n  var childRef = react__WEBPACK_IMPORTED_MODULE_7___default().useRef(null);\n  react__WEBPACK_IMPORTED_MODULE_7___default().useImperativeHandle(ref, function () {\n    return triggerRef.current;\n  });\n  var handleVisibleChange = function handleVisibleChange(newVisible) {\n    setTriggerVisible(newVisible);\n    onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(newVisible);\n  };\n  (0,_hooks_useAccessibility__WEBPACK_IMPORTED_MODULE_8__[\"default\"])({\n    visible: mergedVisible,\n    triggerRef: childRef,\n    onVisibleChange: handleVisibleChange,\n    autoFocus: autoFocus,\n    overlayRef: overlayRef\n  });\n  var onClick = function onClick(e) {\n    var onOverlayClick = props.onOverlayClick;\n    setTriggerVisible(false);\n    if (onOverlayClick) {\n      onOverlayClick(e);\n    }\n  };\n  var getMenuElement = function getMenuElement() {\n    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default().createElement(_Overlay__WEBPACK_IMPORTED_MODULE_9__[\"default\"], {\n      ref: overlayRef,\n      overlay: overlay,\n      prefixCls: prefixCls,\n      arrow: arrow\n    });\n  };\n  var getMenuElementOrLambda = function getMenuElementOrLambda() {\n    if (typeof overlay === 'function') {\n      return getMenuElement;\n    }\n    return getMenuElement();\n  };\n  var getMinOverlayWidthMatchTrigger = function getMinOverlayWidthMatchTrigger() {\n    var minOverlayWidthMatchTrigger = props.minOverlayWidthMatchTrigger,\n      alignPoint = props.alignPoint;\n    if ('minOverlayWidthMatchTrigger' in props) {\n      return minOverlayWidthMatchTrigger;\n    }\n    return !alignPoint;\n  };\n  var getOpenClassName = function getOpenClassName() {\n    var openClassName = props.openClassName;\n    if (openClassName !== undefined) {\n      return openClassName;\n    }\n    return \"\".concat(prefixCls, \"-open\");\n  };\n  var childrenNode = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default().cloneElement(children, {\n    className: classnames__WEBPACK_IMPORTED_MODULE_5___default()((_children$props = children.props) === null || _children$props === void 0 ? void 0 : _children$props.className, mergedVisible && getOpenClassName()),\n    ref: (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__.supportRef)(children) ? (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__.composeRef)(childRef, children.ref) : undefined\n  });\n  var triggerHideAction = hideAction;\n  if (!triggerHideAction && trigger.indexOf('contextMenu') !== -1) {\n    triggerHideAction = ['click'];\n  }\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default().createElement(_rc_component_trigger__WEBPACK_IMPORTED_MODULE_4__[\"default\"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n    builtinPlacements: placements\n  }, otherProps, {\n    prefixCls: prefixCls,\n    ref: triggerRef,\n    popupClassName: classnames__WEBPACK_IMPORTED_MODULE_5___default()(overlayClassName, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({}, \"\".concat(prefixCls, \"-show-arrow\"), arrow)),\n    popupStyle: overlayStyle,\n    action: trigger,\n    showAction: showAction,\n    hideAction: triggerHideAction,\n    popupPlacement: placement,\n    popupAlign: align,\n    popupTransitionName: transitionName,\n    popupAnimation: animation,\n    popupVisible: mergedVisible,\n    stretch: getMinOverlayWidthMatchTrigger() ? 'minWidth' : '',\n    popup: getMenuElementOrLambda(),\n    onPopupVisibleChange: handleVisibleChange,\n    onPopupClick: onClick,\n    getPopupContainer: getPopupContainer\n  }), childrenNode);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default().forwardRef(Dropdown));//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmMtZHJvcGRvd24vZXMvRHJvcGRvd24uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBMEQ7QUFDYztBQUNGO0FBQ29CO0FBQzFGO0FBQzRDO0FBQ1I7QUFDb0I7QUFDOUI7QUFDOEI7QUFDeEI7QUFDTTtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Qsb0RBQVU7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLDhGQUF3QjtBQUN6Qyx3QkFBd0IscURBQWM7QUFDdEMsdUJBQXVCLG9GQUFjO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixtREFBWTtBQUMvQixtQkFBbUIsbURBQVk7QUFDL0IsaUJBQWlCLG1EQUFZO0FBQzdCLEVBQUUsZ0VBQXlCO0FBQzNCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxtRUFBZ0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLDBEQUFtQixDQUFDLGdEQUFPO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLHlEQUFrQjtBQUNwRCxlQUFlLGlEQUFVO0FBQ3pCLFNBQVMsMERBQVUsYUFBYSwwREFBVTtBQUMxQyxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsMERBQW1CLENBQUMsNkRBQU8sRUFBRSw4RUFBUTtBQUMzRDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0Esb0JBQW9CLGlEQUFVLG1CQUFtQixxRkFBZSxHQUFHO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSw4RUFBNEIsdURBQWdCLFVBQVUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zb3VuZGJvYXJkLy4vbm9kZV9tb2R1bGVzL3JjLWRyb3Bkb3duL2VzL0Ryb3Bkb3duLmpzP2JjYTYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9leHRlbmRzIGZyb20gXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9leHRlbmRzXCI7XG5pbXBvcnQgX2RlZmluZVByb3BlcnR5IGZyb20gXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9kZWZpbmVQcm9wZXJ0eVwiO1xuaW1wb3J0IF9zbGljZWRUb0FycmF5IGZyb20gXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9zbGljZWRUb0FycmF5XCI7XG5pbXBvcnQgX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzIGZyb20gXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9vYmplY3RXaXRob3V0UHJvcGVydGllc1wiO1xudmFyIF9leGNsdWRlZCA9IFtcImFycm93XCIsIFwicHJlZml4Q2xzXCIsIFwidHJhbnNpdGlvbk5hbWVcIiwgXCJhbmltYXRpb25cIiwgXCJhbGlnblwiLCBcInBsYWNlbWVudFwiLCBcInBsYWNlbWVudHNcIiwgXCJnZXRQb3B1cENvbnRhaW5lclwiLCBcInNob3dBY3Rpb25cIiwgXCJoaWRlQWN0aW9uXCIsIFwib3ZlcmxheUNsYXNzTmFtZVwiLCBcIm92ZXJsYXlTdHlsZVwiLCBcInZpc2libGVcIiwgXCJ0cmlnZ2VyXCIsIFwiYXV0b0ZvY3VzXCIsIFwib3ZlcmxheVwiLCBcImNoaWxkcmVuXCIsIFwib25WaXNpYmxlQ2hhbmdlXCJdO1xuaW1wb3J0IFRyaWdnZXIgZnJvbSAnQHJjLWNvbXBvbmVudC90cmlnZ2VyJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgY29tcG9zZVJlZiwgc3VwcG9ydFJlZiB9IGZyb20gXCJyYy11dGlsL2VzL3JlZlwiO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB1c2VBY2Nlc3NpYmlsaXR5IGZyb20gXCIuL2hvb2tzL3VzZUFjY2Vzc2liaWxpdHlcIjtcbmltcG9ydCBPdmVybGF5IGZyb20gXCIuL092ZXJsYXlcIjtcbmltcG9ydCBQbGFjZW1lbnRzIGZyb20gXCIuL3BsYWNlbWVudHNcIjtcbmZ1bmN0aW9uIERyb3Bkb3duKHByb3BzLCByZWYpIHtcbiAgdmFyIF9jaGlsZHJlbiRwcm9wcztcbiAgdmFyIF9wcm9wcyRhcnJvdyA9IHByb3BzLmFycm93LFxuICAgIGFycm93ID0gX3Byb3BzJGFycm93ID09PSB2b2lkIDAgPyBmYWxzZSA6IF9wcm9wcyRhcnJvdyxcbiAgICBfcHJvcHMkcHJlZml4Q2xzID0gcHJvcHMucHJlZml4Q2xzLFxuICAgIHByZWZpeENscyA9IF9wcm9wcyRwcmVmaXhDbHMgPT09IHZvaWQgMCA/ICdyYy1kcm9wZG93bicgOiBfcHJvcHMkcHJlZml4Q2xzLFxuICAgIHRyYW5zaXRpb25OYW1lID0gcHJvcHMudHJhbnNpdGlvbk5hbWUsXG4gICAgYW5pbWF0aW9uID0gcHJvcHMuYW5pbWF0aW9uLFxuICAgIGFsaWduID0gcHJvcHMuYWxpZ24sXG4gICAgX3Byb3BzJHBsYWNlbWVudCA9IHByb3BzLnBsYWNlbWVudCxcbiAgICBwbGFjZW1lbnQgPSBfcHJvcHMkcGxhY2VtZW50ID09PSB2b2lkIDAgPyAnYm90dG9tTGVmdCcgOiBfcHJvcHMkcGxhY2VtZW50LFxuICAgIF9wcm9wcyRwbGFjZW1lbnRzID0gcHJvcHMucGxhY2VtZW50cyxcbiAgICBwbGFjZW1lbnRzID0gX3Byb3BzJHBsYWNlbWVudHMgPT09IHZvaWQgMCA/IFBsYWNlbWVudHMgOiBfcHJvcHMkcGxhY2VtZW50cyxcbiAgICBnZXRQb3B1cENvbnRhaW5lciA9IHByb3BzLmdldFBvcHVwQ29udGFpbmVyLFxuICAgIHNob3dBY3Rpb24gPSBwcm9wcy5zaG93QWN0aW9uLFxuICAgIGhpZGVBY3Rpb24gPSBwcm9wcy5oaWRlQWN0aW9uLFxuICAgIG92ZXJsYXlDbGFzc05hbWUgPSBwcm9wcy5vdmVybGF5Q2xhc3NOYW1lLFxuICAgIG92ZXJsYXlTdHlsZSA9IHByb3BzLm92ZXJsYXlTdHlsZSxcbiAgICB2aXNpYmxlID0gcHJvcHMudmlzaWJsZSxcbiAgICBfcHJvcHMkdHJpZ2dlciA9IHByb3BzLnRyaWdnZXIsXG4gICAgdHJpZ2dlciA9IF9wcm9wcyR0cmlnZ2VyID09PSB2b2lkIDAgPyBbJ2hvdmVyJ10gOiBfcHJvcHMkdHJpZ2dlcixcbiAgICBhdXRvRm9jdXMgPSBwcm9wcy5hdXRvRm9jdXMsXG4gICAgb3ZlcmxheSA9IHByb3BzLm92ZXJsYXksXG4gICAgY2hpbGRyZW4gPSBwcm9wcy5jaGlsZHJlbixcbiAgICBvblZpc2libGVDaGFuZ2UgPSBwcm9wcy5vblZpc2libGVDaGFuZ2UsXG4gICAgb3RoZXJQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIF9SZWFjdCR1c2VTdGF0ZSA9IFJlYWN0LnVzZVN0YXRlKCksXG4gICAgX1JlYWN0JHVzZVN0YXRlMiA9IF9zbGljZWRUb0FycmF5KF9SZWFjdCR1c2VTdGF0ZSwgMiksXG4gICAgdHJpZ2dlclZpc2libGUgPSBfUmVhY3QkdXNlU3RhdGUyWzBdLFxuICAgIHNldFRyaWdnZXJWaXNpYmxlID0gX1JlYWN0JHVzZVN0YXRlMlsxXTtcbiAgdmFyIG1lcmdlZFZpc2libGUgPSAndmlzaWJsZScgaW4gcHJvcHMgPyB2aXNpYmxlIDogdHJpZ2dlclZpc2libGU7XG4gIHZhciB0cmlnZ2VyUmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xuICB2YXIgb3ZlcmxheVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcbiAgdmFyIGNoaWxkUmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xuICBSZWFjdC51c2VJbXBlcmF0aXZlSGFuZGxlKHJlZiwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0cmlnZ2VyUmVmLmN1cnJlbnQ7XG4gIH0pO1xuICB2YXIgaGFuZGxlVmlzaWJsZUNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZVZpc2libGVDaGFuZ2UobmV3VmlzaWJsZSkge1xuICAgIHNldFRyaWdnZXJWaXNpYmxlKG5ld1Zpc2libGUpO1xuICAgIG9uVmlzaWJsZUNoYW5nZSA9PT0gbnVsbCB8fCBvblZpc2libGVDaGFuZ2UgPT09IHZvaWQgMCB8fCBvblZpc2libGVDaGFuZ2UobmV3VmlzaWJsZSk7XG4gIH07XG4gIHVzZUFjY2Vzc2liaWxpdHkoe1xuICAgIHZpc2libGU6IG1lcmdlZFZpc2libGUsXG4gICAgdHJpZ2dlclJlZjogY2hpbGRSZWYsXG4gICAgb25WaXNpYmxlQ2hhbmdlOiBoYW5kbGVWaXNpYmxlQ2hhbmdlLFxuICAgIGF1dG9Gb2N1czogYXV0b0ZvY3VzLFxuICAgIG92ZXJsYXlSZWY6IG92ZXJsYXlSZWZcbiAgfSk7XG4gIHZhciBvbkNsaWNrID0gZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgdmFyIG9uT3ZlcmxheUNsaWNrID0gcHJvcHMub25PdmVybGF5Q2xpY2s7XG4gICAgc2V0VHJpZ2dlclZpc2libGUoZmFsc2UpO1xuICAgIGlmIChvbk92ZXJsYXlDbGljaykge1xuICAgICAgb25PdmVybGF5Q2xpY2soZSk7XG4gICAgfVxuICB9O1xuICB2YXIgZ2V0TWVudUVsZW1lbnQgPSBmdW5jdGlvbiBnZXRNZW51RWxlbWVudCgpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoT3ZlcmxheSwge1xuICAgICAgcmVmOiBvdmVybGF5UmVmLFxuICAgICAgb3ZlcmxheTogb3ZlcmxheSxcbiAgICAgIHByZWZpeENsczogcHJlZml4Q2xzLFxuICAgICAgYXJyb3c6IGFycm93XG4gICAgfSk7XG4gIH07XG4gIHZhciBnZXRNZW51RWxlbWVudE9yTGFtYmRhID0gZnVuY3Rpb24gZ2V0TWVudUVsZW1lbnRPckxhbWJkYSgpIHtcbiAgICBpZiAodHlwZW9mIG92ZXJsYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBnZXRNZW51RWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIGdldE1lbnVFbGVtZW50KCk7XG4gIH07XG4gIHZhciBnZXRNaW5PdmVybGF5V2lkdGhNYXRjaFRyaWdnZXIgPSBmdW5jdGlvbiBnZXRNaW5PdmVybGF5V2lkdGhNYXRjaFRyaWdnZXIoKSB7XG4gICAgdmFyIG1pbk92ZXJsYXlXaWR0aE1hdGNoVHJpZ2dlciA9IHByb3BzLm1pbk92ZXJsYXlXaWR0aE1hdGNoVHJpZ2dlcixcbiAgICAgIGFsaWduUG9pbnQgPSBwcm9wcy5hbGlnblBvaW50O1xuICAgIGlmICgnbWluT3ZlcmxheVdpZHRoTWF0Y2hUcmlnZ2VyJyBpbiBwcm9wcykge1xuICAgICAgcmV0dXJuIG1pbk92ZXJsYXlXaWR0aE1hdGNoVHJpZ2dlcjtcbiAgICB9XG4gICAgcmV0dXJuICFhbGlnblBvaW50O1xuICB9O1xuICB2YXIgZ2V0T3BlbkNsYXNzTmFtZSA9IGZ1bmN0aW9uIGdldE9wZW5DbGFzc05hbWUoKSB7XG4gICAgdmFyIG9wZW5DbGFzc05hbWUgPSBwcm9wcy5vcGVuQ2xhc3NOYW1lO1xuICAgIGlmIChvcGVuQ2xhc3NOYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBvcGVuQ2xhc3NOYW1lO1xuICAgIH1cbiAgICByZXR1cm4gXCJcIi5jb25jYXQocHJlZml4Q2xzLCBcIi1vcGVuXCIpO1xuICB9O1xuICB2YXIgY2hpbGRyZW5Ob2RlID0gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChjaGlsZHJlbiwge1xuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lcygoX2NoaWxkcmVuJHByb3BzID0gY2hpbGRyZW4ucHJvcHMpID09PSBudWxsIHx8IF9jaGlsZHJlbiRwcm9wcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2NoaWxkcmVuJHByb3BzLmNsYXNzTmFtZSwgbWVyZ2VkVmlzaWJsZSAmJiBnZXRPcGVuQ2xhc3NOYW1lKCkpLFxuICAgIHJlZjogc3VwcG9ydFJlZihjaGlsZHJlbikgPyBjb21wb3NlUmVmKGNoaWxkUmVmLCBjaGlsZHJlbi5yZWYpIDogdW5kZWZpbmVkXG4gIH0pO1xuICB2YXIgdHJpZ2dlckhpZGVBY3Rpb24gPSBoaWRlQWN0aW9uO1xuICBpZiAoIXRyaWdnZXJIaWRlQWN0aW9uICYmIHRyaWdnZXIuaW5kZXhPZignY29udGV4dE1lbnUnKSAhPT0gLTEpIHtcbiAgICB0cmlnZ2VySGlkZUFjdGlvbiA9IFsnY2xpY2snXTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoVHJpZ2dlciwgX2V4dGVuZHMoe1xuICAgIGJ1aWx0aW5QbGFjZW1lbnRzOiBwbGFjZW1lbnRzXG4gIH0sIG90aGVyUHJvcHMsIHtcbiAgICBwcmVmaXhDbHM6IHByZWZpeENscyxcbiAgICByZWY6IHRyaWdnZXJSZWYsXG4gICAgcG9wdXBDbGFzc05hbWU6IGNsYXNzTmFtZXMob3ZlcmxheUNsYXNzTmFtZSwgX2RlZmluZVByb3BlcnR5KHt9LCBcIlwiLmNvbmNhdChwcmVmaXhDbHMsIFwiLXNob3ctYXJyb3dcIiksIGFycm93KSksXG4gICAgcG9wdXBTdHlsZTogb3ZlcmxheVN0eWxlLFxuICAgIGFjdGlvbjogdHJpZ2dlcixcbiAgICBzaG93QWN0aW9uOiBzaG93QWN0aW9uLFxuICAgIGhpZGVBY3Rpb246IHRyaWdnZXJIaWRlQWN0aW9uLFxuICAgIHBvcHVwUGxhY2VtZW50OiBwbGFjZW1lbnQsXG4gICAgcG9wdXBBbGlnbjogYWxpZ24sXG4gICAgcG9wdXBUcmFuc2l0aW9uTmFtZTogdHJhbnNpdGlvbk5hbWUsXG4gICAgcG9wdXBBbmltYXRpb246IGFuaW1hdGlvbixcbiAgICBwb3B1cFZpc2libGU6IG1lcmdlZFZpc2libGUsXG4gICAgc3RyZXRjaDogZ2V0TWluT3ZlcmxheVdpZHRoTWF0Y2hUcmlnZ2VyKCkgPyAnbWluV2lkdGgnIDogJycsXG4gICAgcG9wdXA6IGdldE1lbnVFbGVtZW50T3JMYW1iZGEoKSxcbiAgICBvblBvcHVwVmlzaWJsZUNoYW5nZTogaGFuZGxlVmlzaWJsZUNoYW5nZSxcbiAgICBvblBvcHVwQ2xpY2s6IG9uQ2xpY2ssXG4gICAgZ2V0UG9wdXBDb250YWluZXI6IGdldFBvcHVwQ29udGFpbmVyXG4gIH0pLCBjaGlsZHJlbk5vZGUpO1xufVxuZXhwb3J0IGRlZmF1bHQgLyojX19QVVJFX18qL1JlYWN0LmZvcndhcmRSZWYoRHJvcGRvd24pOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/rc-dropdown/es/Dropdown.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/rc-dropdown/es/Overlay.js":
/*!************************************************!*\
  !*** ./node_modules/rc-dropdown/es/Overlay.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var rc_util_es_ref__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/ref */ \"(ssr)/./node_modules/rc-util/es/ref.js\");\n\n\nvar Overlay = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(function (props, ref) {\n  var overlay = props.overlay,\n    arrow = props.arrow,\n    prefixCls = props.prefixCls;\n  var overlayNode = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(function () {\n    var overlayElement;\n    if (typeof overlay === 'function') {\n      overlayElement = overlay();\n    } else {\n      overlayElement = overlay;\n    }\n    return overlayElement;\n  }, [overlay]);\n  var composedRef = (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_1__.composeRef)(ref, overlayNode === null || overlayNode === void 0 ? void 0 : overlayNode.ref);\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, arrow && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(\"div\", {\n    className: \"\".concat(prefixCls, \"-arrow\")\n  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().cloneElement(overlayNode, {\n    ref: (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_1__.supportRef)(overlayNode) ? composedRef : undefined\n  }));\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Overlay);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmMtZHJvcGRvd24vZXMvT3ZlcmxheS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQW1EO0FBQ0s7QUFDeEQsMkJBQTJCLGlEQUFVO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw4Q0FBTztBQUMzQjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILG9CQUFvQiwwREFBVTtBQUM5QixzQkFBc0IsMERBQW1CLENBQUMsdURBQWMsOEJBQThCLDBEQUFtQjtBQUN6RztBQUNBLEdBQUcsZ0JBQWdCLHlEQUFrQjtBQUNyQyxTQUFTLDBEQUFVO0FBQ25CLEdBQUc7QUFDSCxDQUFDO0FBQ0QsaUVBQWUsT0FBTyIsInNvdXJjZXMiOlsid2VicGFjazovL3NvdW5kYm9hcmQvLi9ub2RlX21vZHVsZXMvcmMtZHJvcGRvd24vZXMvT3ZlcmxheS5qcz9lYWM3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY29tcG9zZVJlZiwgc3VwcG9ydFJlZiB9IGZyb20gXCJyYy11dGlsL2VzL3JlZlwiO1xudmFyIE92ZXJsYXkgPSAvKiNfX1BVUkVfXyovZm9yd2FyZFJlZihmdW5jdGlvbiAocHJvcHMsIHJlZikge1xuICB2YXIgb3ZlcmxheSA9IHByb3BzLm92ZXJsYXksXG4gICAgYXJyb3cgPSBwcm9wcy5hcnJvdyxcbiAgICBwcmVmaXhDbHMgPSBwcm9wcy5wcmVmaXhDbHM7XG4gIHZhciBvdmVybGF5Tm9kZSA9IHVzZU1lbW8oZnVuY3Rpb24gKCkge1xuICAgIHZhciBvdmVybGF5RWxlbWVudDtcbiAgICBpZiAodHlwZW9mIG92ZXJsYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG92ZXJsYXlFbGVtZW50ID0gb3ZlcmxheSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdmVybGF5RWxlbWVudCA9IG92ZXJsYXk7XG4gICAgfVxuICAgIHJldHVybiBvdmVybGF5RWxlbWVudDtcbiAgfSwgW292ZXJsYXldKTtcbiAgdmFyIGNvbXBvc2VkUmVmID0gY29tcG9zZVJlZihyZWYsIG92ZXJsYXlOb2RlID09PSBudWxsIHx8IG92ZXJsYXlOb2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvdmVybGF5Tm9kZS5yZWYpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIGFycm93ICYmIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICBjbGFzc05hbWU6IFwiXCIuY29uY2F0KHByZWZpeENscywgXCItYXJyb3dcIilcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jbG9uZUVsZW1lbnQob3ZlcmxheU5vZGUsIHtcbiAgICByZWY6IHN1cHBvcnRSZWYob3ZlcmxheU5vZGUpID8gY29tcG9zZWRSZWYgOiB1bmRlZmluZWRcbiAgfSkpO1xufSk7XG5leHBvcnQgZGVmYXVsdCBPdmVybGF5OyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/rc-dropdown/es/Overlay.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/rc-dropdown/es/hooks/useAccessibility.js":
/*!***************************************************************!*\
  !*** ./node_modules/rc-dropdown/es/hooks/useAccessibility.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ useAccessibility)\n/* harmony export */ });\n/* harmony import */ var rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/KeyCode */ \"(ssr)/./node_modules/rc-util/es/KeyCode.js\");\n/* harmony import */ var rc_util_es_raf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/raf */ \"(ssr)/./node_modules/rc-util/es/raf.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nvar ESC = rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_0__[\"default\"].ESC,\n  TAB = rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_0__[\"default\"].TAB;\nfunction useAccessibility(_ref) {\n  var visible = _ref.visible,\n    triggerRef = _ref.triggerRef,\n    onVisibleChange = _ref.onVisibleChange,\n    autoFocus = _ref.autoFocus,\n    overlayRef = _ref.overlayRef;\n  var focusMenuRef = react__WEBPACK_IMPORTED_MODULE_2__.useRef(false);\n  var handleCloseMenuAndReturnFocus = function handleCloseMenuAndReturnFocus() {\n    if (visible) {\n      var _triggerRef$current, _triggerRef$current$f;\n      (_triggerRef$current = triggerRef.current) === null || _triggerRef$current === void 0 || (_triggerRef$current$f = _triggerRef$current.focus) === null || _triggerRef$current$f === void 0 || _triggerRef$current$f.call(_triggerRef$current);\n      onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(false);\n    }\n  };\n  var focusMenu = function focusMenu() {\n    var _overlayRef$current;\n    if ((_overlayRef$current = overlayRef.current) !== null && _overlayRef$current !== void 0 && _overlayRef$current.focus) {\n      overlayRef.current.focus();\n      focusMenuRef.current = true;\n      return true;\n    }\n    return false;\n  };\n  var handleKeyDown = function handleKeyDown(event) {\n    switch (event.keyCode) {\n      case ESC:\n        handleCloseMenuAndReturnFocus();\n        break;\n      case TAB:\n        {\n          var focusResult = false;\n          if (!focusMenuRef.current) {\n            focusResult = focusMenu();\n          }\n          if (focusResult) {\n            event.preventDefault();\n          } else {\n            handleCloseMenuAndReturnFocus();\n          }\n          break;\n        }\n    }\n  };\n  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(function () {\n    if (visible) {\n      window.addEventListener(\"keydown\", handleKeyDown);\n      if (autoFocus) {\n        // FIXME: hack with raf\n        (0,rc_util_es_raf__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(focusMenu, 3);\n      }\n      return function () {\n        window.removeEventListener(\"keydown\", handleKeyDown);\n        focusMenuRef.current = false;\n      };\n    }\n    return function () {\n      focusMenuRef.current = false;\n    };\n  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmMtZHJvcGRvd24vZXMvaG9va3MvdXNlQWNjZXNzaWJpbGl0eS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUF5QztBQUNSO0FBQ0Y7QUFDL0IsVUFBVSwwREFBTztBQUNqQixRQUFRLDBEQUFPO0FBQ0E7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHlDQUFZO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSw0Q0FBZTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsMERBQUc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGNBQWM7QUFDakIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zb3VuZGJvYXJkLy4vbm9kZV9tb2R1bGVzL3JjLWRyb3Bkb3duL2VzL2hvb2tzL3VzZUFjY2Vzc2liaWxpdHkuanM/MjgwMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2V5Q29kZSBmcm9tIFwicmMtdXRpbC9lcy9LZXlDb2RlXCI7XG5pbXBvcnQgcmFmIGZyb20gXCJyYy11dGlsL2VzL3JhZlwiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG52YXIgRVNDID0gS2V5Q29kZS5FU0MsXG4gIFRBQiA9IEtleUNvZGUuVEFCO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdXNlQWNjZXNzaWJpbGl0eShfcmVmKSB7XG4gIHZhciB2aXNpYmxlID0gX3JlZi52aXNpYmxlLFxuICAgIHRyaWdnZXJSZWYgPSBfcmVmLnRyaWdnZXJSZWYsXG4gICAgb25WaXNpYmxlQ2hhbmdlID0gX3JlZi5vblZpc2libGVDaGFuZ2UsXG4gICAgYXV0b0ZvY3VzID0gX3JlZi5hdXRvRm9jdXMsXG4gICAgb3ZlcmxheVJlZiA9IF9yZWYub3ZlcmxheVJlZjtcbiAgdmFyIGZvY3VzTWVudVJlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSk7XG4gIHZhciBoYW5kbGVDbG9zZU1lbnVBbmRSZXR1cm5Gb2N1cyA9IGZ1bmN0aW9uIGhhbmRsZUNsb3NlTWVudUFuZFJldHVybkZvY3VzKCkge1xuICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICB2YXIgX3RyaWdnZXJSZWYkY3VycmVudCwgX3RyaWdnZXJSZWYkY3VycmVudCRmO1xuICAgICAgKF90cmlnZ2VyUmVmJGN1cnJlbnQgPSB0cmlnZ2VyUmVmLmN1cnJlbnQpID09PSBudWxsIHx8IF90cmlnZ2VyUmVmJGN1cnJlbnQgPT09IHZvaWQgMCB8fCAoX3RyaWdnZXJSZWYkY3VycmVudCRmID0gX3RyaWdnZXJSZWYkY3VycmVudC5mb2N1cykgPT09IG51bGwgfHwgX3RyaWdnZXJSZWYkY3VycmVudCRmID09PSB2b2lkIDAgfHwgX3RyaWdnZXJSZWYkY3VycmVudCRmLmNhbGwoX3RyaWdnZXJSZWYkY3VycmVudCk7XG4gICAgICBvblZpc2libGVDaGFuZ2UgPT09IG51bGwgfHwgb25WaXNpYmxlQ2hhbmdlID09PSB2b2lkIDAgfHwgb25WaXNpYmxlQ2hhbmdlKGZhbHNlKTtcbiAgICB9XG4gIH07XG4gIHZhciBmb2N1c01lbnUgPSBmdW5jdGlvbiBmb2N1c01lbnUoKSB7XG4gICAgdmFyIF9vdmVybGF5UmVmJGN1cnJlbnQ7XG4gICAgaWYgKChfb3ZlcmxheVJlZiRjdXJyZW50ID0gb3ZlcmxheVJlZi5jdXJyZW50KSAhPT0gbnVsbCAmJiBfb3ZlcmxheVJlZiRjdXJyZW50ICE9PSB2b2lkIDAgJiYgX292ZXJsYXlSZWYkY3VycmVudC5mb2N1cykge1xuICAgICAgb3ZlcmxheVJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICBmb2N1c01lbnVSZWYuY3VycmVudCA9IHRydWU7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICB2YXIgaGFuZGxlS2V5RG93biA9IGZ1bmN0aW9uIGhhbmRsZUtleURvd24oZXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgRVNDOlxuICAgICAgICBoYW5kbGVDbG9zZU1lbnVBbmRSZXR1cm5Gb2N1cygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVEFCOlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIGZvY3VzUmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgaWYgKCFmb2N1c01lbnVSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgZm9jdXNSZXN1bHQgPSBmb2N1c01lbnUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGZvY3VzUmVzdWx0KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVDbG9zZU1lbnVBbmRSZXR1cm5Gb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgfTtcbiAgUmVhY3QudXNlRWZmZWN0KGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodmlzaWJsZSkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZUtleURvd24pO1xuICAgICAgaWYgKGF1dG9Gb2N1cykge1xuICAgICAgICAvLyBGSVhNRTogaGFjayB3aXRoIHJhZlxuICAgICAgICByYWYoZm9jdXNNZW51LCAzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVLZXlEb3duKTtcbiAgICAgICAgZm9jdXNNZW51UmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBmb2N1c01lbnVSZWYuY3VycmVudCA9IGZhbHNlO1xuICAgIH07XG4gIH0sIFt2aXNpYmxlXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/rc-dropdown/es/hooks/useAccessibility.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/rc-dropdown/es/index.js":
/*!**********************************************!*\
  !*** ./node_modules/rc-dropdown/es/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _Dropdown__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dropdown */ \"(ssr)/./node_modules/rc-dropdown/es/Dropdown.js\");\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_Dropdown__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmMtZHJvcGRvd24vZXMvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBa0M7QUFDbEMsaUVBQWUsaURBQVEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zb3VuZGJvYXJkLy4vbm9kZV9tb2R1bGVzL3JjLWRyb3Bkb3duL2VzL2luZGV4LmpzPzA2NTAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERyb3Bkb3duIGZyb20gXCIuL0Ryb3Bkb3duXCI7XG5leHBvcnQgZGVmYXVsdCBEcm9wZG93bjsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/rc-dropdown/es/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/rc-dropdown/es/placements.js":
/*!***************************************************!*\
  !*** ./node_modules/rc-dropdown/es/placements.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nvar autoAdjustOverflow = {\n  adjustX: 1,\n  adjustY: 1\n};\nvar targetOffset = [0, 0];\nvar placements = {\n  topLeft: {\n    points: ['bl', 'tl'],\n    overflow: autoAdjustOverflow,\n    offset: [0, -4],\n    targetOffset: targetOffset\n  },\n  top: {\n    points: ['bc', 'tc'],\n    overflow: autoAdjustOverflow,\n    offset: [0, -4],\n    targetOffset: targetOffset\n  },\n  topRight: {\n    points: ['br', 'tr'],\n    overflow: autoAdjustOverflow,\n    offset: [0, -4],\n    targetOffset: targetOffset\n  },\n  bottomLeft: {\n    points: ['tl', 'bl'],\n    overflow: autoAdjustOverflow,\n    offset: [0, 4],\n    targetOffset: targetOffset\n  },\n  bottom: {\n    points: ['tc', 'bc'],\n    overflow: autoAdjustOverflow,\n    offset: [0, 4],\n    targetOffset: targetOffset\n  },\n  bottomRight: {\n    points: ['tr', 'br'],\n    overflow: autoAdjustOverflow,\n    offset: [0, 4],\n    targetOffset: targetOffset\n  }\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (placements);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmMtZHJvcGRvd24vZXMvcGxhY2VtZW50cy5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWUsVUFBVSIsInNvdXJjZXMiOlsid2VicGFjazovL3NvdW5kYm9hcmQvLi9ub2RlX21vZHVsZXMvcmMtZHJvcGRvd24vZXMvcGxhY2VtZW50cy5qcz81NDdjIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBhdXRvQWRqdXN0T3ZlcmZsb3cgPSB7XG4gIGFkanVzdFg6IDEsXG4gIGFkanVzdFk6IDFcbn07XG52YXIgdGFyZ2V0T2Zmc2V0ID0gWzAsIDBdO1xudmFyIHBsYWNlbWVudHMgPSB7XG4gIHRvcExlZnQ6IHtcbiAgICBwb2ludHM6IFsnYmwnLCAndGwnXSxcbiAgICBvdmVyZmxvdzogYXV0b0FkanVzdE92ZXJmbG93LFxuICAgIG9mZnNldDogWzAsIC00XSxcbiAgICB0YXJnZXRPZmZzZXQ6IHRhcmdldE9mZnNldFxuICB9LFxuICB0b3A6IHtcbiAgICBwb2ludHM6IFsnYmMnLCAndGMnXSxcbiAgICBvdmVyZmxvdzogYXV0b0FkanVzdE92ZXJmbG93LFxuICAgIG9mZnNldDogWzAsIC00XSxcbiAgICB0YXJnZXRPZmZzZXQ6IHRhcmdldE9mZnNldFxuICB9LFxuICB0b3BSaWdodDoge1xuICAgIHBvaW50czogWydicicsICd0ciddLFxuICAgIG92ZXJmbG93OiBhdXRvQWRqdXN0T3ZlcmZsb3csXG4gICAgb2Zmc2V0OiBbMCwgLTRdLFxuICAgIHRhcmdldE9mZnNldDogdGFyZ2V0T2Zmc2V0XG4gIH0sXG4gIGJvdHRvbUxlZnQ6IHtcbiAgICBwb2ludHM6IFsndGwnLCAnYmwnXSxcbiAgICBvdmVyZmxvdzogYXV0b0FkanVzdE92ZXJmbG93LFxuICAgIG9mZnNldDogWzAsIDRdLFxuICAgIHRhcmdldE9mZnNldDogdGFyZ2V0T2Zmc2V0XG4gIH0sXG4gIGJvdHRvbToge1xuICAgIHBvaW50czogWyd0YycsICdiYyddLFxuICAgIG92ZXJmbG93OiBhdXRvQWRqdXN0T3ZlcmZsb3csXG4gICAgb2Zmc2V0OiBbMCwgNF0sXG4gICAgdGFyZ2V0T2Zmc2V0OiB0YXJnZXRPZmZzZXRcbiAgfSxcbiAgYm90dG9tUmlnaHQ6IHtcbiAgICBwb2ludHM6IFsndHInLCAnYnInXSxcbiAgICBvdmVyZmxvdzogYXV0b0FkanVzdE92ZXJmbG93LFxuICAgIG9mZnNldDogWzAsIDRdLFxuICAgIHRhcmdldE9mZnNldDogdGFyZ2V0T2Zmc2V0XG4gIH1cbn07XG5leHBvcnQgZGVmYXVsdCBwbGFjZW1lbnRzOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/rc-dropdown/es/placements.js\n");

/***/ })

};
;