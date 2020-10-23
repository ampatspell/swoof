import { User, toString } from 'swoof';

export default class DummyUser extends User {

  toString() {
    let { uid, email } = this;
    return toString(this, `${email || uid}`);
  }

}
