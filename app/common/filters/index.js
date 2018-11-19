window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.filters', [])
      .filter(
          'unResolvedCount',
          function() {
            return function(data) {
              data = data.filter(function(item) {
                return item.Resolved == 0;
              });
              return data.length;
            }
          })
      .filter(
          'quiescedToError',
          function() {
            return function(state) {
              if (state.toLowerCase() == 'quiesced') {
                return 'Error';
              } else {
                return state;
              }
            }
          })
      .filter('addUserTimezone', function() {
        return function(timestamp, utc = false) {
          if (utc) {
            return timestamp + ' UTC';
          } else {
            var ro = Intl.DateTimeFormat().resolvedOptions();
            var date = new Date(timestamp);
            // A safe, easy way to get the short timezone (e.g. CST) is to
            // subtract the time string without a timezone from the time string
            // with a timezone.
            return timestamp +
                date.toLocaleTimeString(
                        ro.lang, {timeZone: ro.timeZone, timeZoneName: 'short'})
                    .replace(date.toLocaleTimeString(), '');
          }
        }
      });
})(window.angular);
