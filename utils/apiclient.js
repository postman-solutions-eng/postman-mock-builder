'use strict';
const axios = require('axios').default

//Postman API Key
const APIKEY =
  'PMAK-62da1fedd857466b3f382ad6-8f741661f1c57474f17a18587b381267d9'
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