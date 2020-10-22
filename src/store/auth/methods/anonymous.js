import Method from './method';

export default class AnonymousAuthMethod extends Method {

  signIn() {
    return this.auth._withAuthReturningUser(async auth => {
      let { user } = await auth.signInAnonymously();
      return user;
    });
  }

}
