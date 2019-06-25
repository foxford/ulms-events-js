export class HttpEventsResource {
  constructor (
    host,
    endpoint,
    httpClient,
    tokenProvider
  ) {
    this.baseUrl = `${host}/${endpoint}`
    this.httpClient = httpClient
    this.tokenProvider = tokenProvider
  }
  static _headers (token, params = {}) {
    const { randomId } = params
    const additionalHeaders = {}

    if (randomId) {
      additionalHeaders['X-Random-Id'] = randomId
    }

    return {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...additionalHeaders
    }
  }
  getState (audience, roomId, params = {}) {
    const { after, before, direction, offset } = params
    const qsParts = []

    if (!isNaN(offset)) {
      qsParts.push(`offset=${offset}`)
    }

    if (~['forward', 'backward'].indexOf(direction)) {
      qsParts.push(`direction=${direction}`)
    }

    if (!isNaN(after)) {
      qsParts.push(`after=${after}`)
    }

    if (!isNaN(before)) {
      qsParts.push(`before=${before}`)
    }

    const qs = qsParts.length ? `?${qsParts.join('&')}` : ''

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.get(
          `${this.baseUrl}/${audience}/rooms/${roomId}/state${qs}`,
          {
            headers: HttpEventsResource._headers(token)
          }
        )
      )
  }
  getEvents (audience, roomId, direction, params = {}) {
    const { after, before, lastId, type } = params
    const qsParts = []
    let qs = ''

    qsParts.push(`direction=${direction}`)

    if (!isNaN(after)) {
      qsParts.push(`after=${after}`)
    }

    if (!isNaN(before)) {
      qsParts.push(`before=${before}`)
    }

    if (lastId) {
      qsParts.push(`last_id=${lastId}`)
    }

    if (type) {
      qsParts.push(`type=${type}`)
    }

    qs = `?${qsParts.join('&')}`

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.get(
          `${this.baseUrl}/${audience}/rooms/${roomId}/events${qs}`,
          {
            headers: HttpEventsResource._headers(token)
          }
        )
      )
  }
  createEvent (audience, roomId, type, data, params = {}) {
    const { randomId } = params

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.post(
          `${this.baseUrl}/${audience}/rooms/${roomId}/events/${type}`,
          data,
          {
            headers: HttpEventsResource._headers(token, { randomId })
          }
        )
      )
  }
  updateEvent (audience, roomId, type, eventId, data, params = {}) {
    const { randomId } = params

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.patch(
          `${this.baseUrl}/${audience}/rooms/${roomId}/events/${type}/${eventId}`,
          data,
          {
            headers: HttpEventsResource._headers(token, { randomId })
          }
        )
      )
  }
  deleteEvent (audience, roomId, type, eventId, data, params = {}) {
    const { randomId } = params

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.delete(
          `${this.baseUrl}/${audience}/rooms/${roomId}/events/${type}/${eventId}`,
          data,
          {
            headers: HttpEventsResource._headers(token, { randomId })
          }
        )
      )
  }
  createNotification (audience, roomId, type, data, params = {}) {
    const { randomId } = params

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.post(
          `${this.baseUrl}/${audience}/rooms/${roomId}/notifications/${type}`,
          data,
          {
            headers: HttpEventsResource._headers(token, { randomId })
          }
        )
      )
  }
}
