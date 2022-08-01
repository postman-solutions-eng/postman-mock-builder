'use strict'
const createSchema = require('genson-js').createSchema;
const urlPathToArray = require('../utils/common').urlPathToArray;
const formatHeaders = require('../utils/common').formatHeaders;
let instance = require('../utils/apiclient').instance


class Response {
  constructor (request, status, headers, body) {
    this.request = request
    this.status = status
    this.body = body
    this.headers = headers
  }

  static create (request, status, headers, body, uuid) {

    for (let folder of request.state.collection.item) {
      if (folder.name == request.state.name) {
        for (let requestConfig of folder.item) {
          if (requestConfig.name == `${request.method} ${request.path}`) {
            
            headers = formatHeaders(headers);

            //Add the x-mock-response-name header to the request.
            request.headers.push({
              key: 'x-mock-response-name',
              value: `${request.method} ${request.path} ${uuid}`,
              type: 'text'
            });

            requestConfig.request.header = request.headers;

            //Add the response config to the item
            requestConfig.response.push({
              name: `${request.method} ${request.path} ${uuid}`,
              originalRequest: {
                method: request.method,
                header: request.headers,
                url: {
                  raw: request.path,
                  host: ['{{baseUrl}}'],
                  path: request.path.split('/')
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
              request: `${request.method} ${request.path}`,
              tests: []
            });

            requestConfig.event.push({
              listen: 'test',
              script: {
                exec: [
									"let test = \"\";",
									"let passed = null;",
									"",
									"let requestDetails = " + requestDetails + ";",
									"",
                  '//Validate status code matches expected status code',
                  "test = 'Status code is " + status + "';",
									"passed = false;",
                  "pm.test(test, () => {",
                  "    try {",
									"        pm.response.to.have.status(" + status + ");",
									"        passed = true;",
									"    } finally {",
									"        requestDetails.tests.push({",
									"            test: test,",
									"            passed: passed,",
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
									"            passed: passed,",
									"            datetime: Date.now()",
									"        })",
									"    }",
									"});",
									"",
									"if(pm.variables.get(\"testResults\")) {",
									"    let testResults = JSON.parse(pm.variables.get(\"testResults\"));",
                  "",
                  "    if(!testResults.states['"+request.state.name+"']) {",
                  "        testResults.states['"+request.state.name+"'] = [];",
                  "    }",
                  "",
									"    testResults.states['"+request.state.name+"'].push(requestDetails);",
									"    pm.variables.set(\"testResults\", JSON.stringify(testResults))",
									"    console.log(\"testResults\", testResults)",
									"}"
								],
								"type": "text/javascript"
              }
            })
          }
        }
      }
    }

    return new Response(request, status, headers, body)
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
