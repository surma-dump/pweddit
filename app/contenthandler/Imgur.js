import Utils from 'modules/Utils';
import ContentHandlerRegistry from 'modules/ContentHandlerRegistry';

export default class Imgur {
  static get hostnames() {
    return ['imgur.com', 'i.imgur.com'];
  }

  canHandle(url) {
    return this.hostnames.indexOf(url.host) !== -1;
  }

  onFetch(event) {
  }
}

ContentHandlerRegistry().register(Imgur);
