const express = require('express');
const enhancement = require('./modules/resume-enhancement/route');
const establishDatabaseConnection = require('./utils/database');
const sawggerUi = require('swagger-ui-express')
const cors = require('cors')
const swaggerDocument = require('../doc/swagger.json');
const logger = require('./utils/logger');
const { globalErrorHandler, routeNotFound } = require('./middlewares/error')
const app = express();

const port = process.env.PORT || 3000;

establishDatabaseConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({ methods: ["POST", "PUT", "DELETE", "GET", "PATCH"], origin: "*" })
);
app.use("/api/v1/resumes", enhancement);
app.use("/api/docs", sawggerUi.serve, sawggerUi.setup(swaggerDocument))
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome to Resume Enhancement API 🔥🔥" });
});



app.use(routeNotFound)
app.use(globalErrorHandler)

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
