'use strict'
let instance = require('../utils/apiclient').instance
let State = require('../models/state')

class MockServer {
  constructor (id, url, name, collectionId) {
    this.id = id
    this.url = url
    this.name = name
    this.collectionId = collectionId
    this.states = []
  }

  static async create (workspaceId, apiVersion) {
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
      mockResponse.data.mock.collection
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

    data.collection.variable.push({
      key: name,
      value: value,
      type: "string"
    })
    
    response = await instance.put(`/collections/${this.collectionId}`, data)

    return response.data;
  }

  //Iterate through all collections and delete each one
  static async deleteAll(workspaceId) {

    if(!workspaceId){
      throw new Error('Workspace ID is required.')
    }

    let response = await instance.get(`/collections?workspace=${workspaceId}`);
    let data = response.data;

    for(let collection of data.collections) {
      console.log("deleting collection:" + collection.uid);
      //await instance.delete(`/collections/${collection.uid}`);
    }
    return response.data;
  }
}

module.exports = MockServer
