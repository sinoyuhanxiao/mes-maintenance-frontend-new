var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// mock/user.js
var user_exports = {};
__export(user_exports, {
  default: () => user_default
});
module.exports = __toCommonJS(user_exports);
var userInfo = () => {
  const result = {
    id: 9527,
    avatar: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
    name: "Erik Yu",
    phone: "15988888888",
    email: "454539387@qq.com",
    identity: "",
    roles: ["admin"]
  };
  return result;
};
var list = () => {
  const result = [];
  const total = 1e4 * 10;
  for (let i = 1; i <= total; i++) {
    const item = {
      id: "@increment",
      method: i % 4,
      deviceType: '@pick(["web", "glass", "mobile", "desktop", "others"])',
      // 设备名称
      deviceOs: '@pick(["win10", "win11", "ios", "android", "others"])',
      // 系统
      loginAddr: "@city(true)",
      // 登录地点
      loginTime: " @datetime()"
      // 最后登录时间
    };
    result.push(item);
  }
  return result;
};
var user_default = [
  {
    url: "/api/login",
    type: "get",
    response: (config) => {
      return {
        code: 200,
        message: "success",
        data: {
          token: "token"
        }
        // data: loginInfo()
      };
    }
  },
  {
    url: "/api/getUserInfo",
    type: "get",
    response: () => {
      return {
        code: 200,
        message: "success",
        data: userInfo()
      };
    }
  },
  {
    url: "/api/test",
    type: "get",
    response: () => {
      return {
        code: 5004,
        message: "fail",
        data: []
      };
    }
  },
  {
    url: "/api/logout",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "success"
      };
    }
  },
  {
    url: "/api/login/history",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibW9jay91c2VyLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkM6XFxcXERldlxcXFx2aXRlLWVsZW1lbnQtYWRtaW5cXFxcbW9ja1xcXFx1c2VyLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkM6XFxcXERldlxcXFx2aXRlLWVsZW1lbnQtYWRtaW5cXFxcbW9ja1wiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vQzovRGV2L3ZpdGUtZWxlbWVudC1hZG1pbi9tb2NrL3VzZXIuanNcIjtcclxuLy8gaHR0cDovL21vY2tqcy5jb20vZXhhbXBsZXMuaHRtbCNPYmplY3RcclxuY29uc3QgbG9naW5JbmZvID0gKCkgPT4ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IHtcclxuICAgIHRva2VuOiAndG9rZW4nXHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHRcclxufVxyXG5cclxuY29uc3QgdXNlckluZm8gPSAoKSA9PiB7XHJcbiAgY29uc3QgcmVzdWx0ID0ge1xyXG4gICAgaWQ6IDk1MjcsXHJcbiAgICBhdmF0YXI6ICdodHRwczovL3dwaW1nLndhbGxzdGNuLmNvbS9mNzc4NzM4Yy1lNGY4LTQ4NzAtYjYzNC01NjcwM2I0YWNhZmUuZ2lmJyxcclxuICAgIG5hbWU6ICdFcmlrIFl1JyxcclxuICAgIHBob25lOiAnMTU5ODg4ODg4ODgnLFxyXG4gICAgZW1haWw6ICc0NTQ1MzkzODdAcXEuY29tJyxcclxuICAgIGlkZW50aXR5OiAnJyxcclxuICAgIHJvbGVzOiBbJ2FkbWluJ10sXHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHRcclxufVxyXG5cclxuY29uc3QgbGlzdCA9ICgpID0+IHtcclxuICBjb25zdCByZXN1bHQgPSBbXVxyXG4gIC8vIGNvbnN0IHRvdGFsID0gMTAwMDAgKiAxMFxyXG4gIGNvbnN0IHRvdGFsID0gMTAwMDAgKiAxMFxyXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IHRvdGFsOyBpKyspIHtcclxuICAgIGNvbnN0IGl0ZW0gPSB7XHJcbiAgICAgIGlkOiAnQGluY3JlbWVudCcsXHJcbiAgICAgIG1ldGhvZCA6IGkgJSA0LFxyXG4gICAgICBkZXZpY2VUeXBlIDogJ0BwaWNrKFtcIndlYlwiLCBcImdsYXNzXCIsIFwibW9iaWxlXCIsIFwiZGVza3RvcFwiLCBcIm90aGVyc1wiXSknLCAvLyBcdThCQkVcdTU5MDdcdTU0MERcdTc5RjBcclxuICAgICAgZGV2aWNlT3MgOiAnQHBpY2soW1wid2luMTBcIiwgXCJ3aW4xMVwiLCBcImlvc1wiLCBcImFuZHJvaWRcIiwgXCJvdGhlcnNcIl0pJywgLy8gXHU3Q0ZCXHU3RURGXHJcbiAgICAgIGxvZ2luQWRkciA6ICdAY2l0eSh0cnVlKScsIC8vIFx1NzY3Qlx1NUY1NVx1NTczMFx1NzBCOVxyXG4gICAgICBsb2dpblRpbWUgOicgQGRhdGV0aW1lKCknLCAvLyBcdTY3MDBcdTU0MEVcdTc2N0JcdTVGNTVcdTY1RjZcdTk1RjRcclxuICAgIH1cclxuICAgIHJlc3VsdC5wdXNoKCBpdGVtICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzdWx0XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2xvZ2luJyxcclxuICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgcmVzcG9uc2U6IGNvbmZpZyA9PiB7XHJcbiAgICAgIC8vIGNvbnN0IHsgdXNlcm5hbWUgfSA9IGNvbmZpZy5ib2R5XHJcbiAgICAgIC8vIGNvbnN0IHRva2VuID0gdG9rZW5zW3VzZXJuYW1lXVxyXG4gICAgICAvLyBpZiAoIXRva2VuKSB7XHJcbiAgICAgIC8vICAgcmV0dXJuIHtcclxuICAgICAgLy8gICAgIGNvZGU6IDYwMjA0LFxyXG4gICAgICAvLyAgICAgbWVzc2FnZTogJ1x1OEQyNlx1NTNGN1x1NUJDNlx1NzgwMVx1OTUxOVx1OEJFRidcclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjb2RlOiAyMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgIHRva2VuOiAndG9rZW4nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRhdGE6IGxvZ2luSW5mbygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2dldFVzZXJJbmZvJyxcclxuICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgcmVzcG9uc2U6ICgpID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjb2RlOiAyMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ3N1Y2Nlc3MnLFxyXG4gICAgICAgIGRhdGE6IHVzZXJJbmZvKClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvdGVzdCcsXHJcbiAgICB0eXBlOiAnZ2V0JyxcclxuICAgIHJlc3BvbnNlOiAoKSA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgY29kZTogNTAwNCxcclxuICAgICAgICBtZXNzYWdlOiAnZmFpbCcsXHJcbiAgICAgICAgZGF0YTogW11cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHtcclxuICAgIHVybDogXCIvYXBpL2xvZ291dFwiLFxyXG4gICAgbWV0aG9kOiBcImdldFwiLFxyXG4gICAgcmVzcG9uc2U6ICgpID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjb2RlOiAyMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ3N1Y2Nlc3MnXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9sb2dpbi9oaXN0b3J5JyxcclxuICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgcmVzcG9uc2U6IGNvbmZpZyA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgY29kZTogMjAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdzdWNjZXNzJyxcclxuICAgICAgICBkYXRhOiBsaXN0KClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbl1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFTQSxJQUFNLFdBQVcsTUFBTTtBQUNyQixRQUFNLFNBQVM7QUFBQSxJQUNiLElBQUk7QUFBQSxJQUNKLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLE9BQU8sQ0FBQyxPQUFPO0FBQUEsRUFDakI7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxJQUFNLE9BQU8sTUFBTTtBQUNqQixRQUFNLFNBQVMsQ0FBQztBQUVoQixRQUFNLFFBQVEsTUFBUTtBQUN0QixXQUFTLElBQUksR0FBRyxLQUFLLE9BQU8sS0FBSztBQUMvQixVQUFNLE9BQU87QUFBQSxNQUNYLElBQUk7QUFBQSxNQUNKLFFBQVMsSUFBSTtBQUFBLE1BQ2IsWUFBYTtBQUFBO0FBQUEsTUFDYixVQUFXO0FBQUE7QUFBQSxNQUNYLFdBQVk7QUFBQTtBQUFBLE1BQ1osV0FBVztBQUFBO0FBQUEsSUFDYjtBQUNBLFdBQU8sS0FBTSxJQUFLO0FBQUEsRUFDcEI7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxJQUFPLGVBQVE7QUFBQSxFQUNiO0FBQUEsSUFDRSxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixVQUFVLFlBQVU7QUFTbEIsYUFBTztBQUFBLFFBQ0wsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFFBQ1QsTUFBTTtBQUFBLFVBQ0osT0FBTztBQUFBLFFBQ1Q7QUFBQTtBQUFBLE1BRUY7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUE7QUFBQSxJQUNFLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFVBQVUsTUFBTTtBQUNkLGFBQU87QUFBQSxRQUNMLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxRQUNULE1BQU0sU0FBUztBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBO0FBQUEsSUFDRSxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixVQUFVLE1BQU07QUFDZCxhQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsUUFDVCxNQUFNLENBQUM7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBO0FBQUEsSUFDRSxLQUFLO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixVQUFVLE1BQU07QUFDZCxhQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQTtBQUFBLElBQ0UsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sVUFBVSxZQUFVO0FBQ2xCLGFBQU87QUFBQSxRQUNMLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxRQUNULE1BQU0sS0FBSztBQUFBLE1BQ2I7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
