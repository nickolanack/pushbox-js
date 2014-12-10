pushbox-js
==========
Requires Mootools:

PushBoxes, are stackable html popovers (lightboxes, modal popovers) that can be used to display html content, including
iframes, images, and dom elements. PushBoxes when open, display a shadow overlay accros the entire window, and have a content
overlay or window to display the new content. Generally, the content includes a close button and the entire shadow (background)
when clicked also triggers a close event although that is configurable.

Displaying content in this way itself is not the most difficult thing to do. However, what is much more difficult and
what this library is trying to provide, is a tool that allows popovers to be nested.  Complex should be 
converted to a linear stack of open overlays, and each overlay should recieve the full size of the browser window. 



An example use case: I have a web application that opens various PushBoxes to display user interactive forms, menus, or content including videos. I want to display a video within a PushBox and also have an edit button that instead of taking the user to a edit form, simply opens the form overtop of the application in another PushBox. The problems are:
   
   The video was displayed within an iframe, and opening a PushBox within the iframe normally prevents the inner PushBox
   from accessing the entire size, unless the parent iframe was the entire size, but it is not.
   
   The form must be smaller than the parent iframe or the entire PushBox becomes scrollable
   
   The shadow area does not cover the video PushBoxes own shadow area so that when it is configured to close on shadow click
   both pushboxes close sometimes (unless i click the shadow inside the iframe). 
   
   It becomes visually obvious that there is a boundary because of the iframe. I can see it cutting off the inner shadow.


In my own use of PushBox I generally keep nesting/stacking very shallow, occasionally 2 or 3 overlays can be stacked, and 
even then I always keep all the overlays as simple as possible, overlays don't need any navigation menues, except to drill 
down to more specific content becuase navigating back, is done by closing the top PushBox, and maybe a core navigation menu 
is at the bottom so that i can pop down to that if i need to. So in this way, the complexity of PushBoxes is eleviated by the
simpicity of design that it allows. 



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

