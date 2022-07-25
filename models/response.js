'use strict'
const createSchema = require('genson-js').createSchema;
let instance = require('../utils/apiclient').instance

class Response {
  constructor (request, status, body, headers) {
    this.request = request
    this.status = status
    this.body = body
    this.headers = headers
  }

  static async create (request, status, body, headers) {
    let response = await instance.get(`/collections/${request.state.collectionId}`)

    let data = response.data

    for (let item of data.collection.item) {
      if (item.name == request.state.name) {
        for (let requestConfig of item.item) {

          if (requestConfig.name == `${request.method} ${request.url}`) {
            //Calculate URL
            let urlParts = request.url.split('/').reverse()
            urlParts.splice(3, urlParts.length)

            //Calculate response headers array
            if (Object.keys(headers).length > 0) {
              let newHeaders = []

              Object.keys(headers).map(function (key, index) {
                newHeaders.push({
                  key: key,
                  value: headers[key],
                  type: 'text'
                })
              })

              headers = newHeaders
            } else {
              headers = []
            }

            //Add the x-mock-match header to the request.
            request.headers.push({
              key: 'x-mock-response-code',
              value: status,
              type: 'text'
            });

            requestConfig.request.header = request.headers;

            //Add the response config to the item
            requestConfig.response.push({
              name: `${request.method} ${request.url}`,
              originalRequest: {
                method: request.method,
                header: request.headers,
                url: {
                  raw: request.url,
                  host: ['{{baseUrl}}'],
                  path: urlParts.reverse()
                },
                body: {
                  mode: "raw",
                  raw: JSON.stringify(request.body),
                  options: {
                    raw: {
                      language: "json"
                    }
                  }
                }
              },
              code: parseInt(status),
              status: lookupStatus(parseInt(status)),
              _postman_previewlanguage: 'json',
              body: JSON.stringify(body),
              header: headers
            })

            if (!requestConfig.event) {
              requestConfig.event = []
            }

            const schema = JSON.stringify(createSchema(body));

            let requestDetails = JSON.stringify({
              apiVersion: request.state.apiVersion,
              state: request.state.name,
              request: request.name,
              tests: []
            });

            requestConfig.event.push({
              listen: 'test',
              script: {
                exec: [
                  "let testResults = pm.collectionVariables.get(\"test-results\");",
									"",
									"if(!testResults) {",
									"    testResults = [];",
									"} else {",
									"    testResults = JSON.parse(testResults);",
									"}",
									"",
									"let test = \"\";",
									"let passed = null;",
									"",
									"let requestDetails = " + requestDetails + ";",
									"",
                  '//Validate status code matches expected status code',
                  "test = 'Status code is " + status + "';",
									"passed = false;",
                  "pm.test('Status code is " + status + "', function () {",
                  "    try {",
									"        pm.response.to.have.status(" + status + ");",
									"        passed = true;",
									"    } finally {",
									"        requestDetails.tests.push({",
									"            test: test,",
									"            result: passed,",
									"            datetime: Date.now()",
									"        })",
									"    }",
									"});",
                  "var Ajv = require('ajv'),",
                  "ajv = new Ajv({logger: console});",
                  "let schema = " + schema + ";",
									"",
									"//Validate response schema matches expected schema",
                  "test = 'Validate schema';",
									"passed = false;",
									"pm.test(test, () => {",
									"    ",
									"    try {",
									"        var data = pm.response.json();",
									"        pm.expect(ajv.validate(schema, data)).to.be.true;",
									"        passed = true;",
									"    } finally {",
									"        requestDetails.tests.push({",
									"            test: test,",
									"            result: passed,",
									"            datetime: Date.now()",
									"        })",
									"    }",
									"});",
									"",
									"testResults.push(requestDetails);",
									"pm.collectionVariables.set(\"test-results\", JSON.stringify(testResults));"
								],
								"type": "text/javascript"
              }
            })
          }
        }
      }
    }

    response = await instance.put(`/collections/${request.state.collectionId}`, data)
    return new Response(request, status, body, headers)
  }

  
}

//Returns the text representation of the status code
function lookupStatus(status) {
  switch (status) {
    case 200:
      return 'OK'
    case 201:
      return 'Created'
    case 202:
      return 'Accepted'
    case 204:
      return 'No Content'
    case 400:
      return 'Bad Request'
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Forbidden'
    case 404:
      return 'Not Found'
    case 405:
      return 'Method Not Allowed'
    case 409:
      return 'Conflict'
    case 500:
      return 'Internal Server Error'
    case 501:
      return 'Not Implemented'
    case 502:
      return 'Bad Gateway'
    case 503:
      return 'Service Unavailable'
    default:
      return 'Unknown'
  }
}

module.exports = Response
