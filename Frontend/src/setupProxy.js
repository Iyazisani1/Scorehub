const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/football-data",
    createProxyMiddleware({
      target: "https://api.football-data.org/v4",
      changeOrigin: true,
      pathRewrite: {
        "^/api/football-data": "",
      },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader(
          "X-Auth-Token",
          process.env.REACT_APP_FOOTBALL_API_KEY
        );
      },
      onError: (err, req, res) => {
        console.error("Proxy Error:", err);
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            message: "Something went wrong. Please try again later.",
          })
        );
      },
    })
  );
};
