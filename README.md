pushbox-js
==========

Creates stackable html Push-box popovers can be used to display Iframes, images or generated html

```js
$$('a')[0].addEvent('click',function(){
                                        pb=window.parent.PushBoxWindow.open(
                                                form,
                                                {
                                                        handler:'append',
                                                        push:true,
                                                        size:{x: 600, y: 380}
                                                }
                                        ).addEvent('onClose',function(){

                                                //allows reuse
                                                parent.appendChild(form);
                                                pb=null;
                                        });
                                });
```
