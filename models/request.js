'use strict';
let instance = require('../utils/apiclient').instance;
let formatHeaders = require('../utils/common').formatHeaders;
let Response = require('../models/response');

class Request {
  constructor (method, path, headers, body, state) {
    this.method = method;
    this.path = path;
    this.headers = headers;
    this.body = body;
    this.state = state;
    this.responses = [];
  }

  static async create (state, method, path, headers, body) {
    
    //Get the current collection
    let response = await instance.get(`/collections/${state.collectionId}`);

    let data = response.data;

    //Find the state
    for(let folder of data.collection.item){
      if(folder.name == state.name){

        //Calculate URL
        headers = formatHeaders(headers);
        
        //Create the request within the state.
        folder.item.push({
          name: `${method} ${path}`,
          request: {
            method: method,
            header: headers,
            url: {
              raw: path,
              protocol: '',
              host: '{{baseUrl}}',
              path: path.split('/')
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

    //Update the collection
    response = await instance.put(`/collections/${state.collectionId}`, data)

    return new Request(method, path, headers, body, state);
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

    let newResponse = await Response.create(this, status, body, headers);
    this.responses.push(newResponse);

    return newResponse;
  }
}

module.exports = Request;