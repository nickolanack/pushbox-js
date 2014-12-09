pushbox-js
==========
Requires Mootools:

Creates stackable html Push-box popovers can be used to display Iframes, images or generated html

```js
PushBoxWindow.open(item [, options]); //generally the item is an element or string url
//this is the prefered way to open iframes and for iframes to open nested pushboxes
parent.window.PushBoxWindow 

```

In this example, two popovers are opened and stacked. 

```js
PushBoxWindow.open(htmlFormEl,{
   handler:'append',
});


PushBoxWindow.open(htmlAlertEl,{
   handler:'append',
   push:true,
});

```


In this case the second pb will wipe the first (notice the absence of push:true option)

```js
PushBoxWindow.open(htmlFormEl,{
   handler:'append',
});


PushBoxWindow.open(htmlAlertEl,{
   handler:'append',
});

```

Open Iframes, x-domain considerations may be neccesary. using window.parent has the advantage that nested iframes
can open pushboxes and they are not bounded by the size of thier own pushbox window the advantage is that 
complex window states and flows can be created with simple iframes

```js
window.parent.PushBoxWindow.open('http//....',{
   handler:'iframe',
});
```


Images

```js
PushBoxWindow.open('http://../image.png',{
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

