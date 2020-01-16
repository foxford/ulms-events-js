export const audience = 'AUDIENCE'
export const direction = 'forward'
export const endpoint = 'api/v1'
export const host = 'http://domain.tld'
export const roomId = 'ROOM_ID'
export const token = 'BEARER'

export const invalidRoomResponseOnNumber = { error: 'invalid room ID' }

export const invalidRoomResponseOnString = { error: 'invalid room ID' }

export const invalidRoomResponse = { error: 'invalid room ID' }

class FetchErrorStub extends Error {
  constructor (message) {
    super()
    this.name = 'FetchError'
    this.message = message
  }
}

export const invalidJSONRsponse = new FetchErrorStub('invalid json response at...')

export const eventsAllPage1 = {
  events: [
    { id: 'uuid-1',
      random_id: '',
      type: 'unsubscribe',
      created_at: '2020-01-13T17:24:49.867305Z',
      offset: 372728660,
      data: [],
      account_id: 'account_label_1',
      updated_at: null,
      reactions: {}
    },
    { id: 'uuid-2',
      random_id: '',
      type: 'subscribe',
      created_at: '2020-01-14T05:23:11.135917Z',
      offset: 415829928,
      data: [],
      account_id: 'account_label_2',
      updated_at: null,
      reactions: {}
    }
  ],
  has_next_page: true,
  next_page: `direction=forward&audience=${audience}&room_id=${roomId}&after=415829928`
}
export const eventsAllPage2 = {
  events: [
    { id: 'uuid-3',
      random_id: '',
      type: 'unsubscribe',
      created_at: '2020-01-14T06:59:01.108522Z',
      offset: 421579901,
      data: [],
      account_id: 'account_label_3',
      updated_at: null,
      reactions: {}
    }
  ],
  has_next_page: true,
  next_page: `direction=forward&audience=${audience}&room_id=${roomId}&after=421579901`
}

export const eventsAllPage3 = {
  events: [
    { id: 'uuid-4',
      random_id: '',
      type: 'unsubscribe',
      created_at: '2020-01-14T06:59:01.108522Z',
      offset: 421579902,
      data: [],
      account_id: 'account_label_3',
      updated_at: null,
      reactions: {}
    }
  ],
  has_next_page: true,
  next_page: `direction=forward&audience=${audience}&room_id=${roomId}&after=421579902`
}

export const eventsAllPage4 = {
  events: [
    { id: 'uuid-5',
      random_id: '',
      type: 'unsubscribe',
      created_at: '2020-01-14T06:59:01.108522Z',
      offset: 421579903,
      data: [],
      account_id: 'account_label_3',
      updated_at: null,
      reactions: {}
    }
  ],
  has_next_page: false,
  next_page: `direction=forward&audience=${audience}&room_id=${roomId}&after=421579903`
}
