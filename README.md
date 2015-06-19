# biscuit.js
A customizable cookie based jQuery notification plugin with nifty animations and persistence.

## Features
- Cookie based persistence
- Desktop notifications option
- Nifty animations from https://github.com/codrops/ModalWindowEffects

## Dependencies
- jQuery
- [jQuery-cookie](https://github.com/carhartl/jquery-cookie)
- Currently, [FontAwesome](http://fortawesome.github.io/Font-Awesome/) if you want the default notification icons

## Usage

- Include the dependencies and also `biscuit.js`

- Make a container
```html
<div class="notifications"></div>
```

- Set the notifications
```javascript
$('.notifications').biscuit({
  'messages' :[
                  {'text'  : 'This is a message', 'level' : 'info'},
                  {'text'  : 'This is an error message', 'level' : 'error'}
              ]
});
```

- Display them on the same or any other page
```javascript
$('.notifications').biscuit('display');
```

## Options
```javascript
$.fn.biscuit.settings = {
  'delay'                         : 500,
  'text'                          : '',
  'level'                         : 'info',
  'effect'                        : 'biscuit-effect-1', //From biscuit-effect-1 to biscuit-effect-19 are available
  'path'                          : '/',
  'icon'                          : '',
  'dark_theme'                    : false,
  'show_icon'                     : true,
  'show_minimize_icon'            : true,
  'no_duplicates'                 : true,
  'persistent'                    : true, //Determines if the message should be persistent across pages
  'desktop_notifications'         : false,
  'desktop_notification_timeout'   : 5000
};
```

Options can be set globally for all messages when setting them like this:

```javascript
$(".messages").biscuit({
  'messages' :[
      {
        'text'  : 'This is a normal error message',
        'level' : 'error'
      },
      {
        'text'  : 'This is a normal success message with a <a href="#">link</a>',
        'level' : 'success'
      }
  ],
  'desktop_notifications' : false,
  'show_icon'             : false,
  'effect'                : 'biscuit-effect-6',
  'icon'                  : 'info_icon.png'
});
```

Or by setting them individually for each message:

```javascript
$(".messages").biscuit({
  'messages' :[
      {
        'text'  : 'This is a non-persistent message',
        'level' : 'info',
        'effect': 'biscuit-effect-9',
        'persistent': false
      },
      {
        'text'  : 'This is a normal success message with a <a href="#">link</a>',
        'level' : 'success',
        'id': 'custom_id',
        'show_minimize_icon': false
      }
  ]
});
```

## Methods

The following methods affect all messages therefore must be called on the main container.

```javascript
$('.messages').biscuit('remove_all');   // Removes all messages from cookie and display
$('.messages').biscuit('hide_all');     // Hides all messages
$('.messages').biscuit('show_all');     // Shows all messages
$('.messages').biscuit('get_messages'); // Returns all of the message elements in the main container
$('.messages').biscuit('destroy');      // Destroys the plugin, removing it from data elements
```

The following methods affect single messages:

```javascript
$('#custom_id').biscuit('show');               // Shows the message
$('#custom_id').biscuit('hide');               // Hides the message
$('#custom_id').biscuit('remove_from_cookie'); // Removes the message from cookie but keeps in display
```

## Event callbacks

The following event callbacks can be set on every message individually. You can get a handle for every message using the `id` option or selecting it from the container's children.

```javascript
$('#custom_id').on('message_remove', function(data){
  console.log('A message was removed');
});

$('#custom_id').on('message_hide', function(data){
  console.log('A message is hid');
});
```
