/* global fetch */

export class FetchHttpClient {
  static _processResponse (response) {
    if (response.status === 200) return response.json()
    if (response.status === 204) return Promise.resolve()

    if (/^4\d{2}/.test(response.status)) {
      return response.json().then((a) => {
        return Promise.reject(a)
      })
    }

    return response.text().then((text) => {
      throw new Error(text)
    })
  }
  constructor () {
    this.__fetch = fetch
    return this
  }
  __provider (provider) {
    if (!provider) throw new TypeError('provider is absent')
    this.__fetch = provider

    return this
  }
  get (url, config) {
    return this.__fetch(url, {
      method: 'GET',
      headers: config.headers
    })
      .then(FetchHttpClient._processResponse)
  }
  post (url, data, config) {
    return this.__fetch(url, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(data)
    })
      .then(FetchHttpClient._processResponse)
  }
  patch (url, data, config) {
    return this.__fetch(url, {
      method: 'PATCH',
      headers: config.headers,
      body: JSON.stringify(data)
    })
      .then(FetchHttpClient._processResponse)
  }
  delete (url, data, config) {
    return this.__fetch(url, {
      method: 'DELETE',
      headers: config.headers,
      body: JSON.stringify(data)
    })
      .then(FetchHttpClient._processResponse)
  }
}
