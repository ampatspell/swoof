import { User, toString } from 'swoof';

export default class DummyUser extends User {

  toString() {
    let { user: { uid, email } } = this;
    return toString(this, `${email || uid}`);
  }

}
