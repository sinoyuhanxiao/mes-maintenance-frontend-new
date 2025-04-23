var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// mock/api.js
var workorder_exports = {};
__export(workorder_exports, {
  default: () => workorder_default
});
module.exports = __toCommonJS(workorder_exports);
var import_mockjs = __toESM(require("mockjs"));
var list = () => {
  const result = [];
  const total = 14;
  for (let i = 1; i <= total; i++) {
    const item = {
      id: "@increment",
      work_order_code: '@date("yyyyMMdd")-WO-1-2-@string("number", 6)',
      // 工单编码格式
      name: "20T\u539F\u6599\u70B9\u68C00327",
      // 名称固定为这个
      creator: "@cname",
      // 创建人名字随机生成
      status: '@pick(["\u51C6\u5907\u5C31\u7EEA", "\u8FDB\u884C\u4E2D", "\u5DF2\u5B8C\u6210", "\u5F85\u5BA1\u6838"])',
      // 随机选择状态
      priority: '@pick(["\u4F4E", "\u4E2D", "\u9AD8"])',
      // 优先级随机
      progress: "@integer(0, 100) %",
      // 随机生成 0% - 100%
      associated_equipment: '@pick(["\u6CF5A", "\u8F93\u9001\u673AB", "\u673A\u5668C", "\u4F20\u611F\u5668D", "\u7535\u673AE"])',
      // 随机设备名
      date: '@date("yyyy-MM-dd")',
      // 随机生成日期
      createTime: "@datetime()"
      // 创建时间
    };
    result.push(import_mockjs.default.mock(item));
  }
  return result;
};
var workorder_default = [
  {
    url: "/api/workorders",
    type: "get",
    response: (config) => {
      return {
        code: 200,
        message: "success",
        data: list()
      };
    }
  }
];
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibW9jay93b3Jrb3JkZXIuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiQzpcXFxcRGV2XFxcXHZpdGUtZWxlbWVudC1hZG1pblxcXFxtb2NrXFxcXHdvcmtvcmRlci5qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJDOlxcXFxEZXZcXFxcdml0ZS1lbGVtZW50LWFkbWluXFxcXG1vY2tcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L0Rldi92aXRlLWVsZW1lbnQtYWRtaW4vbW9jay93b3Jrb3JkZXIuanNcIjtpbXBvcnQgTW9jayBmcm9tICdtb2NranMnXHJcblxyXG5jb25zdCBsaXN0ID0gKCkgPT4ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IFtdXHJcbiAgY29uc3QgdG90YWwgPSAxNCAvLyBcdTYzQTdcdTUyMzZcdTc1MUZcdTYyMTBcdTc2ODRcdTVERTVcdTUzNTVcdTY1NzBcdTkxQ0ZcclxuXHJcbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdG90YWw7IGkrKykge1xyXG4gICAgY29uc3QgaXRlbSA9IHtcclxuICAgICAgaWQ6ICdAaW5jcmVtZW50JyxcclxuICAgICAgd29ya19vcmRlcl9jb2RlOiAnQGRhdGUoXCJ5eXl5TU1kZFwiKS1XTy0xLTItQHN0cmluZyhcIm51bWJlclwiLCA2KScsIC8vIFx1NURFNVx1NTM1NVx1N0YxNlx1NzgwMVx1NjgzQ1x1NUYwRlxyXG4gICAgICBuYW1lOiAnMjBUXHU1MzlGXHU2NTk5XHU3MEI5XHU2OEMwMDMyNycsIC8vIFx1NTQwRFx1NzlGMFx1NTZGQVx1NUI5QVx1NEUzQVx1OEZEOVx1NEUyQVxyXG4gICAgICBjcmVhdG9yOiAnQGNuYW1lJywgLy8gXHU1MjFCXHU1RUZBXHU0RUJBXHU1NDBEXHU1QjU3XHU5NjhGXHU2NzNBXHU3NTFGXHU2MjEwXHJcbiAgICAgIHN0YXR1czogJ0BwaWNrKFtcIlx1NTFDNlx1NTkwN1x1NUMzMVx1N0VFQVwiLCBcIlx1OEZEQlx1ODg0Q1x1NEUyRFwiLCBcIlx1NURGMlx1NUI4Q1x1NjIxMFwiLCBcIlx1NUY4NVx1NUJBMVx1NjgzOFwiXSknLCAvLyBcdTk2OEZcdTY3M0FcdTkwMDlcdTYyRTlcdTcyQjZcdTYwMDFcclxuICAgICAgcHJpb3JpdHk6ICdAcGljayhbXCJcdTRGNEVcIiwgXCJcdTRFMkRcIiwgXCJcdTlBRDhcIl0pJywgLy8gXHU0RjE4XHU1MTQ4XHU3RUE3XHU5NjhGXHU2NzNBXHJcbiAgICAgIHByb2dyZXNzOiAnQGludGVnZXIoMCwgMTAwKSAlJywgLy8gXHU5NjhGXHU2NzNBXHU3NTFGXHU2MjEwIDAlIC0gMTAwJVxyXG4gICAgICBhc3NvY2lhdGVkX2VxdWlwbWVudDogJ0BwaWNrKFtcIlx1NkNGNUFcIiwgXCJcdThGOTNcdTkwMDFcdTY3M0FCXCIsIFwiXHU2NzNBXHU1NjY4Q1wiLCBcIlx1NEYyMFx1NjExRlx1NTY2OERcIiwgXCJcdTc1MzVcdTY3M0FFXCJdKScsIC8vIFx1OTY4Rlx1NjczQVx1OEJCRVx1NTkwN1x1NTQwRFxyXG4gICAgICBkYXRlOiAnQGRhdGUoXCJ5eXl5LU1NLWRkXCIpJywgLy8gXHU5NjhGXHU2NzNBXHU3NTFGXHU2MjEwXHU2NUU1XHU2NzFGXHJcbiAgICAgIGNyZWF0ZVRpbWU6ICdAZGF0ZXRpbWUoKScsIC8vIFx1NTIxQlx1NUVGQVx1NjVGNlx1OTVGNFxyXG4gICAgfVxyXG4gICAgcmVzdWx0LnB1c2goTW9jay5tb2NrKGl0ZW0pKVxyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL3dvcmtvcmRlcnMnLFxyXG4gICAgdHlwZTogJ2dldCcsXHJcbiAgICByZXNwb25zZTogY29uZmlnID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjb2RlOiAyMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgIGRhdGE6IGxpc3QoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5dXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUE0TyxvQkFBaUI7QUFFN1AsSUFBTSxPQUFPLE1BQU07QUFDakIsUUFBTSxTQUFTLENBQUM7QUFDaEIsUUFBTSxRQUFRO0FBRWQsV0FBUyxJQUFJLEdBQUcsS0FBSyxPQUFPLEtBQUs7QUFDL0IsVUFBTSxPQUFPO0FBQUEsTUFDWCxJQUFJO0FBQUEsTUFDSixpQkFBaUI7QUFBQTtBQUFBLE1BQ2pCLE1BQU07QUFBQTtBQUFBLE1BQ04sU0FBUztBQUFBO0FBQUEsTUFDVCxRQUFRO0FBQUE7QUFBQSxNQUNSLFVBQVU7QUFBQTtBQUFBLE1BQ1YsVUFBVTtBQUFBO0FBQUEsTUFDVixzQkFBc0I7QUFBQTtBQUFBLE1BQ3RCLE1BQU07QUFBQTtBQUFBLE1BQ04sWUFBWTtBQUFBO0FBQUEsSUFDZDtBQUNBLFdBQU8sS0FBSyxjQUFBQSxRQUFLLEtBQUssSUFBSSxDQUFDO0FBQUEsRUFDN0I7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxJQUFPLG9CQUFRO0FBQUEsRUFDYjtBQUFBLElBQ0UsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sVUFBVSxZQUFVO0FBQ2xCLGFBQU87QUFBQSxRQUNMLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxRQUNULE1BQU0sS0FBSztBQUFBLE1BQ2I7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJNb2NrIl0KfQo=
