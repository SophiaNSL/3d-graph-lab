/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/json-to-graphql-query/lib/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/json-to-graphql-query/lib/index.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction __export(m) {\n    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n}\nObject.defineProperty(exports, \"__esModule\", { value: true });\n__export(__webpack_require__(/*! ./jsonToGraphQLQuery */ \"./node_modules/json-to-graphql-query/lib/jsonToGraphQLQuery.js\"));\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///./node_modules/json-to-graphql-query/lib/index.js?");

/***/ }),

/***/ "./node_modules/json-to-graphql-query/lib/jsonToGraphQLQuery.js":
/*!**********************************************************************!*\
  !*** ./node_modules/json-to-graphql-query/lib/jsonToGraphQLQuery.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nfunction stringify(obj_from_json) {\n    if (obj_from_json instanceof EnumType) {\n        return obj_from_json.value;\n    }\n    else if (typeof obj_from_json !== 'object' || obj_from_json === null) {\n        return JSON.stringify(obj_from_json);\n    }\n    else if (Array.isArray(obj_from_json)) {\n        return \"[\" + obj_from_json.map(function (item) { return stringify(item); }).join(', ') + \"]\";\n    }\n    var props = Object\n        .keys(obj_from_json)\n        .map(function (key) { return key + \": \" + stringify(obj_from_json[key]); })\n        .join(', ');\n    return \"{\" + props + \"}\";\n}\nfunction buildArgs(argsObj) {\n    var args = [];\n    for (var argName in argsObj) {\n        args.push(argName + \": \" + stringify(argsObj[argName]));\n    }\n    return args.join(', ');\n}\nfunction getIndent(level) {\n    return Array((level * 4) + 1).join(' ');\n}\nfunction filterNonConfigFields(fieldName) {\n    return fieldName !== '__args' && fieldName !== '__alias';\n}\nfunction convertQuery(node, level, output) {\n    Object.keys(node)\n        .filter(filterNonConfigFields)\n        .forEach(function (key) {\n        if (typeof node[key] === 'object') {\n            var fieldCount = Object.keys(node[key]).filter(filterNonConfigFields).length;\n            var subFields = fieldCount > 0;\n            var token = void 0;\n            if (typeof node[key].__args === 'object') {\n                token = key + \" (\" + buildArgs(node[key].__args) + \")\";\n            }\n            else {\n                token = \"\" + key;\n            }\n            if (typeof node[key].__alias === 'string') {\n                token = node[key].__alias + \": \" + token;\n            }\n            output.push([token + (fieldCount > 0 ? ' {' : ''), level]);\n            convertQuery(node[key], level + 1, output);\n            if (subFields) {\n                output.push(['}', level]);\n            }\n        }\n        else if (node[key]) {\n            output.push([\"\" + key, level]);\n        }\n    });\n}\nfunction jsonToGraphQLQuery(query, options) {\n    if (options === void 0) { options = {}; }\n    if (!query || typeof query != 'object') {\n        throw new Error('query object not specified');\n    }\n    if (Object.keys(query).length == 0) {\n        throw new Error('query object has no data');\n    }\n    var queryLines = [];\n    convertQuery(query, 0, queryLines);\n    var output = '';\n    queryLines.forEach(function (_a) {\n        var line = _a[0], level = _a[1];\n        if (options.pretty) {\n            if (output) {\n                output += '\\n';\n            }\n            output += getIndent(level) + line;\n        }\n        else {\n            if (output) {\n                output += ' ';\n            }\n            output += line;\n        }\n    });\n    return output;\n}\nexports.jsonToGraphQLQuery = jsonToGraphQLQuery;\nvar EnumType = (function () {\n    function EnumType(value) {\n        this.value = value;\n    }\n    return EnumType;\n}());\nexports.EnumType = EnumType;\n//# sourceMappingURL=jsonToGraphQLQuery.js.map\n\n//# sourceURL=webpack:///./node_modules/json-to-graphql-query/lib/jsonToGraphQLQuery.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var json_to_graphql_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! json-to-graphql-query */ \"./node_modules/json-to-graphql-query/lib/index.js\");\n/* harmony import */ var json_to_graphql_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(json_to_graphql_query__WEBPACK_IMPORTED_MODULE_0__);\n\n\nconst default_uuid = \"6b5b5d6a-158c-11e7-803e-0242ac110017\"\n\n// graphql_query = '{ metadata (uuid: \\\"' + default_uuid + '\\\") { edges { node { uuid name } } } }',\nconst base_url = 'https://registry.aristotlemetadata.com/api/graphql/api?raw=true'\n\nvar graphql_query = {\n  query: {\n    dataElements: {\n      __args: {\n        uuid: default_uuid\n      },\n      edges: {\n        node: {\n          name: true\n        }\n      }\n    }\n  }\n}\n\nvar text_gql_query = Object(json_to_graphql_query__WEBPACK_IMPORTED_MODULE_0__[\"jsonToGraphQLQuery\"])(graphql_query)\nconsole.log(text_gql_query)\n\nconst request_options = {\n  'method': 'GET',\n  'headers': {\n    'Accept': 'application/json',\n  },\n  'mode': 'cors',\n}\n\nvar url = base_url + '&query=' + text_gql_query\nvar display_data = {}\n\nfunction reset_data() {\n  display_data = {\n    'nodes': [],\n    'links': []\n  }\n}\n\nfunction dfs(data, superitem) {\n  // Depth first search on returned graphql data\n  // to build 3d-force-graph data\n  // assumes structure is a tree\n  \n  console.log(data)\n  var keys = Object.keys(data)\n  //console.log(keys)\n  \n  if ('uuid' in data) {\n    superitem = data['uuid']\n  }\n\n  for (var i=0; i < keys.length; i++) {\n    var key = keys[i]\n\n    if (key == 'edges') {\n      for (var j=0; j < data['edges'].length; j++) {\n        var edge = data['edges'][j]\n        dfs(edge, superitem)\n      }\n    } else if (key == 'node') {\n      //console.log('adding a node')\n      display_data['nodes'].push({\n        'id': data['node']['uuid'],\n        'name': data['node']['name'],\n        'val': 1\n      })\n      \n      if (superitem != null) {\n        display_data['links'].push({\n          'source': superitem,\n          'target': data['node']['uuid']\n        })\n      }\n\n      dfs(data['node'], superitem)\n    } else {\n      var item = data[key]\n      console.log(typeof item)\n      if (typeof item == 'object') {\n        dfs(item, superitem)\n      }\n    }\n  }\n\n}\n\nfetch(url, request_options).then(\n  function(response) {\n    console.log(response.status)\n    response.json().then(\n      function(data) {\n        reset_data()\n        dfs(data['data'], null)\n    })\n  }\n);\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });