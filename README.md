pushbox-js
==========

Creates stackable html Push-box popovers can be used to display Iframes, images or generated html

```js
PushBoxWindow.open(item [, options]); //generally the item is an element or string url
```

In this example, two popovers are opened and stacked. 

```js
window.parent.PushBoxWindow.open(htmlFormEl,{
   handler:'append',
});


window.parent.PushBoxWindow.open(htmlAlertEl,{
   handler:'append',
   push:true,
});

```


In this case the second pb will wipe the first (notice the absence of push:true option)

```js
window.parent.PushBoxWindow.open(htmlFormEl,{
   handler:'append',
});


window.parent.PushBoxWindow.open(htmlAlertEl,{
   handler:'append',
});

```

Open Iframes, x-domain considerations may be neccesary

```js
window.parent.PushBoxWindow.open('http//....',{
   handler:'iframe',
});
```


Images

```js
window.parent.PushBoxWindow.open('http://../image.png',{
   handler:'image'
});
```

Sizing

```js
window.parent.PushBoxWindow.open(htmlContentEl,{
   handler:'append',
   size:{x:100,y:100}
});
```

Reusing inline html

```js
var p=el.parentNode;
window.parent.PushBoxWindow.open(el,{
   handler:'append',
}).addEvent('onClose',function(){
   p.appendChild(el); //returns el to p. useful if pubox is triggered on some reocurring event
});
```

