# Postman Mock Builder

This package allows you to programmatically build Postman collections, and run these within your node.js applications.

## Overview

The main use case for this service is to make Consumer Driven Contract Testing more accessible with Postman Collections.

Consumers can use this library to codify the way they are using a particular API and generate a collection that matches this behaviour.

The generated collection can then be provided to an API producer where they can import this and run it using Postman/Newman.

The generated collection will have the following features;

- A list of states that the consumer expects the application to support.
- Within each state will be a series of requests that the consumer is expecting to be able to hit, and responses specified for each.
- Also within each request will be automated status code and API schema tests that the producer can use to validate the API requests.

## Getting Started

1. Install the dependency from npm.

```
npm install @jordanwalsh23/postman-mock-builder
```

2. Include this in your test script.

```
const PostmanMockBuilder = require("@jordanwalsh23/postman-mock-builder");
```

3. Create a Mock Server and start adding states/requests/responses.

```
//Port that we would like to run the local server on
const PORT = 3000;

//Placeholder for the server we are going to create.
let mockServer;

describe('Test Suite', () => {

  before(() => {
    mockServer = PostmanMockBuilder.create({
      apiVersion: "v1"
    })
  })

  describe('Retrieve Products from DB', () => {

    let state, request;

    let expectedResponse = [
      {
        id: '1234',
        name: 'Product 1',
        description: 'This is product 1',
        model: 'P1',
        cost: 100
      }
    ];

    before(() => {
      //Add a state that the system should be in for this test case to run.
      state = mockServer.addState("A product exists in the database");

      //Add a request to the state
      request = state.addRequest({
        method: "GET",
        path: "/api/products" 
      });

      //Add an expected response for the request.
      request.addResponse({
        status: 200,
        body: expectedResponse
      })

      //Start the server.
      mockServer.start(PORT);

      //Server will be started on http://localhost:$PORT
    })

    it('Retrieve the products from the server', (done) => {
      //Now that the server has been started we can run our test.

      axios.get(`http://localhost:${PORT}/api/products`)
      .then(response => response.data)
      .then(products => {
        //Assert there's only 1 product in the response.
        assert(products.length == 1)

        let product = products[0];

        assert(product.id == expectedResponse.id);
        assert(product.name == expectedResponse.name);
        assert(product.description == expectedResponse.description);
        assert(product.model == expectedResponse.model);
        assert(product.cost == expectedResponse.cost);
        done()
      })
      .catch(error => done(error));
    })
  })

  after(() => {
    //Export the collection you've created to a file.
    mockServer.exportCollection('postman/collection.json')

    //Stop the local mock server.
    mockServer.stop()
  })
})
```

## Why use this?

Postman's API platform is an amazing tool that is used by millions of API developers around the world. Postman makes it simple to create Collections using the tooling and these can then be used to manage the lifecycle around your API.

Building collections today can be done in one of a few ways:

1. You can manually build the Collection in Postman,
2. You can generate a Collection from an OpenAPI definition file, or
3. You can use the Postman API to create the Collection.

One of the challenges presented here is how do you keep your API implementation code in sync with your Postman collection?  How do you make sure that if you change a field, update some logic or make an architectural change that you haven't broken the collection?

This project aims to bring the development of the Collection to within the API codebase. This can then be used as a local server to run tests against, and finally generate the Collection to be run and shared on Postman.

## Known Issues / Limitations

Currently States (folders) cannot be created inside other States. The service only supports 1 level of depth.

## Contributions

Contributions are welcomed on this repo. Please raise an issue with your request and if you like raise a PR for approval.

## License

See the [LICENSE](LICENSE) file.


