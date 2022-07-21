'use strict';
let instance = require('../utils/apiclient').instance

class Request {
  constructor (method, url, options, state) {
    this.method = method;
    this.url = url;
    this.options = options;
    this.state = state;
  }

  static async create (collectionId, state, method, url, options) {
    
    let response = await instance.get(`/collections/${collectionId}`);

    let data = response.data;

    console.log(data.collection.item)

    for(let item of data.collection.item){
      if(item.name == state){

        let urlParts =  url.split('/').reverse();

        urlParts.splice(3, urlParts.length)

        item.item.push({
          name: `${method} ${url}`,
          header: [],
          request: {
            method: method,
            url: {
              raw: url,
              protocol: '',
              host: '{{baseUrl}}',
              path: urlParts.reverse()
            }
          },
          response: []
        })
      }
    }

    console.log(JSON.stringify(data.collection.item))

    response = await instance.put(`/collections/${collectionId}`, data)

    return new Request(method, url, options, state);
  }
}

module.exports = Request;