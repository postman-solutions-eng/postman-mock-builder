'use strict'
let MockServer = require('./models/mockServer');

const WORKSPACE_ID = 'ab76608c-c269-4ba7-9727-2bfe9956fb88';

async function pactmanSetup() {

  //Create a mock server.
  let mockServer = await MockServer.create(
    WORKSPACE_ID,
    'v1'
  );

  //Add a variable to the mock server
  await mockServer.addVariable('baseUrl', mockServer.url);

  //State 1 - Unauthenticated
  //Add a state to the mock server.
  let unauthenticatedState = await mockServer.addState('User is unauthenticated.');

  //Add a request to the state.
  let getUsersRequest = await unauthenticatedState.addRequest('GET', '/api/v1/users', {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': ''
  });

  //Add a response to the request.
  await getUsersRequest.addResponse('401', {
    "status": 401,
    "message": "Unauthorized"
  });

  //Add a create user request to the state
  let createUserRequest = await unauthenticatedState.addRequest('POST', '/api/v1/users', {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': ''
  }, {
    "name": "John Doe",
    "email": "john.doe@example.com"
  });

  //Add a response to the request.
  await createUserRequest.addResponse('401', {
    "status": 401,
    "message": "Unauthorized"
  });

  //State 2
  //Add a state to the mock server.
  let authenticatedState = await mockServer.addState('User is authenticated.');

  //Add a request to the state.
  getUsersRequest = await authenticatedState.addRequest('GET', '/api/v1/users', {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': '12345'
  });

  //Add a response to the request.
  await getUsersRequest.addResponse('200', {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "created_at": "2020-05-01T00:00:00.000Z",
        "updated_at": "2020-05-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "created_at": "2020-05-01T00:00:00.000Z",
        "updated_at": "2020-05-01T00:00:00.000Z"
      }
    ]
  });

  createUserRequest = await authenticatedState.addRequest('POST', '/api/v1/users', {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': '12345'
  }, {
    "name": "John Doe",
    "email": "john.doe@example.com"
  });

  await createUserRequest.addResponse('201', {
      "id": 3,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2020-05-01T00:00:00.000Z",
      "updated_at": "2020-05-01T00:00:00.000Z"
  });
  
}

pactmanSetup();
