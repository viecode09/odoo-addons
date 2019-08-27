odoo.define("mail.Manager.MailMobile", function(require) {
  "use strict";

  var MailManager = require("mail.Manager");

  var core = require("web.core");
  var session = require("web.session");

  var _t = core._t;

  // add some code to send to device with javascript API
  // readmore in https://github.com/react-native-community/react-native-webview/blob/master/docs/Guide.md
  MailManager.include({
    _handleChannelMessageNotification: function(messageData) {
      var self = this;
      var def;
      var channelAlreadyInCache = true;
      if (messageData.channel_ids.length === 1) {
        channelAlreadyInCache = !!this.getChannel(messageData.channel_ids[0]);
        def = this.joinChannel(messageData.channel_ids[0], {
          autoswitch: false
        });
      } else {
        def = $.when();
      }
      def.then(function() {
        // don't increment unread if channel wasn't in cache yet as
        // its unread counter has just been fetched
        self.addMessage(messageData, {
          showNotification: true,
          incrementUnread: channelAlreadyInCache
        });
      });
      // if message not to sender
      // Then send message with json type
      if (messageData.author_id[0] != session.partner_id && odoo.in_app) {
        window.ReactNativeWebView.postMessage(JSON.stringify(messageData));
      }
    }
  });
});
