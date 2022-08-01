'use strict'

const assert = require('assert')
const PostmanMockServer = require('postman-local')

let server;

describe('test', () => {
  before(() => {
    server = new PostmanMockServer(3005, './test/test-collection.json')
    server.start()
  })

  it('test', () => {
    console.log("run tests against the mock")
  })

  after(() => {
    server.stop()
  });
})
