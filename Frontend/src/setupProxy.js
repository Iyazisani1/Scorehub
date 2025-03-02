const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/football-data",
    createProxyMiddleware({
      target: "https://api.football-data.org/v4",
      changeOrigin: true,
      pathRewrite: { "^/api/football-data": "" },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader(
          "X-Auth-Token",
          process.env.REACT_APP_FOOTBALL_API_KEY
        );
      },
    })
  );

  app.use(
    "/api/api-football",
    createProxyMiddleware({
      target: "https://v3.football.api-sports.io",
      changeOrigin: true,
      pathRewrite: { "^/api/api-football": "" },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader(
          "x-apisports-key",
          process.env.REACT_APP_API_FOOTBALL_KEY
        );
      },
    })
  );
};
