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

    data.collection.item.push({
      name: name,
      item: []
    })

    response = await instance.put(`/collections/${collectionId}`, data)

    return new State(name, collectionId);
  }

  async addRequest (method, url, options) {

    if(!options){
      options = {}
    }

    let newRequest = await Request.create(this.collectionId, this.name, method, url, options);
    this.requests.push(newRequest);

    return newRequest;
  }

}

module.exports = State;