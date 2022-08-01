'use strict'

const assert = require('assert')
const { expect } = require('chai')
const fs = require('fs')
const MockServer = require('../models/mockServer')
const { v4: uuidv4 } = require('uuid')
const axios = require('axios').default

let server, state

//GET requests
let successfulGetResponseId = uuidv4()
let failedGetResponseId = uuidv4()
let successfulPostResponseId = uuidv4()
let failedPostResponseId = uuidv4()

describe('MockServer Tests', () => {
  it('creates a new mock server with a consumerUrl', () => {
    let options = {
      apiVersion: 'v1',
      consumerUrl: 'https://consumer.com'
    }

    server = MockServer.create(options)

    assert(server.collection.collection.info.name === 'Contract Tests [v1]')
    assert(
      server.collection.collection.info.description === 'Contract Tests [v1]'
    )
    assert(
      server.collection.collection.info.schema ===
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    )

    assert(server.collection.collection.item[0].name === 'Setup')
    assert(server.collection.collection.item[1].name === 'Notify Consumer')
  })

  it('creates a new mock server without a consumerUrl', () => {
    let options = {
      apiVersion: 'v1',
      outputDir: 'test/output'
    }

    server = MockServer.create(options)

    assert(
      server.collection.collection.info.name ===
        `Contract Tests [${options.apiVersion}]`
    )
    assert(
      server.collection.collection.info.description ===
        `Contract Tests [${options.apiVersion}]`
    )
    assert(
      server.collection.collection.info.schema ===
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    )

    assert(server.collection.collection.item[0].name === 'Setup')
  })
})

describe('Variable Tests', () => {
  it('adds a variable to a mock server', () => {
    server.addVariable('baseUrl', 'http://localhost:3005')
    assert(server.collection.collection.variable[0].key === 'baseUrl')
    assert(
      server.collection.collection.variable[0].value === 'http://localhost:3005'
    )
  })
})

describe('State Tests', () => {
  it('creates a new state', () => {
    state = server.addState('State 1')
    assert(state.name === 'State 1')

    assert(server.collection.collection.item[0].name === 'Setup')
    assert(server.collection.collection.item[1].name === 'State 1')
  })
})

describe('Request Tests', () => {
  describe('Get Request tests', () => {
    let request
    let payload = [
      {
        name: 'Product 1',
        price: 10.99
      }
    ]

    it('creates a new get request', () => {
      request = state.addRequest('GET', '/api/products')

      assert(request.method === 'GET')
      assert(request.path === '/api/products')
      assert(request.headers.length == 0)

      assert(
        server.collection.collection.item[1].item[0].name ===
          'GET /api/products'
      )
    })

    it('creates a new 200 response', () => {
      let response = request.addResponse(
        200,
        {},
        payload,
        successfulGetResponseId
      )

      assert(response.status === 200)
      assert(response.headers.length == 0)
      assert(response.body.name === payload.name)
      assert(response.body.price === payload.price)

      assert(
        server.collection.collection.item[1].item[0].response[0].name ==
          'GET /api/products ' + successfulGetResponseId
      )
    })

    it('creates a new 401 response', () => {
      let response = request.addResponse(
        401,
        {},
        {
          message: 'Unauthorized'
        },
        failedGetResponseId
      )

      assert(response.status === 401)
      assert(response.headers.length == 0)
      assert(response.body.message === 'Unauthorized')

      assert(
        server.collection.collection.item[1].item[0].response[1].name ==
          'GET /api/products ' + failedGetResponseId
      )
    })
  })

  describe('Post request tests', () => {
    let request

    //create a new post request
    it('creates a new post request', () => {
      let payload = {
        name: 'Product 1',
        price: 10.99
      }

      request = state.addRequest('POST', '/api/products', {}, payload)

      assert(request.method === 'POST')
      assert(request.path === '/api/products')
      assert(request.headers.length == 0)
      assert(request.body.name === payload.name)
      assert(request.body.price === payload.price)

      assert(
        server.collection.collection.item[1].item[1].name ===
          'POST /api/products'
      )
    })

    it('creates a new 200 response', () => {
      let payload = {
        name: 'Product 1',
        price: 10.99
      }

      let response = request.addResponse(
        200,
        {},
        payload,
        successfulPostResponseId
      )

      assert(response.status === 200)
      assert(response.headers.length == 0)
      assert(response.body.name === payload.name)
      assert(response.body.price === payload.price)

      assert(
        server.collection.collection.item[1].item[1].response[0].name ==
          'POST /api/products ' + successfulPostResponseId
      )
    })

    it('creates a new 401 response', () => {
      let response = request.addResponse(
        401,
        {},
        {
          message: 'Unauthorized'
        },
        failedPostResponseId
      )

      assert(response.status === 401)
      assert(response.headers.length == 0)
      assert(response.body.message === 'Unauthorized')

      assert(
        server.collection.collection.item[1].item[1].response[1].name ==
          'POST /api/products ' + failedPostResponseId
      )
    })
  })
})

describe('Collection Export tests', () => {
  it('exports the collection', () => {
    let collectionJson = JSON.stringify(server.collection)
    assert(collectionJson.length > 0)
  })

  it('exports the collection to a file', () => {
    server.exportCollection('./test/output/collection.json')

    assert(fs.existsSync('./test/output/collection.json'))
  })
})

describe('Test the requests against the Mock Server', () => {
  let PORT = 3005

  before(() => {
    server.start(PORT);
  })

  it('Test the Successful GET request', done => {
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'x-mock-response-name': 'GET /api/products ' + successfulGetResponseId
      }
    }

    axios
      .get(`http://localhost:${PORT}/api/products`, options)
      .then(response => {
        assert(response.status === 200)
        assert(response.data[0].name === 'Product 1')
        assert(response.data[0].price === 10.99)
        done()
      })
      .catch(error => {
        done(error)
      }
    )

  })

  it('Test the Failed GET request', (done) => {

    let options = {
      headers: {
        'Content-Type': 'application/json',
        'x-mock-response-name': 'GET /api/products ' + failedGetResponseId
      }
    };

    axios.get(`http://localhost:${PORT}/api/products`, options)
    .catch(error => {
      expect(error).to.be.instanceOf(Error)
      expect(error.response.status).to.equal(401)
      expect(error.response.data.message).to.equal('Unauthorized')
      done()
    });
  })

  after(() => {
    server.stop()
  })
})
