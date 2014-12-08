pushbox-js
==========

Creates stackable html Push-box popovers can be used to display Iframes, images or generated html


In this example, two popovers are opened and stacked. 

```js
window.parent.PushBoxWindow.open(htmlFormEl,{
   handler:'append',
   push:true,
   size:{x: 600, y: 380}
});


window.parent.PushBoxWindow.open(htmlAlertEl,{
   handler:'append',
   push:true,
   size:{x: 600, y: 380}
});

```


In this case the second pb will wipe the first (notice the absence of push:true option)

```js
window.parent.PushBoxWindow.open(htmlFormEl,{
   handler:'append',
   size:{x: 600, y: 380}
});


window.parent.PushBoxWindow.open(htmlAlertEl,{
   handler:'append',
   size:{x: 600, y: 380}
});

```
