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
  const total = 100;
  for (let i = 1; i <= total; i++) {
    const item = {
      ID: i,
      \u622A\u6B62\u65E5\u671F: '@date("2025-03-dd")',
      // 随机生成的截止日期
      \u5DE5\u5355\u53F7: '@date("yyyyMMdd")-WO-1-2-@string("number", 6)',
      // 工单编码格式
      \u5DE5\u5355\u9884\u89C8\u56FE: "https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3",
      \u8FDB\u5EA6: "@integer(0, 100) %",
      // 随机生成 0% - 100%
      \u4F18\u5148\u7EA7: '@pick(["\u4F4E", "\u4E2D", "\u9AD8"])',
      // 随机生成优先级
      \u7EF4\u62A4\u7C7B\u578B: '@pick(["\u9884\u9632\u6027\u7EF4\u62A4", "\u7EA0\u6B63\u6027\u7EF4\u62A4", "\u7D27\u6025\u7EF4\u62A4"])',
      // 随机生成维护类型
      \u7C7B\u522B: '@pick(["\u7535\u6C14", "\u673A\u68B0", "\u4EEA\u8868"])',
      // 随机生成类别
      \u6D3E\u53D1\u4EBA: "@cname",
      // 派发人随机生成名字
      \u521B\u5EFA\u8005: "@cname",
      // 创建者随机生成名字
      \u9884\u4F30\u65F6\u95F4: "@integer(1, 8) \u5C0F\u65F6"
      // 随机生成 1 - 8 小时
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibW9jay93b3Jrb3JkZXIuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiQzpcXFxcRGV2XFxcXHZpdGUtZWxlbWVudC1hZG1pblxcXFxtb2NrXFxcXHdvcmtvcmRlci5qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJDOlxcXFxEZXZcXFxcdml0ZS1lbGVtZW50LWFkbWluXFxcXG1vY2tcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0M6L0Rldi92aXRlLWVsZW1lbnQtYWRtaW4vbW9jay93b3Jrb3JkZXIuanNcIjtpbXBvcnQgTW9jayBmcm9tICdtb2NranMnXHJcblxyXG5jb25zdCBsaXN0ID0gKCkgPT4ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IFtdXHJcbiAgY29uc3QgdG90YWwgPSAxMDAgLy8gXHU2M0E3XHU1MjM2XHU3NTFGXHU2MjEwXHU3Njg0XHU1REU1XHU1MzU1XHU2NTcwXHU5MUNGXHJcblxyXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IHRvdGFsOyBpKyspIHtcclxuICAgIGNvbnN0IGl0ZW0gPSB7XHJcbiAgICAgIElEOiBpLFxyXG4gICAgICBcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUY6ICdAZGF0ZShcIjIwMjUtMDMtZGRcIiknLCAvLyBcdTk2OEZcdTY3M0FcdTc1MUZcdTYyMTBcdTc2ODRcdTYyMkFcdTZCNjJcdTY1RTVcdTY3MUZcclxuICAgICAgXHU1REU1XHU1MzU1XHU1M0Y3OiAnQGRhdGUoXCJ5eXl5TU1kZFwiKS1XTy0xLTItQHN0cmluZyhcIm51bWJlclwiLCA2KScsIC8vIFx1NURFNVx1NTM1NVx1N0YxNlx1NzgwMVx1NjgzQ1x1NUYwRlxyXG4gICAgICBcdTVERTVcdTUzNTVcdTk4ODRcdTg5QzhcdTU2RkU6ICdodHRwczovL3dwaW1nLndhbGxzdGNuLmNvbS9lNDU1ODA4Ni02MzFjLTQyNWMtOTQzMC01NmZmYjQ2ZTcwYjMnLFxyXG4gICAgICBcdThGREJcdTVFQTY6ICdAaW50ZWdlcigwLCAxMDApICUnLCAvLyBcdTk2OEZcdTY3M0FcdTc1MUZcdTYyMTAgMCUgLSAxMDAlXHJcbiAgICAgIFx1NEYxOFx1NTE0OFx1N0VBNzogJ0BwaWNrKFtcIlx1NEY0RVwiLCBcIlx1NEUyRFwiLCBcIlx1OUFEOFwiXSknLCAvLyBcdTk2OEZcdTY3M0FcdTc1MUZcdTYyMTBcdTRGMThcdTUxNDhcdTdFQTdcclxuICAgICAgXHU3RUY0XHU2MkE0XHU3QzdCXHU1NzhCOiAnQHBpY2soW1wiXHU5ODg0XHU5NjMyXHU2MDI3XHU3RUY0XHU2MkE0XCIsIFwiXHU3RUEwXHU2QjYzXHU2MDI3XHU3RUY0XHU2MkE0XCIsIFwiXHU3RDI3XHU2MDI1XHU3RUY0XHU2MkE0XCJdKScsIC8vIFx1OTY4Rlx1NjczQVx1NzUxRlx1NjIxMFx1N0VGNFx1NjJBNFx1N0M3Qlx1NTc4QlxyXG4gICAgICBcdTdDN0JcdTUyMkI6ICdAcGljayhbXCJcdTc1MzVcdTZDMTRcIiwgXCJcdTY3M0FcdTY4QjBcIiwgXCJcdTRFRUFcdTg4NjhcIl0pJywgLy8gXHU5NjhGXHU2NzNBXHU3NTFGXHU2MjEwXHU3QzdCXHU1MjJCXHJcbiAgICAgIFx1NkQzRVx1NTNEMVx1NEVCQTogJ0BjbmFtZScsIC8vIFx1NkQzRVx1NTNEMVx1NEVCQVx1OTY4Rlx1NjczQVx1NzUxRlx1NjIxMFx1NTQwRFx1NUI1N1xyXG4gICAgICBcdTUyMUJcdTVFRkFcdTgwMDU6ICdAY25hbWUnLCAvLyBcdTUyMUJcdTVFRkFcdTgwMDVcdTk2OEZcdTY3M0FcdTc1MUZcdTYyMTBcdTU0MERcdTVCNTdcclxuICAgICAgXHU5ODg0XHU0RjMwXHU2NUY2XHU5NUY0OiAnQGludGVnZXIoMSwgOCkgXHU1QzBGXHU2NUY2JywgLy8gXHU5NjhGXHU2NzNBXHU3NTFGXHU2MjEwIDEgLSA4IFx1NUMwRlx1NjVGNlxyXG4gICAgfVxyXG4gICAgcmVzdWx0LnB1c2goTW9jay5tb2NrKGl0ZW0pKVxyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL3dvcmtvcmRlcnMnLFxyXG4gICAgdHlwZTogJ2dldCcsXHJcbiAgICByZXNwb25zZTogY29uZmlnID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjb2RlOiAyMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgIGRhdGE6IGxpc3QoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5dXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUE0TyxvQkFBaUI7QUFFN1AsSUFBTSxPQUFPLE1BQU07QUFDakIsUUFBTSxTQUFTLENBQUM7QUFDaEIsUUFBTSxRQUFRO0FBRWQsV0FBUyxJQUFJLEdBQUcsS0FBSyxPQUFPLEtBQUs7QUFDL0IsVUFBTSxPQUFPO0FBQUEsTUFDWCxJQUFJO0FBQUEsTUFDSiwwQkFBTTtBQUFBO0FBQUEsTUFDTixvQkFBSztBQUFBO0FBQUEsTUFDTCxnQ0FBTztBQUFBLE1BQ1AsY0FBSTtBQUFBO0FBQUEsTUFDSixvQkFBSztBQUFBO0FBQUEsTUFDTCwwQkFBTTtBQUFBO0FBQUEsTUFDTixjQUFJO0FBQUE7QUFBQSxNQUNKLG9CQUFLO0FBQUE7QUFBQSxNQUNMLG9CQUFLO0FBQUE7QUFBQSxNQUNMLDBCQUFNO0FBQUE7QUFBQSxJQUNSO0FBQ0EsV0FBTyxLQUFLLGNBQUFBLFFBQUssS0FBSyxJQUFJLENBQUM7QUFBQSxFQUM3QjtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU8sb0JBQVE7QUFBQSxFQUNiO0FBQUEsSUFDRSxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixVQUFVLFlBQVU7QUFDbEIsYUFBTztBQUFBLFFBQ0wsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFFBQ1QsTUFBTSxLQUFLO0FBQUEsTUFDYjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbIk1vY2siXQp9Cg==
