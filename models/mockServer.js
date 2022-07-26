'use strict'
let instance = require('../utils/apiclient').instance;
let State = require('../models/state');
const fs = require('fs');

class MockServer {

  constructor (id, url, name, collectionId, collectionDir, apiVersion) {
    this.id = id
    this.url = url
    this.name = name
    this.collectionId = collectionId
    this.states = [],
    this.collectionDir = collectionDir,
    this.apiVersion = apiVersion
  }

  static async create (options) {

    let workspaceId = options.workspaceId;
    let apiVersion = options.apiVersion;

    if (!options.collectionDir) {
      options.collectionDir = "";
    }

    let collection = {
      collection: {
        info: {
          name: `Contract Tests [${apiVersion}]`,
          description: `Contract Tests [${apiVersion}]`,
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [{
          name: "Setup",
          item: [{
            name: "Set Variables",
            event: [
              {
                listen: "test",
                script: {
                  exec: [
                    "//Used to differentiate between individual tests and tests run using the collection runner.",
                    "let testResults = {",
                    "  id: pm.variables.replaceIn('{{$guid}}'),",
                    "  createdDate: Date.now(),",
                    "  apiVersion: \"" + options.apiVersion + "\",",
                    "  states: []",
                    "};",
                    "pm.variables.set(\"testResults\", JSON.stringify(testResults));"
                  ],
                  type: "text/javascript"
                }
              }
            ],
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "https://postman-echo.com/get",
                protocol: "https",
                host: [
                  "postman-echo",
                  "com"
                ],
                path: [
                  "get"
                ]
              }
            },
            "response": []
          }]
        }]
      }
    }

    if(options.consumerUrl) {
      collection.collection.item.push({
        name: "Notify Consumer",
        item: [{
          name: "POST Notify Consumer",
          event: [
            {
              listen: "prerequest",
              script: {
                exec: [
                  "if(!pm.variables.get(\"testResults\")) {",
                  "    throw new Error(\"Cannot notify consumers outside of a full collection run.\")",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [],
            body: {
              mode: "raw",
              raw: "{{testResults}}",
              options: {
                raw: {
                  language: "json"
                }
              }
            },
            url: {
              raw: "http://9bkmurlbexqk0hin.b.requestbin.net",
              protocol: "http",
              host: [
                "9bkmurlbexqk0hin",
                "b",
                "requestbin",
                "net"
              ]
            }
          },
          "response": []
        }]
      })
    }

    let response = await instance.post(
      `/collections?workspace=${workspaceId}`,
      collection
    )

    let data = response.data
    let collectionId = data.collection.uid

    //Create a mock server request.
    let mockResponse = await instance.post(`/mocks?workspace=${workspaceId}`, {
      mock: {
        collection: collectionId,
        name: `Contract Tests [${apiVersion}]`
      }
    })

    return new MockServer(
      mockResponse.data.mock.uid,
      mockResponse.data.mock.mockUrl,
      mockResponse.data.mock.name,
      mockResponse.data.mock.collection,
      options.collectionDir,
      apiVersion
    )
  }

  async addState(state) {
    let newState = await State.create(this.collectionId, state);
    this.states.push(newState);

    return newState;
  }

  async addVariable(name, value) {
    let response = await instance.get(`/collections/${this.collectionId}`)
    let data = response.data;

    if(!data.collection.variable) {
      data.collection.variable = [];
    }

    //TODO - Replace variable if it has the same name.

    data.collection.variable.push({
      key: name,
      value: value,
      type: "string"
    })
    
    response = await instance.put(`/collections/${this.collectionId}`, data)

    return response.data;
  }

  async finalize(options) {

    if(!this.collectionDir || this.collectionDir == "") {
      throw new Error("Pactman collection directory not specified. Please specify the collectionDir when creating the mock server.");
    }

    let response = await instance.get(`/collections/${this.collectionId}`)
    let data = response.data;

    if (!fs.existsSync(this.collectionDir)) {
        //console.log('Directory not found, creating');
        fs.mkdirSync(this.collectionDir);
    }

    fs.writeFileSync(`${this.collectionDir}/contract-test-api-${this.apiVersion}-${new Date().getUTCMilliseconds()}.json`, JSON.stringify(data, null, 2));

    //delete the mock server and collection

    if(options && options.deleteMock && options.deleteMock == true) {
      //console.log("deleting mock server: /mocks/" + this.id)
      await instance.delete(`/mocks/${this.id}`)
    }
    
    if(options && options.deleteCollection && options.deleteCollection == true) {
      //console.log("deleting collection: /collections/" + this.collectionId)
      await instance.delete(`/collections/${this.collectionId}`)
    }

    return;
  }
}

module.exports = MockServer
