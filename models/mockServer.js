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

    let response = await instance.post(
      `/collections?workspace=${workspaceId}`,
      {
        collection: {
          info: {
            name: `Contract Tests [${apiVersion}]`,
            description: `Contract Tests [${apiVersion}]`,
            schema:
              'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
          },
          item: []
        }
      }
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
