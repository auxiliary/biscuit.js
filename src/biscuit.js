;(function ($, window){
    /*
     * Starting the plugin itself
     */
    $.fn.biscuit = function(options)
    {
        $.cookie.json = true;

        /*
         * If desktop_notifications is true then ask for permission
         */
        if (options.desktop_notifications === true)
        {
            Notification.requestPermission();
        }

        /*
         * If the user is providing the content then add them to cookie
         * and don't make/show anything
         */
        if (options === undefined || typeof options === 'object')
        {
            for (var i in options.messages)
            {
                var message = options.messages[i];

                /*
                 * Getting crazy and merging settings with individual message
                 * settings to enable more global settings, if needed.
                 */
                var global_settings = {}
                for (var key in options)
                {
                    if (key !== 'messages')
                    {
                        global_settings[key] = options[key];
                    }
                }
                message = $.extend(message, global_settings);
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

                /*
                 * These are functions that effect all messages globally,
                 * therefor they have to be called on the main container itself
                 */
                if (options === 'destroy')
                {
                    // Unbind all events and empty the plugin data from instance
                    $(instance.element).off();
                    $.data(this, 'biscuit', null);
                }
                if (options === 'remove_all')
                {
                    // Remove all messages from the cookie and the DOM
                    $.removeCookie('messages', {path: $.fn.biscuit.settings.path});
                    $(this).html('');
                }
                if (options === 'hide_all')
                {
                    $(this).find('.message-container').each(function(){
                        $(this).biscuit("hide");
                    });
                }
                if (options === 'show_all')
                {
                    $(this).find('.message-container').each(function(){
                        $(this).biscuit("show");
                    });
                }
                // Returns the message-container elements for each message
                if (options === 'get_messages')
                {
                    returns = $(this).find('.message-container');
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

    /*
     * Build a message for being added to the DOM
     */
    function build(settings)
    {
        var content                     = settings.text;
        var level                       = settings.level;
        var effect                      = settings.effect;
        var id                          = settings.id;
        var minimize_icon_visibility    = settings.show_minimize_icon ? '' : 'hide';
        var dark_theme_class            = settings.dark_theme ? 'dark' : '';
        var icon_visibility             = settings.show_icon ? '' : 'invisible';
        var icon                        = '';

        // Determine the icon based on the level
        switch (level)
        {
            case 'debug'    : icon = 'fa-bug'; break;
            case 'info'     : icon = 'fa-info-circle'; break;
            case 'success'  : icon = 'fa-thumbs-o-up'; break;
            case 'warning'  : icon = 'fa-exclamation-triangle'; break;
            case 'error'    : icon = 'fa-thumbs-o-down'; break;
            default         : console.log('invalid message level'); return;
        }

        // Build the message and return it
        var message_div = $('<div/>', {
            'class': 'message-container hide ' + effect + ' ' + level + ' ' + dark_theme_class,
            'id': id === undefined ? '' : id
        }).append(
            $('<div/>', {'class': 'message-icon ' + icon_visibility}).append(
                $('<i/>', {'class': 'fa fa-4x allcenter ' + icon})
            )
        )
        .append(
            $('<div/>', {'class': 'message-text', 'html': content}).append(
                $('<div/>', {'class': 'message-controls'}).append(
                    $('<i/>', {'class': 'fa fa-minus-circle message-minimize ' + minimize_icon_visibility})
                )
                .append(
                    $('<i/>', {'class': 'fa fa-times-circle message-close'})
                )
            )
        );

		return message_div;
    };

    /*
     * Add a message along with its settings to the cookie
     */
    function add_to_cookie(settings)
    {
        //Get current list of messages from cookie
        var cookie_messages = $.cookie('messages');
        if (cookie_messages === undefined)
        {
            var cookie = []
            cookie.push(settings);
            $.cookie('messages', cookie, {'path': $.fn.biscuit.settings.path});
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
            $.cookie('messages', cookie_messages, {'path': $.fn.biscuit.settings.path});
        }
    };

    /*
     * Remove a message from the cookie and trigger the user defined callback
     */
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
        $.cookie('messages', cookie_messages, {'path': $.fn.biscuit.settings.path});

        $(this.element).trigger("message_remove", {
            id  : this.settings.id,
            text: this.text
        });
    };

    Biscuit.prototype.show = function()
    {
        var icon                = $(this.element).find('.message-icon');
        var closer              = $(this.element).find('.message-close');
        var minimizer           = $(this.element).find('.message-minimize');
        var text                = $(this.element).find('.message-text');
        var messaging_context   = this;

        // Animations for showing the message
		window.setTimeout(function() {
			$(messaging_context.element).removeClass('hide').addClass('animated flipInY');
		}, this.settings.delay);

		window.setTimeout(function() {
            $(messaging_context.element).addClass("biscuit-show");
			closer.on('click', function() {
				// Remove animate.css class first or fade fails
				$(messaging_context.element).removeClass('animated flipInY')
					.fadeTo(messaging_context.settings.text_show_delay, 0)
                    .slideUp(messaging_context.settings.text_show_delay);

                $(messaging_context.element).biscuit("remove_from_cookie");
			});

            //If minimize button was clicked, hide but don't delete from cookie
            minimizer.on('click', function(){
                messaging_context.hide();
            });
		}, this.settings.delay + this.settings.text_show_delay);

        /*
         * Show desktop notifications if enabled.
         * We need to check for visibilityState to prevent it popping up in
         * the prerender phase. Also, we need the timer to prevent Firefox from
         * messing it up.
         */
        window.setTimeout(function(){
            if (messaging_context.settings.desktop_notifications === true && document.visibilityState !== 'prerender')
            {
                var desktop_notification_options = {
                    body: text.text(),
                    icon: messaging_context.icon,
                    tag : text.text()
                };

                var desktop_notification = new Notification('', desktop_notification_options);
                setTimeout(desktop_notification.close.bind(desktop_notification),
                    messaging_context.settings.desktop_notification_timeout);
            }
        }, 100);

        if (this.settings.persistent == false)
        {
            this.remove_from_cookie();
        }
    };

    /*
     * Hide the message for now and trigger the user defined callback
     */
    Biscuit.prototype.hide = function()
    {
        $(this.element).removeClass('animated flipInY')
            .fadeTo(this.settings.text_show_delay, 0)
            .slideUp(this.settings.text_show_delay, function(){
                $(this).addClass('hide')
                    .removeAttr('style')
                    .removeClass('biscuit-show animated flipInY')
            });

        $(this.element).trigger("message_hide", {
            id  : this.settings.id,
            text: this.text
        });
    };

    $.fn.biscuit.settings = {
        'delay'                         : 500,
        'text_show_delay'               : 200,
        'text'                          : '',
        'level'                         : 'info',
        'effect'                        : 'biscuit-effect-1',
        'path'                          : '/',
        'icon'                          : '',
        'dark_theme'                    : false,
        'show_icon'                     : true,
        'show_minimize_icon'            : true,
        'no_duplicates'                 : true,
        'persistent'                    : true,
        'desktop_notifications'         : false,
        'desktop_notification_timeout'   : 5000
    };

}(jQuery, window));
