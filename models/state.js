'use strict'
let Request = require('../models/request')

class State {
  constructor (name, collection) {
    this.name = name
    this.collection = collection
    this.requests = []
  }

  static create (collection, name) {
    let payload = {
      name: name,
      item: [],
      event: [
        {
          listen: 'prerequest',
          script: {
            type: 'text/javascript',
            exec: [
              '//Expected State: ' + name,
              '//To be popuplated by the API producer.'
            ]
          }
        }
      ]
    }

    //Add the folder to the collection
    if (collection.item.length == 1) {
      collection.item.push(payload)
    } else {
      collection.item.splice(collection.item.length - 1, 0, payload)
    }

    return new State(name, collection)
  }

  addRequest (options) {
    if (!options.headers || Object.keys(options.headers).length == 0) {
      options.headers = {}
    }

    if (!options.body) {
      options.body = ''
    }

    let newRequest = Request.create(this, options.method, options.path, options.headers, options.body)
    this.requests.push(newRequest)

    return newRequest
  }
}

module.exports = State
