'use strict';
const axios = require('axios').default

//Postman API Key
const APIKEY =
  ''
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