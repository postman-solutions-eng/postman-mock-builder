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

  static create (state, method, path, headers, body) {

    //Find the state
    for(let folder of state.collection.item){
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
    return new Request(method, path, headers, body, state);
  }

  addResponse (status, headers, body, uuid ) {

    if(!status) {
      throw new Error('Status is required.');
    }

    if(!body) {
      body = "";
    }

    if(!headers) {
      headers = {};
    }

    let newResponse = Response.create(this, status, headers, body, uuid);
    this.responses.push(newResponse);

    return newResponse;
  }
}

module.exports = Request;