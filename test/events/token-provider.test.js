import tap from 'tap'

import { SimpleTokenProvider } from '../../src/token-provider'

tap.test('Token Provider', (t) => {
  t.test('fails with absent token', (test) => {
    t.throws(() => {
      new SimpleTokenProvider() // eslint-disable-line no-new
    })
    t.throws(() => {
      new SimpleTokenProvider('') // eslint-disable-line no-new
    })
    t.throws(() => {
      new SimpleTokenProvider() // eslint-disable-line no-new
    })

    test.end()
  })

  t.end()
})

tap.test('Token Provider', (t) => {
  t.test('is ok with token', (test) => {
    t.equal(
      new SimpleTokenProvider('access_token') instanceof SimpleTokenProvider,
      true
    )

    t.equal(
      new SimpleTokenProvider(12345) instanceof SimpleTokenProvider,
      true
    )
    t.equal(new SimpleTokenProvider(12345).token, '12345')

    test.end()
  })

  t.end()
})
