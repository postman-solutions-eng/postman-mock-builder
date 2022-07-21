'use strict'
let MockServer = require('./models/mockServer');

//Two parts to this application.
//1. The consumer test plugins.
//2. The CLI for the producer.

async function setup() {
  //Create a mock server.
  let mockServer = await MockServer.create(
    '5f230752-06aa-4290-8ea5-e7c9ec945b45',
    'v1'
  );

  //Add a variable to the mock server
  let variable = await mockServer.addVariable('baseUrl', mockServer.url);

  console.log(variable)

  //Add a state to the mock server.
  let state = await mockServer.addState('state - ' + Math.ceil(Math.random() * 1000));

  console.log(state);

  //Add a request to the state.
  state.addRequest('GET', '/api/v1/users');
  state.addRequest('GET', '/api/v1/fred');
  state.addRequest('GET', '/api/v1/sis');
  state.addRequest('GET', '/api/v1/george');
  state.addRequest('GET', '/api/v1/sakly');
  state.addRequest('GET', '/api/v1/susan');
  state.addRequest('GET', '/api/v1/thomas');
  state.addRequest('GET', '/api/v1/pater');
 
}

setup();
