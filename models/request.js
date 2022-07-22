'use strict';
let instance = require('../utils/apiclient').instance
let Response = require('../models/response');

class Request {
  constructor (method, url, headers, body, state) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
    this.state = state;
    this.responses = [];
  }

  static async create (state, method, url, headers, body) {
    
    //Get the current collection
    let response = await instance.get(`/collections/${state.collectionId}`);

    let data = response.data;

    //Find the state
    for(let item of data.collection.item){
      if(item.name == state.name){

        //Calculate URL
        let urlParts =  url.split('/').reverse();
        urlParts.splice(3, urlParts.length)

        //Calculate header array
        if(Object.keys(headers).length > 0) {
          let newHeaders = [];

          Object.keys(headers).map(function(key, index) {
            newHeaders.push({
              key: key,
              value: headers[key],
              type: "text"
            })
          });

          headers = newHeaders;
        } else {
          headers = [];
        }
        
        //Create the request within the state.
        item.item.push({
          name: `${method} ${url}`,
          request: {
            method: method,
            header: headers,
            url: {
              raw: url,
              protocol: '',
              host: '{{baseUrl}}',
              path: urlParts.reverse()
            },
            body: {
							mode: "raw",
							raw: JSON.stringify(body),
							options: {
								raw: {
									language: "json"
								}
							}
						}
          },
          response: []
        })
        break;
      }
    }

    console.log(JSON.stringify(data))

    //Update the collection
    response = await instance.put(`/collections/${state.collectionId}`, data)

    return new Request(method, url, headers, body, state);
  }

  async addResponse (status, body, headers) {

    if(!status) {
      throw new Error('Status is required.');
    }

    if(!body) {
      body = "";
    }

    if(!headers) {
      headers = {};
    }

    console.log("adding response")
    console.log(this, status, body, headers)
    let newResponse = await Response.create(this, status, body, headers);
    this.responses.push(newResponse);

    return newResponse;
  }
}

module.exports = Request;