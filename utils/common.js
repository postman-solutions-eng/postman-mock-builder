'use strict'

function formatHeaders (headers) {
  //Calculate header array
  if (Object.keys(headers).length > 0) {
    let newHeaders = []

    Object.keys(headers).map(function (key) {
      newHeaders.push({
        key: key,
        value: headers[key],
        type: 'text'
      })
    })

    return newHeaders
  } else {
    return []
  }
}

module.exports = {
  formatHeaders: formatHeaders
}
