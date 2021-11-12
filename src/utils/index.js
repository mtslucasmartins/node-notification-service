class UrlUtils {

  static parseSearchParams(url) {
    const queryString = url.substring(url.indexOf('?') + 1)

    return new URLSearchParams(queryString);
  }

}

module.exports = {
  UrlUtils
};
