const express = require("express");
var cors = require("cors");
// Access to .env configuration
require("dotenv/config");

const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");

// Connect to Database
connectDB();

const app = express();

// Gestion du CORS « Cross Origin Resource Sharing »
app.use(cors());

// Send anr retrieve data in the body using express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Override the default error
app.use(errorHandler);

// Routes
app.use("/api", require("./routes/homeRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/statistics", require("./routes/statisticsRoutes"));

// Listening to server
app.listen(process.env.PORT || 4002);
