'use strict';
let instance = require('../utils/apiclient').instance
let Request = require('../models/request');

class State {
  constructor (name, collection) {
    this.name = name;
    this.collection = collection;
    this.requests = [];
  }

  static create (collection, name) {

    //Add the folder to the collection
    collection.item.push({
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

    return new State(name, collection);
  }

  addRequest (method, path, headers, body) {

    if(!headers || Object.keys(headers).length == 0) {
      headers = {}
    }

    if(!body) {
      body = "";
    }

    let newRequest = Request.create(this, method, path, headers, body);
    this.requests.push(newRequest);

    return newRequest;
  }

}

module.exports = State;