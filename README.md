# biscuit.js
A customizable cookie based jQuery notification plugin with nifty animations (Under development)

### Features
- Cookie based persistence
- Desktop notifications option
- Nifty animations from https://github.com/codrops/ModalWindowEffects

### Dependencies
- jQuery
- [jQuery-cookie](https://github.com/carhartl/jquery-cookie)

### Usage

Make a container
```html
<div class="notifications"></div>
```

Set the notifications
```javascript
$('.notifications').biscuit({
  'messages' :[
                  {'text'  : 'This is a message', 'level' : 'info'},
                  {'text'  : 'This is an error message', 'level' : 'error'}
              ]
});
```

Display them on the same or any other page
```javascript
$('.notifications').biscuit('display');
```

### Options
TODO

### Event callbacks

The following event callbacks can be set on every message individually. You can get a handle for every message using the `id` option or selecting it from the container's children.

```javascript
$('#custom_id').on('message_remove', function(data){
  console.log('A message was removed');
});

$('#custom_id').on('message_hide', function(data){
  console.log('A message is hid');
});
```
