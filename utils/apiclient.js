'use strict';
const axios = require('axios').default

//Postman API Key
const APIKEY = process.env.POSTMAN_API_KEY || "";
const POSTMAN_API_URL = process.env.POSTMAN_API_URL || 'https://api.getpostman.com';

const instance = axios.create({
  baseURL: POSTMAN_API_URL,
  headers: {
    'X-Api-Key': APIKEY
  }
})

module.exports = {
  instance: instance
}