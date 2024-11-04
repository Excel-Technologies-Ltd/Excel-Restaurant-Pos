import Cookies from "js-cookie";

export class CookieManager {
  private cookie: Cookies.CookiesStatic;
  constructor(cookie: Cookies.CookiesStatic) {
    this.cookie = cookie;
  } //

  saveCookie(name: string, value: string, options: Cookies.CookieAttributes) {
    this.cookie.set(name, value, options);
  }

  getCookie(name: string) {
    return this.cookie.get(name);
  }

  removeCookie(name: string) {
    this.cookie.remove(name);
  }

  parseCookie<T>(name: string): T | null {
    const cookie = this.getCookie(name);

    if (!cookie) return null;

    return JSON.parse(cookie);
  }
}

export const cookieManager = new CookieManager(Cookies);
