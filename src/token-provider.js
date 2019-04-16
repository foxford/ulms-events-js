export class SimpleTokenProvider {
  constructor (token) {
    this.token = token
  }
  getToken () {
    return Promise.resolve(this.token)
  }
}
