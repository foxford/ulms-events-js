/* global fetch */

export class FetchHttpClient {
  static _processResponse (response) {
    if (response.status === 204) {
      return null
    }

    return response.json()
  }
  get (url, config) {
    return fetch(url, {
      method: 'GET',
      headers: config.headers
    })
      .then(FetchHttpClient._processResponse)
  }
  post (url, data, config) {
    return fetch(url, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(data)
    })
      .then(FetchHttpClient._processResponse)
  }
  patch (url, data, config) {
    return fetch(url, {
      method: 'PATCH',
      headers: config.headers,
      body: JSON.stringify(data)
    })
      .then(FetchHttpClient._processResponse)
  }
  delete (url, config) {
    return fetch(url, {
      method: 'DELETE',
      headers: config.headers
    })
      .then(FetchHttpClient._processResponse)
  }
}
