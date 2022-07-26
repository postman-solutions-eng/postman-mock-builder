'use strict';
let instance = require('../utils/apiclient').instance
let Request = require('../models/request');

class State {
  constructor (name, collectionId) {
    this.name = name;
    this.collectionId = collectionId;
    this.requests = [];
  }

  static async create (collectionId, name) {
    let response = await instance.get(`/collections/${collectionId}`);

    let data = response.data;

    //Add the folder to the collection
    data.collection.item.splice(data.collection.item.length - 1, 0,{
      name: name,
      item: [],
      event: [{
        listen: "prerequest",
        script: {
          type: "text/javascript",
          exec: [
            "//Expected State: " + name,
            "//To be popuplated by the API producer."
          ]
        }
      }]
    })

    response = await instance.put(`/collections/${collectionId}`, data)

    return new State(name, collectionId);
  }

  async addRequest (method, url, headers, body) {

    if(!headers || Object.keys(headers).length == 0) {
      headers = {}
    }

    if(!body) {
      body = "";
    }

    let newRequest = await Request.create(this, method, url, headers, body);
    this.requests.push(newRequest);

    return newRequest;
  }

}

module.exports = State;