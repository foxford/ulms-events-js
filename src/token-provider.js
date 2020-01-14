export class SimpleTokenProvider {
  constructor (token) {
    if (!token) throw new TypeError('Can not initialize TokenProvider. `token` is absent')
    this.token = typeof token !== 'string' ? String(token) : token
  }
  getToken () {
    return Promise.resolve(this.token)
  }
  token () {
    return this.getToken()
  }
}
