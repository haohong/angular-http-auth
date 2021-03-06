/**
 * AngularJS HTTP Auth & Request Queuing Service
 * @copyright 2013, Union of RAD, LLC (http://union-of-rad.com/)
 * @link https://github.com/uor/angular-auth-http#readme
 */
angular.module('ur.http.auth', []).service("base64", ['$window', function($window) {

  /**
   * Base64 encoding service. Provides a fallback for browsers that don't implement
   * `btoa()` / `atob()` (*ahem!* IE).
   */

  var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  angular.extend(this, {
    encode: $window.btoa ? function(input) { return $window.btoa(input); } : function(input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      input = _utf8_encode(input);

      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output += key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
      }
      return output;
    },

    decode: $window.atob ? function(input) { return $window.atob(input); } : function(input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {
        enc1 = key.indexOf(input.charAt(i++));
        enc2 = key.indexOf(input.charAt(i++));
        enc3 = key.indexOf(input.charAt(i++));
        enc4 = key.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }

      return _utf8_decode(output);
    }
  });

  function _utf8_encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  function _utf8_decode(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {

      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }

}]).service('httpAuth', ['base64', '$http', function(base64, $http) {

  /**
   * The httpAuth service handles assigning HTTP authentication credentials for API requests.
   */

  var extend = angular.extend, isArray = angular.isArray, forEach = angular.forEach;

  function loop(list, op) {
    forEach(isArray(list) ? list : [list], op);
  }

  extend(this, {
    basic: function(credentials, options) {
      options = extend({ type: 'common' }, options || {});

      if (!credentials || !credentials.username || !credentials.password) {
        throw new Error("Credentials expects 'username' & 'password' properties");
      }
      var hash = base64.encode(credentials.username + ':' + credentials.password);

      loop(options.type, function(type) {
        $http.defaults.headers[type].Authorization = 'Basic ' + hash;
      });
    },

    cancel: function(options) {
      options = extend({ type: 'common' }, options || {});

      loop(options.type, function(type) {
          delete $http.defaults.headers[type].Authorization;
      });
    }
  });

}]);
