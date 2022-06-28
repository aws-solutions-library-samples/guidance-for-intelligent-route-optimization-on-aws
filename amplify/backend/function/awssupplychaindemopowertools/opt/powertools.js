const { Logger } = require("@aws-lambda-powertools/logger");

const awsLambdaPowertoolsVersion = "0.11.1-rc.0";

const logger = new Logger({
  persistentLogAttributes: {
    logger: {
      name: "@aws-lambda-powertools/logger",
      version: awsLambdaPowertoolsVersion,
    },
  },
  logLevel: "DEBUG",
});

module.exports = {
  logger,
};
