/* eslint promise/no-callback-in-promise: 0 */
import 'isomorphic-fetch'
import Debug from 'debug'
import fetchMock from 'fetch-mock'
import t from 'tap'

import { FetchHttpClient } from '../../src/http-client'
import { HttpEventsResource } from '../../src/events'
import { SimpleTokenProvider } from '../../src/token-provider'
import {
  audience,
  direction,
  endpoint,
  eventsAllPage1,
  eventsAllPage2,
  eventsAllPage3,
  eventsAllPage4,
  host,
  invalidJSONRsponse,
  invalidRoomResponseOnNumber,
  invalidRoomResponseOnString,
  roomId,
  token
} from '../response.mock.js'

const { DISABLE_MOCKS = '0' } = process.env

const debug = Debug(`@ulms/events-js/account`)
const useMocks = !Number(DISABLE_MOCKS)

debug(`Mocks are ${useMocks ? 'enabled' : 'disabled'}`)

const getEnv = () => {
  const {
    BEARER_TOKEN,
    EVENTS_AUDIENCE,
    EVENTS_BEARER_TOKEN,
    EVENTS_ENDPOINT,
    EVENTS_HOST,
    EVENTS_ROOM_ID
  } = process.env

  let ACCESS_TOKEN = EVENTS_BEARER_TOKEN || BEARER_TOKEN
  let AUDIENCE = EVENTS_AUDIENCE
  let ENDPOINT = EVENTS_ENDPOINT
  let HOST = EVENTS_HOST
  let ROOM_ID = EVENTS_ROOM_ID

  if (useMocks) {
    ACCESS_TOKEN = token
    AUDIENCE = audience
    ENDPOINT = endpoint
    HOST = host
    ROOM_ID = roomId
  }

  if (
    !ACCESS_TOKEN ||
    !AUDIENCE ||
    !ENDPOINT ||
    !HOST ||
    !ROOM_ID
  ) throw new TypeError('Needed params are absent')

  return {
    ACCESS_TOKEN, AUDIENCE, ENDPOINT, HOST, ROOM_ID
  }
}

const makeClient = ({ host, token, fetch } = {}) => {
  const { ENDPOINT } = getEnv()

  const httpClient = new FetchHttpClient()
  if (fetch) httpClient.__provider(fetch)

  const client = new HttpEventsResource(
    host,
    ENDPOINT,
    httpClient,
    new SimpleTokenProvider(token)
  )

  return client
}

t.test('Events Resource | `_list` fails on wrong host', (test) => {
  const { ACCESS_TOKEN, AUDIENCE, ROOM_ID } = getEnv()
  const HOST = '//weird.tld'

  const client = makeClient({ host: HOST, token: ACCESS_TOKEN })

  client._list({
    audience: AUDIENCE,
    roomId: ROOM_ID
  })
    .then(() => { t.fail('Got valid response') })
    .catch((error) => {
      t.equal(error instanceof Error, true)
    })
    .finally(() => { test.end() })
})

t.test('Events Resource | `_list` fails on wrong token', (test) => {
  const { AUDIENCE, ENDPOINT, HOST, ROOM_ID } = getEnv()
  const BEARER = 'INCORRECT_OR_INVALID_TOKEN'

  let maybeFetch
  if (useMocks) {
    maybeFetch = fetchMock
      .sandbox()
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${ROOM_ID}/events?direction=${direction}&audience=${AUDIENCE}&room_id=${ROOM_ID}`,
        { throws: invalidJSONRsponse }
      )
  }

  const client = makeClient({ host: HOST, token: BEARER, fetch: maybeFetch })

  client._list({
    audience: AUDIENCE,
    direction,
    roomId: ROOM_ID
  })
    .then(() => { t.fail('Got valid response') })
    .catch((error) => {
      if (error.name === 'FetchError') { t.match(error.message, /^invalid json response/) } else {
        t.fail(error.message || 'Unknown error')
      }
    })
    .finally(() => { test.end() })
})

t.test('Events Resource | `_list` fails on wrong room', (test) => {
  const { ACCESS_TOKEN, AUDIENCE, ENDPOINT, HOST } = getEnv()

  let maybeFetch
  if (useMocks) {
    maybeFetch = fetchMock
      .sandbox()
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${12345}/events?direction=${direction}&audience=${AUDIENCE}&room_id=${12345}`,
        { throws: invalidRoomResponseOnNumber }
      )
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${'INCORRECT_OR_UNKNOWN_ROOM_ID'}/events?direction=${direction}&audience=${AUDIENCE}&room_id=${'INCORRECT_OR_UNKNOWN_ROOM_ID'}`,
        { throws: invalidRoomResponseOnString }
      )
  }

  const client = makeClient({ host: HOST, token: ACCESS_TOKEN, fetch: maybeFetch })

  const t1 = client._list({
    audience: AUDIENCE,
    direction,
    roomId: 12345
  })
    .then(() => { t.fail('Got unexpected response') })
    .catch((error) => {
      t.same(error, { error: 'invalid room ID' })
    })

  const t2 = client._list({
    audience: AUDIENCE,
    direction,
    roomId: 'INCORRECT_OR_UNKNOWN_ROOM_ID'
  })
    .then(() => { t.fail('Got unexpected response') })
    .catch((error) => {
      t.same(error, { error: 'invalid room ID' })
    })

  Promise.all([t1, t2]).finally(() => { test.end() })
})

t.test('Events Resource | `_list` fails on wrong direction', (test) => {
  const { ACCESS_TOKEN, AUDIENCE, HOST, ROOM_ID } = getEnv()

  const client = makeClient({ host: HOST, token: ACCESS_TOKEN })

  client._list({
    audience: AUDIENCE,
    roomId: ROOM_ID
  })
    .catch((error) => {
      t.equal(error.message === '`direction` is absent', true)
    })
    .finally(() => { test.end() })
})

t.test('Events Resource | `_list` is ok', (test) => {
  const { ACCESS_TOKEN, AUDIENCE, ENDPOINT, HOST, ROOM_ID } = getEnv()

  let maybeFetch
  if (useMocks) {
    maybeFetch = fetchMock
      .sandbox()
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${ROOM_ID}/events?direction=${direction}&audience=${AUDIENCE}&room_id=${ROOM_ID}`,
        eventsAllPage1
      )
  }

  const client = makeClient({ host: HOST, token: ACCESS_TOKEN, fetch: maybeFetch })

  client._list({
    audience: AUDIENCE,
    direction,
    roomId: ROOM_ID
  })
    .then((res) => {
      t.equal(Array.isArray(res.events), true)
      t.equal(typeof res.next_page === 'string', true)
      t.equal(typeof res.has_next_page === 'boolean', true)
    })
    .finally(() => { test.end() })
})

t.test('Events Resource | `list` is ok', (test) => {
  const { ACCESS_TOKEN, AUDIENCE, ENDPOINT, HOST, ROOM_ID } = getEnv()

  let maybeFetch
  if (useMocks) {
    maybeFetch = fetchMock
      .sandbox()
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${ROOM_ID}/events?direction=${direction}&audience=${AUDIENCE}&room_id=${ROOM_ID}`,
        eventsAllPage1
      )
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${ROOM_ID}/events?${eventsAllPage1.next_page}`,
        eventsAllPage2
      )
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${ROOM_ID}/events?${eventsAllPage2.next_page}`,
        eventsAllPage3
      )
      .mock(
        `${HOST}/${ENDPOINT}/${AUDIENCE}/rooms/${ROOM_ID}/events?${eventsAllPage3.next_page}`,
        eventsAllPage4
      )
  }

  const client = makeClient({ host: HOST, token: ACCESS_TOKEN, fetch: maybeFetch })

  client.list({
    audience: AUDIENCE,
    direction,
    roomId: ROOM_ID
  })
    .then((res) => {
      t.equal(Array.isArray(res.events), true)
      if (useMocks) {
        t.equals(res.events.length, 5)
      }
    })
    .finally(() => { test.end() })
})
