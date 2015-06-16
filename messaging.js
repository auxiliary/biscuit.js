;(function ($){
    /*
     * Starting the plugin itself
     */
    $.fn.messaging = function(options)
    {
        // Save the $.cookie.json setting and put it back after we're done.
        var jquery_cookie_json_setting = $.cookie.json;
        $.cookie.json = true;

        /*
         * If the user is providing the content then add them to cookie
         * and don't make/show anything
         */
        if (options === undefined || typeof options === 'object')
        {
            for (var i in options.messages)
            {
                var message = options.messages[i];
                add_to_cookie(message);
            }
        }

        /*
         * If the display method is called, load from cookie, build and show
         * the messages.
         */
        else if (options === 'display')
        {
            var cookie_messages = $.cookie('messages');
            for (var i in cookie_messages)
            {
                var content = build(cookie_messages[i].text, cookie_messages[i].level);
                this.append(content);
            }

            //Create the notifications with the settings
            containers = this.find(".message-container");
            containers.each(function(i){
                cookie_messages[i].delay = i * $.fn.messaging.settings.delay;
                if (!$.data(this, "messaging"))
                {
                    if (cookie_messages[i].hide === true)
                    {
                        return;
                    }
                    $.data(this, "messaging", new Messaging(this, cookie_messages[i]));
                }
            });
        }

        /*
         * If it's something else, open up the plugin's methods for access
         */
        else if (typeof options === 'string')
        {
            var args = arguments;
            var returns;
            this.each(function(){
                var instance = $.data(this, "messaging");
                if (instance instanceof Messaging && typeof instance[options] === 'function')
                {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                if (options === 'destroy')
                {
                    // Unbind all events and empty the plugin data from instance
                    $(instance.element).off();
                    $.data(this, 'messaging', null);
                }
                if (options === 'remove_all')
                {
                    // Remove all messages from the cookie and the DOM
                    $.removeCookie('messages');
                    $("." + $.fn.messaging.settings.messages_class).html('');
                }
            });

            return returns !== undefined ? returns : this;
        }

        // Put back $.cooki.json's original value
        $.cookie.json = jquery_cookie_json_setting;
    };

    function Messaging(element, options)
    {
        this.element = element;
        this.settings = $.extend({}, $.fn.messaging.settings, options);
        this.show();
    }

    function build(content, level) {
        var message_div = '<div class="message-container hide ' +
            level + '">';
		var icon = '';
		switch(level) {
			case 'debug': icon = 'fa-bug'; break;
			case 'info': icon = 'fa-info-circle'; break;
			case 'success': icon = 'fa-thumbs-o-up'; break;
			case 'warning': icon = 'fa-exclamation-triangle'; break;
			case 'error': icon = 'fa-thumbs-o-down'; break;
			default: console.log('invalid message level'); return;
		}
		message_div += '<div class="message-icon">';
		message_div += '<i class="fa ' + icon + ' fa-4x allcenter"></i>';
		message_div += '</div>';

		message_div += '<div class="message-text hide">' + content;
		message_div += '<div class="message-controls">';
		message_div += '<i class="fa fa-minus-circle message-minimize"></i>';
		message_div += '<i class="fa fa-times-circle message-close"></i>';
		message_div += '</div>';
		message_div += '</div>';

		message_div += '</div>'

		return message_div;
    };

    function add_to_cookie(settings)
    {
        //Get current list of messages from cookie
        var cookie_messages = $.cookie('messages');
        if (cookie_messages === undefined)
        {
            var cookie = []
            cookie.push(settings);
            $.cookie('messages', cookie);
        }
        else
        {
            if ($.fn.messaging.settings.no_duplicates === true)
            {
                // Then search and check if this is a duplicate message
                for (var i in cookie_messages)
                {
                    if (cookie_messages[i].text === settings.text)
                    {
                        return;
                    }
                }
            }
            cookie_messages.push(settings);
            $.cookie('messages', cookie_messages);
        }
    };

    Messaging.prototype.remove_from_cookie = function()
    {
        var cookie_messages = $.cookie('messages');
        for (var i in cookie_messages)
        {
            if (this.settings.text == cookie_messages[i].text)
            {
                cookie_messages.splice(i, 1); //Remove from the cookie queue
            }
        }
        $.cookie('messages', cookie_messages);
    };

    Messaging.prototype.show = function()
    {
        var icon = this.find_element(this.settings.messaging_icon_class);
        var closer = this.find_element(this.settings.messaging_close_class);
        var text = this.find_element(this.settings.messaging_text_class);
        var messaging_context = this;

		window.setTimeout(function() {
			$(messaging_context.element).removeClass('hide').addClass('animated flipInY');
		}, this.settings.delay);

		window.setTimeout(function() {
			text.toggle('slide').removeClass('hide');
			closer.click(function() {
				// Remove animate.css class first or fade fails
				$(messaging_context.element).removeClass('animated flipInY')
					.fadeTo(400, 0).slideUp(400)
                $(messaging_context.element).messaging("remove_from_cookie");
			});
		}, this.settings.delay + 400);
    };

    /*
     * Finds an element inside the main 'messages' wrapper based on the
     * class name given
     */
    Messaging.prototype.find_element = function(class_name)
    {
        return $(this.element).find("." + class_name);
    };

    $.fn.messaging.settings = {
        'messaging_icon_class'      : 'message-icon',
        'messaging_close_class'     : 'message-close',
        'messaging_text_class'      : 'message-text',
        'messages_class'            : 'messages',
        'delay'                     : 900,
        'text'                      : '',
        'level'                     : 'info',
        'no_duplicates'             : true,
        'hide'                      : false // Hide the message and not show it
    };

}(jQuery));
