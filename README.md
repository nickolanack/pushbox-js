pushbox-js
==========
Requires Mootools:

PushBoxes, are stackable html popovers that can be used to display html content, including iframes, images, and dom elements.

One of the issues with opening iframed content within a web page application is that generally there is little or no communication between the parent and child windows, obviously they will not share js and css libraries, and the child window
is constrained within the width and height provided by the parent. This makes it difficult to create larger web applications
in a modular fashion, (iframed sections) while appearing to have seamless integration between windows.

'PushBox' is intended to provide a solution to displaying content in the form of overlays with posible nested child overlays (ie: an open child overlay can open another pushboxed iframe or dom overlay), such that any child overlays have access to the entire screen, and that iframes appear to be part of the same root window application. 

PushBoxes can handle non-iframed content, like images and dom elements, however these items automatically recieve the 
size of the parent window since they truely are within the parent, and (more importantly) if they (behaving as a sub application), open a child overlay then these too, also recieve the entire size becuase their parent had the entire screen. This, howerver, is not the case with iframed content since opening an overlay inside an iframe assumes that the iframe is the entire window, and clicking outside the parent iframe would not be recognised by the inner overlay and would probably trigger
closing of the outer overlay (since that is the normal behavior on clicking the shadow section around a pushbox) not to mention
that the inner overlay's shadow would not appear beyond the boudary of the parent iframe.

The solution to this is to always open iframes from the root window, this can create multiple pushboxes at the root level, 
each one considered to be higher on the stack of overlays, and any open (iframe) pushbox can have its own inner pushboxes 
as long as they are not also displaying iframes. By following this pattern, all pushboxes can display content at the very top of the stack (with the entire screen size) just by calling PushBoxWindow.open(..,{push:true}), or replacing the top PushBoxWindow.open(..), as well as manipulate the entire stack through the root PushBox (PushBoxWindow). The only potential caveat is that a non iframe pushbox displayed as an inner pushbox to an iframed pushbox, will not be able to open another non-iframed pushbox on the top of the stack if there is any other iframed pushbox overlays already above it. The limitiation is diffucult enough to put into words, that I would assume that it will never occur, but just to be safe, this issue will not appear as long as the application is designed such that only the top overlay can actually open new overlays (through user interaction).




PushBoxWindow, a global instance, is created and should be used to handle all content presentation, using PushBoxWindow.open, 
iframes can be opened using parent.window.PushBoxWindow if the root window includes PushBox.js. 



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

