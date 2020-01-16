const fFetchPageUntil = (fn, options, acc) => function fetchEach () {
  const maybePage = fn(options, acc)
  if (!(maybePage instanceof Promise)) throw new Error('awaits promise')

  return maybePage
    .then(([opts, result]) => {
      return opts
        ? fFetchPageUntil(fn, { ...options, ...opts }, result)
        : result
    })
}

const trampoline = function (fn) {
  return function (...argv) {
    let result = fn(...argv)

    const isCallable = a => a instanceof Function
    const repeat = (nextFn) => {
      const nextIsCallable = isCallable(nextFn)

      return !nextIsCallable
        ? Promise.resolve(nextFn)
        : nextFn().then(repeat)
    }

    return repeat(result)
  }
}

export class HttpEventsResource {
  constructor (
    host,
    endpoint,
    httpClient,
    tokenProvider
  ) {
    if (typeof endpoint === 'string') {
      // TODO: deprecate complex url later
      this.baseUrl = `${host}/${endpoint}`
      this.httpClient = httpClient
      this.tokenProvider = tokenProvider
    } else {
      // bypass solid url on instantiation
      this.baseUrl = `${host}`
      this.httpClient = endpoint
      this.tokenProvider = httpClient
    }
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
  _token () {
    return this.tokenProvider.getToken()
  }
  getState (audience, roomId, params = {}) {
    const { offset, direction } = params
    const qsParts = []

    if (!isNaN(offset)) {
      qsParts.push(`offset=${offset}`)
    }

    if (~['forward', 'backward'].indexOf(direction)) {
      qsParts.push(`direction=${direction}`)
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
  _list (opts = {}) {
    const {
      qs,
      after,
      audience,
      before,
      direction,
      lastId,
      page,
      roomId,
      type
    } = opts

    if (!audience) return Promise.reject(new TypeError('`audience` is absent'))
    if (!direction) return Promise.reject(new TypeError('`direction` is absent'))
    if (!roomId) return Promise.reject(new TypeError('`roomId` is absent'))

    const qsParts = qs && qs.length ? qs.split('&') : []

    if (!qs) {
      !isNaN(after) && qsParts.push(`after=${after}`)
      !isNaN(before) && qsParts.push(`before=${before}`)
      direction && qsParts.push(`direction=${direction}`)
      lastId && qsParts.push(`last_id=${lastId}`)
      type && qsParts.push(`type=${type}`)
      page && qsParts.push(`page=${page}`)

      qsParts.push(`audience=${audience}`)
      qsParts.push(`room_id=${roomId}`)
    }

    return this._token()
      .then((token) => {
        const qs = qsParts.length ? `?${qsParts.join('&')}` : ''

        const url = new URL(`${this.baseUrl}/${audience}/rooms/${roomId}/events${qs}`)

        return this.httpClient.get(
          url.href,
          {
            headers: HttpEventsResource._headers(token)
          }
        )
      })
  }
  list (opts) {
    const { direction = 'forward' } = opts
    const options = { ...opts, direction }

    const mergeResult = (o, acc = []) => {
      return this._list(o)
        .then((res) => {
          const accNext = o.direction === 'forward'
            ? acc.concat(res.events)
            : res.events.concat(acc)

          return res.has_next_page
            ? [ { ...options, qs: res.next_page }, accNext ]
            : [ undefined, { events: accNext } ]
        })
    }
    const shouldFetch = trampoline(fFetchPageUntil)

    return shouldFetch(mergeResult, options, [])
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
  createReaction (audience, roomId, type, eventId, data, params = {}) {
    const { randomId } = params

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.post(
          `${this.baseUrl}/${audience}/rooms/${roomId}/events/${type}/${eventId}/reaction`,
          data,
          {
            headers: HttpEventsResource._headers(token, { randomId })
          }
        )
      )
  }
  deleteReaction (audience, roomId, type, eventId, data, params = {}) {
    const { randomId } = params

    return this.tokenProvider.getToken()
      .then((token) =>
        this.httpClient.delete(
          `${this.baseUrl}/${audience}/rooms/${roomId}/events/${type}/${eventId}/reaction`,
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
