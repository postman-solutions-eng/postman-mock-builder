'use strict'
let instance = require('../utils/apiclient').instance
let State = require('../models/state')
const fs = require('fs')
const PostmanLocalMockServer = require('postman-local')

class MockServer {
  constructor (collection) {
    this.collection = collection
    this.states = []
    this.server = null;
  }

  static create (options) {
    let apiVersion = options.apiVersion

    let collection = {
      collection: {
        info: {
          name: `Contract Tests [${apiVersion}]`,
          description: `Contract Tests [${apiVersion}]`,
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
          {
            name: 'Setup',
            item: [
              {
                name: 'Set Variables',
                event: [
                  {
                    listen: 'test',
                    script: {
                      exec: [
                        '//Used to differentiate between individual tests and tests run using the collection runner.',
                        'let testResults = {',
                        "  id: pm.variables.replaceIn('{{$guid}}'),",
                        '  createdDate: Date.now(),',
                        '  apiVersion: "' + options.apiVersion + '",',
                        '  states: {}',
                        '};',
                        'pm.variables.set("testResults", JSON.stringify(testResults));'
                      ],
                      type: 'text/javascript'
                    }
                  }
                ],
                request: {
                  method: 'GET',
                  header: [],
                  url: {
                    raw: 'https://postman-echo.com/get',
                    protocol: 'https',
                    host: ['postman-echo', 'com'],
                    path: ['get']
                  }
                },
                response: []
              }
            ]
          }
        ]
      }
    }

    if (options.consumerUrl) {
      let url = new URL(options.consumerUrl)

      collection.collection.item.push({
        name: 'Notify Consumer',
        item: [
          {
            name: 'POST Notify Consumer',
            event: [
              {
                listen: 'prerequest',
                script: {
                  exec: [
                    'if(!pm.variables.get("testResults")) {',
                    '    throw new Error("Cannot notify consumers outside of a full collection run.")',
                    '}'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [],
              body: {
                mode: 'raw',
                raw: '{{testResults}}',
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              },
              url: {
                raw: url.href,
                protocol: url.protocol.split(':')[0],
                host: url.hostname.split('.'),
                path: url.pathname.split('/')
              }
            },
            response: []
          }
        ]
      })
    }

    return new MockServer(collection)
  }

  addState (state) {
    let newState = State.create(this.collection.collection, state)
    this.states.push(newState)

    return newState
  }

  addVariable (name, value) {
    let data = this.collection

    if (!data.collection.variable) {
      data.collection.variable = []
    }

    //TODO - Replace variable if it has the same name.

    data.collection.variable.push({
      key: name,
      value: value,
      type: 'string'
    })

    return data
  }

  start (port) {
    this.server = new PostmanLocalMockServer(port, this.collection)
    this.server.start((err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('Mock server started on port ' + port)
      }
    });
  }

  stop () {
    this.server.stop()
  }

  exportCollection (path) {
    if (!path || path == '') {
      throw new Error(
        'Pactman collection path not specified. Please specify the collection path and try again.'
      )
    }

    let pathParts = path.split('/')
    let filename = pathParts.pop()

    path = pathParts.join('/')

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    fs.writeFileSync(`${path}/${filename}`, JSON.stringify(this.collection, null, 2))
  }

}

module.exports = MockServer
