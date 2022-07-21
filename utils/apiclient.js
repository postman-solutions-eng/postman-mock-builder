'use strict';
const axios = require('axios').default

//Postman API Key
const APIKEY =
  'PMAK-62d8a3f69cd250244a712918-8d6b054843c3a480281efa364a2e245d41'
const POSTMAN_API_URL = 'https://api.getpostman.com'

const instance = axios.create({
  baseURL: POSTMAN_API_URL,
  headers: {
    'X-Api-Key': APIKEY
  }
})

module.exports = {
  instance: instance
}