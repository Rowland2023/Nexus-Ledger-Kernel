import { AsyncLocalStorage } from 'async_hooks';

const authContext = new AsyncLocalStorage();

export function runWithUserContext(user, fn) {
  // We use .run() but we don't necessarily need to return it here 
  // if we are just wrapping the Express next() chain.
  authContext.run(user, fn);
}

export function getUserContext() {
  return authContext.getStore();
}