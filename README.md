pushbox-js
==========
Requires Mootools:

<div style="float: left" >
   <img src="https://github.com/nickolanack/pushbox-js/raw/master/logo.png" />
</div>


PushBoxes, are stackable html popovers (aka: lightbox or modal popover/window) that can be used to display html content, including
iframes, images, and dom elements. PushBoxes when open, display a shadow overlay accros the entire window, and have a central
content overlay or window to display the new content. Generally, the content includes a close button and the entire shadow
(background) when clicked also triggers a close event although that is configurable.

Displaying content in this way itself is not the most difficult thing to do. However, what is much more difficult and
what this library is trying to provide, is a tool that allows popovers to be nested.  Complex tree like nestings rarely 
occur, but should be posible and appear as a linear stack of open overlays, each recieving the full size of the browser window. 
This is difficult to do, when views are created as a series of iframes becuase iframe overlays generally cannot create new child overlays outside of thier own bounding box.


Example Use Case: I'm developing a web application that opens various PushBoxes to display user interactive forms, menus, or content including videos. I want to display a video within a PushBox and also have an edit button that instead of taking the user to a edit form, simply opens the form above the rest of the application in another PushBox. The problems are:
   
   The video was displayed within an iframe, and opening a PushBox within the iframe normally prevents the inner PushBox
   from accessing the entire size, unless the parent iframe was the entire size, but it is not.
   
   The form must be smaller than the parent iframe or the entire PushBox becomes scrollable
   
   The shadow area does not cover the video PushBoxes own shadow area so that when it is configured to close on shadow click
   both pushboxes close sometimes (unless i click the shadow inside the iframe). 
   
   It becomes visualy obvious that there is a boundary because of the iframe. I can see it cutting off the inner shadow.


In my own use of PushBox I generally keep nesting/stacking very shallow, occasionally 2 or 3 overlays can be stacked, and 
even then I always keep all the overlays as simple as possible. Thats ok, overlays don't need any navigation menues, except to drill down to more specific content becuase navigating back can done by closing the top PushBox, and maybe a core navigation menu is at the bottom so that i can pop down to that if i need to. In this way, the complexity of PushBoxes is eleviated by the
simpicity of design that it allows. 


The General Goals of PushBox:

PushBoxes should able to open from the root window, as well as from inside any iframed content and that should not affect the
way each PushBox is displayed. 

Each PushBox should recieve and cover the entire browser window. 

The Top PushBox recieves all user interaction. It is also assumed that only the top pushbox opens child pushBoxes.

PushBoxes can open iframes, images, dom content, etc.








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

