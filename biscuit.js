;(function ($, window){
    /*
     * Starting the plugin itself
     */
    $.fn.biscuit = function(options)
    {
        $.cookie.json = true;
        $.cookie.path = $.fn.biscuit.settings.path;
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
                var settings = $.extend({}, $.fn.biscuit.settings, cookie_messages[i]);
                var message = build(settings);
                this.append(message);
            }

            //Create the notifications with the settings
            containers = this.find(".message-container");
            containers.each(function(i){
                cookie_messages[i].delay = i * $.fn.biscuit.settings.delay;
                if (!$.data(this, "biscuit"))
                {
                    $.data(this, "biscuit", new Biscuit(this, cookie_messages[i]));
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
                var instance = $.data(this, "biscuit");
                if (instance instanceof Biscuit && typeof instance[options] === 'function')
                {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                if (options === 'destroy')
                {
                    // Unbind all events and empty the plugin data from instance
                    $(instance.element).off();
                    $.data(this, 'biscuit', null);
                }
                if (options === 'remove_all')
                {
                    // Remove all messages from the cookie and the DOM
                    $.removeCookie('messages');
                    $("." + $.fn.biscuit.settings.messages_class).html('');
                }
            });

            return returns !== undefined ? returns : this;
        }
    };

    function Biscuit(element, options)
    {
        this.element = element;
        this.settings = $.extend({}, $.fn.biscuit.settings, options);
        this.show();
    }

    function build(settings)
    {
        var content = settings.text;
        var level = settings.level;
        var effect = settings.effect;
        // Determine the icon based on the level
        var icon = '';
        switch(level) {
            case 'debug': icon = 'fa-bug'; break;
            case 'info': icon = 'fa-info-circle'; break;
            case 'success': icon = 'fa-thumbs-o-up'; break;
            case 'warning': icon = 'fa-exclamation-triangle'; break;
            case 'error': icon = 'fa-thumbs-o-down'; break;
            default: console.log('invalid message level'); return;
        }

        // Build the message and return it
        var message_div = $('<div/>', {
            'class': 'message-container hide ' + effect + ' ' + level
        }).append(
            $('<div/>', {'class': 'message-icon'}).append(
                $('<i/>', {'class': 'fa fa-4x allcenter ' + icon})
            )
        )
        .append(
            $('<div/>', {'class': 'message-text', 'text': content}).append(
                $('<div/>', {'class': 'message-controls'}).append(
                    $('<i/>', {'class': 'fa fa-minus-circle message-minimize'})
                )
                .append(
                    $('<i/>', {'class': 'fa fa-times-circle message-close'})
                )
            )
        );

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
            if ($.fn.biscuit.settings.no_duplicates === true)
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

    Biscuit.prototype.remove_from_cookie = function()
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

    Biscuit.prototype.show = function()
    {
        var icon = this.find_element(this.settings.messaging_icon_class);
        var closer = this.find_element(this.settings.messaging_close_class);
        var minimizer = this.find_element(this.settings.messaging_minimize_icon_class);
        var text = this.find_element(this.settings.messaging_text_class);
        var messaging_context = this;

		window.setTimeout(function() {
			$(messaging_context.element).removeClass('hide').addClass('animated flipInY');
		}, this.settings.delay);

		window.setTimeout(function() {
            $(messaging_context.element).addClass("md-show");
			closer.on('click', function() {
				// Remove animate.css class first or fade fails
				$(messaging_context.element).removeClass('animated flipInY')
					.fadeTo(messaging_context.settings.text_show_delay, 0)
                    .slideUp(messaging_context.settings.text_show_delay);


                $(messaging_context.element).biscuit("remove_from_cookie");
			});

            //If minimize button was clicked, hide but don't delete from cookie
            minimizer.on('click', function(){
                $(messaging_context.element).removeClass('animated flipInY')
					.fadeTo(messaging_context.settings.text_show_delay, 0)
                    .slideUp(messaging_context.settings.text_show_delay)
            })
		}, this.settings.delay + this.settings.text_show_delay);

        if (this.settings.persistent == false)
        {
            this.remove_from_cookie();
        }
    };

    /*
     * Finds an element inside the main 'messages' wrapper based on the
     * class name given
     */
    Biscuit.prototype.find_element = function(class_name)
    {
        return $(this.element).find("." + class_name);
    };

    $.fn.biscuit.settings = {
        'messaging_icon_class'          : 'message-icon',
        'messaging_close_class'         : 'message-close',
        'messaging_text_class'          : 'message-text',
        'messages_class'                : 'messages',
        'messaging_minimize_icon_class' : 'message-minimize',
        'delay'                         : 500,
        'text_show_delay'               : 200,
        'text'                          : '',
        'level'                         : 'info',
        'no_duplicates'                 : true,
        'effect'                        : 'md-effect-1',
        'persistent'                    : true,
        'path'                          : '/'
    };

}(jQuery, window));
