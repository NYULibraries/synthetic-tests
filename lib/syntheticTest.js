const axios = require("axios");
const reporting = require("./reporting");
const { errorHandler, isRedirectStatus } = require("./utils");

// receive the http/https response
const httpResponse = async (url, expectedResponseTime) => {
  let apiRes;
  const config = {
    maxRedirects: 0,
    timeout: expectedResponseTime,
  };

  try {
    const data = await axios.get(url, config);
    apiRes = data;
  } catch (err) {
    // if the error is unrelated to http response, handle the error directly
    if (err.response === undefined) {
      apiRes = errorHandler(err, expectedResponseTime);
    } else {
      // catches 404 responses
      apiRes = err.response;
    }
  } finally {
    return { res: apiRes };
  }
};

// compare the http/https response against parameters
const testHttpResponse = async ({
  url,
  expectedStatus,
  expectedResponseTime,
  expectedRedirectLocation,
}) => {
  expectedResponseTime = Number(expectedResponseTime);

  const data = await httpResponse(url, expectedResponseTime).catch((e) => {
    console.error(e);
  });

  // if the data contains the parameters we need, continue
  if (data.res) {
    const realStatus = data.res.status;
    const dataHeaders = data.res.headers;
    expectedStatus = Number(expectedStatus);

    // test the accuracy of the redirect location, then of the status, and lastly the response time
    // otherwise, return true.

    if (
      isRedirectStatus({
        url,
        realStatus,
        dataHeaders,
        expectedRedirectLocation,
      }) === "false"
    ) {
      return {
        case: "relocation",
        actual: dataHeaders.location,
        expected: expectedRedirectLocation,
        url: url,
      };
    } else if (data.res.hasOwnProperty("timeout")) {
      return {
        case: "time",
        url: url,
        time: expectedResponseTime,
      };
    } else if (realStatus !== expectedStatus) {
      return {
        case: "status",
        actual: realStatus,
        expected: expectedStatus,
        url: url,
      };
    } else {
      return true;
    }
  }
};

// call sendMessage if the http/https response is unexpected
const checkUrl = async (parameters) => {
  const httpResult = await testHttpResponse(parameters).catch((e) =>
    console.error(e)
  );
  if (httpResult !== true) {
    await reporting.sendMessage(httpResult);
    return {
      message: `Test failed: Sent message to Slack with parameters: ${JSON.stringify(
        parameters
      )}`,
      success: false,
    };
  }
  return {
    message: "Test passed, did not send message to Slack",
    success: true,
  };
};

module.exports = {
  checkUrl,
  testHttpResponse,
  httpResponse,
};
