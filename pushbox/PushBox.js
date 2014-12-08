/**
 * PushBox, is based on SqueezeBox, by Harald Kirschner <mail [at] digitarald.de> and Rouven Weßling <me [at] rouvenwessling.de>
 * Pushbox is intended to provide a the same features of SqueezeBox, but with the ability to provide stackable PushBoxes, so that 
 * opening a child pushbox from within some parent Pushbox, allows the child access to the entire size of the screen. PushBoxes 
 * can initiated from a child window, and will be physically opened by the root window
 * 
 *
 * @version		2.0
 *
 * @license		MIT-style license
 * @author		Harald Kirschner <mail [at] digitarald.de> SqueezeBox
 * @author		Rouven Weßling <me [at] rouvenwessling.de> SqueezeBox
 * @author		Nick Blackwell 	
 * 
 * There are multiple ways to open a window using PushBox, it is recomended to use PushBoxWindow (a global instance) 
 * to open windows in situations where some other caller might also open a window, or windows should stack. 
 * 
 * @example
 * 
 * 
 *	var element=(...) //some complex html element. a video?
 *	PushBoxWindow.open(element, {handler:"append", size: {x:800, y:600}, push:true});
 * 
 */

var PushBox = new Class({
	Implements:[Events, Options, Chain],

	presets: {
		onOpen: function(){},
		onClose: function(){},
		onUpdate: function(){},
		onResize: function(){},
		onMove: function(){},
		onShow: function(){},
		onHide: function(){},
		size: {x: 600, y: 450},
		elasticX:false, //or {min:200,max:1000},
		elasticY:false, //or {min:200,max:1000}
		sizeLoading: {x: 200, y: 150},
		marginInner: {x: 20, y: 20},
		marginImage: {x: 50, y: 75},
		handler: false,
		target: null,
		closable: true,
		closeBtn: true,
		zIndex: 65558,
		overlayOpacity: 0.7,
		classWindow: '',
		classOverlay: '',
		overlayFx: {},
		resizeFx: {},
		contentFx: {},
		parse: false, // 'rel'
		parseSecure: false,
		shadow: true,
		overlay: true,
		document: null,
		ajaxOptions: {}
	},

	initialize: function(presets) {
		//if (this.options) return this;
		var me=this;
		me.window=window;
		var options=Object.append({},presets);
		me.pushBoxIdentifier='PushBox_'+Math.random()*9999999;
		PushBox.AddToStack(me);
		var index=PushBox.IndexOfPushBox(me);
		if(index>0){
			options.zIndex=PushBox.PushBoxAtIndex(index-1).presets.zIndex+3;
		}

		me.presets = Object.append(me.presets, options);

		me.doc = me.presets.document || document;
		me.options = {};
		me.setOptions(this.presets);
		me._build();
		me.bound = {
				window: me.reposition.bind(me, [null]),
				scroll: me.checkTarget.bind(me),
				close: me.close.bind(me),
				key: me.onKey.bind(this)
		};
		me.isOpen = me.isLoading = false;


		

	},

	_build: function() {
		this.overlay = new Element('div', {
			'class': 'pb-o',
			'aria-hidden': 'true',
			styles: { zIndex: this.options.zIndex},
			tabindex: -1
		});
		this.win = new Element('div', {
			'class': 'pb-w',
			role: 'dialog',
			'aria-hidden': 'true',
			styles: {zIndex: this.options.zIndex + 2}
		});
		if (this.options.shadow) {
			if (Browser.chrome
					|| (Browser.safari && Browser.version >= 3)
					|| (Browser.opera && Browser.version >= 10.5)
					|| (Browser.firefox && Browser.version >= 3.5)
					|| (Browser.ie && Browser.version >= 9)) {
				this.win.addClass('shadow');
			} else if (!Browser.ie6) {
				var shadow = new Element('div', {'class': 'pb-bg-wrap'}).inject(this.win);
				var relay = function(e) {
					this.overlay.fireEvent('click', [e]);
				}.bind(this);
				['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].each(function(dir) {
					new Element('div', {'class': 'pb-bg pb-bg-' + dir}).inject(shadow).addEvent('click', relay);
				});
			}
		}
		this.content = new Element('div', {'class': 'pb-c'}).inject(this.win);
		this.closeBtn = new Element('a', {'class': 'pb-btn-close', href: '#', role: 'button'}).inject(this.win);
		this.closeBtn.setProperty('aria-controls', 'pb-w');
		this.fx = {
				overlay: new Fx.Tween(this.overlay, Object.append({
					property: 'opacity',
					onStart: Events.prototype.clearChain,
					duration: 250,
					link: 'cancel'
				}, this.options.overlayFx)).set(0),
				win: new Fx.Morph(this.win, Object.append({
					onStart: Events.prototype.clearChain,
					unit: 'px',
					duration: 750,
					transition: Fx.Transitions.Quint.easeOut,
					link: 'cancel',
					unit: 'px'
				}, this.options.resizeFx)),
				content: new Fx.Tween(this.content, Object.append({
					property: 'opacity',
					duration: 250,
					link: 'cancel'
				}, this.options.contentFx)).set(0)
		};
		$$('body')[0].appendChild(this.overlay);
		$$('body')[0].appendChild(this.win);
	},




	open: function(subject, options) {
		//this.initialize();
		var me=this;
		if(options.push){
			delete options.push;
			return (new PushBox()).open(subject,options);
		}
		me.removeStyles();
		if(PushBox.IndexOfPushBox(me)<0){
			PushBox.AddToStack(me);
		}
		if(options.anchor){

			me.anchor=options.anchor;
			delete options.anchor;

		}

		if (this.element != null) this._trash();
		this.element = document.id(subject) || false;

		this.setOptions(Object.append(this.presets, options || {}));

		if (this.element && this.options.parse) {
			var obj = this.element.getProperty(this.options.parse);
			if (obj && (obj = JSON.decode(obj, this.options.parseSecure))) this.setOptions(obj);
		}
		this.url = ((this.element) ? (this.element.get('href')) : subject) || this.options.url || '';

		this._assignOptions();

		var handler = this.options.handler;
		if (handler)return this._setContent(handler, this.parsers[handler].call(this, (handler=='append'?subject:true)));
		
		return this.parsers.some(function(parser, key) {
			var content = parser.call(this);
			if (content) {
				this._setContent(key, content);
				return true;
			}
			return false;
		}, this);
	},

	fromElement: function(from, options) {
		return this.open(from, options);
	},

	_assignOptions: function() {
		this.overlay.addClass(this.options.classOverlay);
		this.win.addClass(this.options.classWindow);
	},
	getPushBoxFor:function(window){
		var stack=window.parent.PushBox?window.parent.PushBox.PushBoxStack:PushBox.PushBoxStack;
		//window.parent.console.debug(stack);
		var found=false;
		Object.each(stack,function(pb){
			if(!found&&pb.asset&&pb.asset.contentWindow==window)found=pb;

		});
		//window.parent.console.debug(found); 
		return found;

	},
	getPushBoxAbove:function(window){
		var me=this;
		var stack=me.getPushBoxesAbove(window);
		if(stack.length)return stack[0];
		return false;
	},

	getPushBoxesAbove:function(){
		var me=this;
		return PushBox.GetPushBoxesAbove(me);
	},
	/**
	 * closes the top most p-boxes above the current window. 
	 * assuming that the root document contains a Pushbox stack. Openers, should (if possible),
	 * open inside the root stack. then each window is a child to the root document.
	 * and this method can be called from the root (closing all boxes) or any other box, closing all boxes after it.
	 */
	closeAbove:function(window){
		var me=this;
		var boxes;
		if(window){
			boxes=PushBox.GetPushBoxesAbove(window).reverse();
		}else{
			boxes=me.getPushBoxesAbove().reverse();
		}
		Array.each(boxes,function(pb){
			pb.close();
		});
	},

	/**
	 * 
	 * @returns returns the pushbox that opened this pushbox. or false this is a root pushbox.
	 */
	getOpenerPushBox:function(){
		return PushBox.GetPushBoxOpener(this);
	},
	/**
	 * @returns the window resposible for the content within the pushbox that opened this 
	 * window. if an iframe defines a global method 'xyz', and opens a cascading iframe pushbox, 
	 * the new window can call this.getOpenerWindow().xyz
	 * 
	 * this will also work for non iframed windows, in which the window is actually the same accross all
	 * pushboxes.
	 */
	getOpenerWindow:function(){
		var me=this;
		return PushBox.GetOpenerWindow(me);
	},

	close: function(e) {
		var me=this;
		if(!me.isOpen){
			
			var pushbox=me.getPushBoxFor(window);
			if(pushbox.isOpen)return pushbox.close();

		}else{
			PushBox.RemoveFromStack(me);
		}

		var stoppable = (typeOf(e) == 'event');
		if (stoppable) e.stop();
		try{if (!this.isOpen || (stoppable && !Function.from(this.options.closable).call(this, e))) return this;}catch(e){
			console.error(["PushBox Close Exception",e]);
		}
		this.fx.overlay.start(0).chain(this.toggleOverlay.bind(this));
		this.win.setProperty('aria-hidden', 'true');
		this.fireEvent('onClose', [this.content]);
		this._trash();
		this.toggleListeners();
		this.isOpen = false;
		return this;
		

	},

	_trash: function() {
		this.element = this.asset = null;
		
		this.window.destroy();
		this.overlay.destroy();
		
		this.options = {};
		this.removeEvents().setOptions(this.presets).callChain();
	},

	_onError: function() {
		this.asset = null;
		this._setContent('string', this.options.errorMsg || 'An error occurred');
	},

	_setContent: function(handler, content) {
		var me=this;
		if (!this.handlers[handler]) return false;
		this.content.className = 'pb-c pb-c-' + handler;
		//updated delay arguments, to pass array as third argument, there seems to be an issue otherwise, even though the 
		//documentation indicates a single item can be passed, _applyContent recieves null otherwise
		this.applyTimer = this._applyContent.delay(this.fx.overlay.options.duration, this, [me.handlers[handler].call(me, content)]);
		if (this.overlay.retrieve('opacity')) return this;
		this.toggleOverlay(true);
		this.fx.overlay.start(this.options.overlayOpacity);
		return this.reposition();
	},

	_applyContent: function(content, size) {
	
		if (!this.isOpen && !this.applyTimer) return;
		this.applyTimer = clearTimeout(this.applyTimer);
		this.hideContent();
		if (!content) {
			this.toggleLoading(true);
		} else {
			if (this.isLoading) this.toggleLoading(false);
			this.fireEvent('onUpdate', [this.content], 20);
		}
		if (content) {
			if (['string', 'array'].contains(typeOf(content))) {
				this.content.set('html', content);
			} else {
				//window.parent.console.debug(typeOf(content));
				if (!(content !== this.content && this.content.contains(content))) {
					this.content.adopt(content);
				}
			}
		}
		this.callChain();
		if (!this.isOpen) {
			this.toggleListeners(true);
			this.resize(size, true);
			this.isOpen = true;
			this.win.setProperty('aria-hidden', 'false');
			this.fireEvent('onOpen', [this.content]);
		} else {
			this.resize(size);
		}
	},

	_addImageControls:function(){
		var me=this;
		var images=me.options.images;
		if(images.length<=1){
			return; 
		}
		
		me.win.addClass('images');
		
		
		
		
		var image=me.asset.src;
		var hasNext=true;
		var hasPrevious=true;
		var i=-1;
		var imageThumbsContainer=new Element('div',{'class':'thumbnails'});
		
		Array.each(me.options.images, function(img, index){
			var imgStr;
			var selected=false;
			if(typeof(img)=='string'){
				imgStr=img;
			}else{
				imgStr=img.src;
			}
			
			if(JSTextUtilities.CompareUrls(imgStr, image)){
				i=index; //find the currently selected index.
				selected=true;
			}
			
			if(window.JSImageUtilites){
				var p=imageThumbsContainer.appendChild(new Element('span', {styles:{display:'none'}}));
				(thumb=new Asset.image(JSImageUtilites.ThumbnailUrl(imgStr, {width:50, height:30}),{onload:function(){
					
					var clipped=JSImageUtilites.ResizeImage(this,{width:50, height:30, clip:true, className:false});
					if(selected)clipped.addClass('selected');
					imageThumbsContainer.replaceChild(clipped, p);
					//imageThumbsContainer.replaceChild(clipped,thumb);
					clipped.setStyle('display',null);
					if(!selected)JSImageUtilites.AddImageLightBox(clipped, imgStr, {images:images, onOpen:me.close.bind(me)});
					
				}}));
			}
			
		});
		
		var loop=true;
		
		if(!loop&&i==0)hasPrevious=false; 
		if(!loop&&i==(images.length-1))hasNext=false;
		
		
		
		if(hasPrevious){
			
			var prv=(images.length+i-1)%images.length;
			
			var prevContainer=new Element('div',{'class':'previous_image'});
			var prev=new Element('a',{href:'#'});
			
			prevContainer.appendChild(prev);
			me.win.appendChild(prevContainer);
			JSImageUtilites.AddImageLightBox(prev, images[prv].src||images[prv], {images:images, onOpen:me.close.bind(me)});
		}
		
		if(hasNext){
			
			var nxt=(i+1)%images.length;
			var nextContainer=new Element('div',{'class':'next_image'});
			var next=new Element('a',{href:'#'});
			nextContainer.appendChild(next);
			me.win.appendChild(nextContainer);
			//works for array of image assets and urls
			JSImageUtilites.AddImageLightBox(next, images[nxt].src||images[nxt], {images:images, onOpen:me.close.bind(me)});
		}
		
		
		
		
		me.win.appendChild(imageThumbsContainer);
		
	},
	
	resize: function(size, instantly) {
		var me=this;
		this.showTimer = clearTimeout(this.showTimer || null);
		var box = this.doc.getSize(), scroll = this.doc.getScroll();
		this.size = Object.append((this.isLoading) ? this.options.sizeLoading : this.options.size, size);

		var parentSize = self.getSize();
		if (this.size.x == parentSize.x) {
			
			this.size.y = this.size.y - 50;
			this.size.x = this.size.x - 20;
			
		}

		var to = {
				
				width: this.size.x,
				height: this.size.y,
				left: (scroll.x + (box.x - this.size.x - this.options.marginInner.x) / 2).toInt(),
				top: (scroll.y + (box.y - this.size.y - this.options.marginInner.y) / 2).toInt()
				
		};
		
		if(this.options.elasticY&&(this.options.handler=='append'||this.options.handler=='adopt')){
			//adjust 'to' in case there is no room.
			var pad=300;
			if(to.height>box.y-pad){
				var newHeight=box.y-pad;
				var diff=to.height-newHeight;
				to.height=newHeight;
				to.top+=(diff/2);
			}
			
		}

		to=me.checkAnchor(to);
		this.hideContent();
		if (!instantly) {
			this.fx.win.start(to).chain(this.showContent.bind(this));
		} else {
			this.win.setStyles(to);
			this.showTimer = this.showContent.delay(50, this);
		}
		setTimeout(this.reposition.bind(this),0);
		return this;
	},
	
	checkAnchor:function(to){
		
		var me=this;
		if(me.anchor){
			//console.debug(['anchor',me.anchor]);
		}
		return to;

	},
	
	toggleListeners: function(state) {
		var fn = (state) ? 'addEvent' : 'removeEvent';
		this.closeBtn[fn]('click', this.bound.close);
		this.overlay[fn]('click', this.bound.close);
		this.doc[fn]('keydown', this.bound.key)[fn]('mousewheel', this.bound.scroll);
		this.doc.getWindow()[fn]('resize', this.bound.window)[fn]('scroll', this.bound.window);
	},

	toggleLoading: function(state) {
		this.isLoading = state;
		this.win[(state) ? 'addClass' : 'removeClass']('pb-ld');
		if (state) {
			this.win.setProperty('aria-busy', state);
			this.fireEvent('onLoading', [this.win]);
		}
	},

	toggleOverlay: function(state) {
		if (this.options.overlay) {
			var full = this.doc.getSize().x;
			this.overlay.set('aria-hidden', (state) ? 'false' : 'true');
			this.doc.body[(state) ? 'addClass' : 'removeClass']('body-overlayed');
			if (state) {
				this.scrollOffset = this.doc.getWindow().getSize().x - full;
			} else {
				this.doc.body.setStyle('margin-right', '');
			}
		}
	},

	showContent: function() {
		if (this.content.get('opacity')) this.fireEvent('onShow', [this.win]);
		this.fx.content.start(1);
	},

	hideContent: function() {
		if (!this.content.get('opacity')) this.fireEvent('onHide', [this.win]);
		this.fx.content.cancel().set(0);
	},

	onKey: function(e) {
		switch (e.key) {
		case 'esc': this.close(e);
		case 'up': case 'down': return false;
		}
	},

	checkTarget: function(e) {
		return e.target !== this.content && this.content.contains(e.target);
	},
	
	shake:function(options){
		var me=this;
		var shake=new Fx.Morph(this.win, Object.append({
			onStart: Events.prototype.clearChain,
			unit: 'px',
			duration: 70,
			transition: Fx.Transitions.Quint.easeOut,
			link: 'cancel',
			unit: 'px'
		},options));
		var to=[{left:me.win.getPosition().x+20},{left:me.win.getPosition().x-20},{left:me.win.getPosition().x}];
		shake.start(to[0]).chain(function(){shake.start(to[1]);}).chain(function(){shake.start(to[0]);}).chain(function(){shake.start(to[1]);}).chain(function(){shake.start(to[2]);});
		
	},
	
	addStyle:function(style){
		
		var me=this;
		var styles=['left-sidebar']; //list of known styles
		if(styles.indexOf(style)>=0){
			me.win.addClass(style);
		}
	},
	removeStyles:function(){
		var me=this;
		Array.each(['left-sidebar'], me.removeStyle.bind(me));
	},
	removeStyle:function(style){
		
		var me=this;
		var styles=['left-sidebar']; //list of known styles
		if(styles.indexOf(style)>=0){
			me.win.removeClass(style);
		}
		
	},
	
	reposition: function() {
		var size = this.doc.getSize(), scroll = this.doc.getScroll(), ssize = this.doc.getScrollSize();
		var over = this.overlay.getStyles('height', 'width');
		var j = parseInt(over.height);
		var k = parseInt(over.width);
		if ((ssize.y > j && size.y >= j)||(ssize.x > k && size.x >= k)) {
			//resizes the shadow.
			this.overlay.setStyles({
				width: ssize.x + 'px',
				height: ssize.y + 'px'
			});
		}


		if(this.options.elasticY&&(this.options.handler=='append'||this.options.handler=='adopt')){

			//elasticity: allows element to scale its content 

			var pad=300;
			var l=this.win.offsetHeight;
			if((l+pad) > size.y&&l>=200){
				//squeeze y
				this.win.setStyles({
					height:(size.y-pad)+"px"
				});
			}else if(l>0&&(l+pad) < size.y&&l<this.options.size.y){
				this.win.setStyles({

					height:this.options.size.y+"px"
				});


			}else if(l==0&&(this.options.size.y+pad)>size.y&&this.options.size.y>200){
				this.win.setStyles({
					top:(pad/2)+"px",
					height:(size.y-pad)+"px"
				});
			}
		}
		if(this.win.offsetWidth&&this.win.offsetHeight){
			//recenters the box element
			this.win.setStyles({
				left: (scroll.x + (size.x - this.win.offsetWidth) / 2 - this.scrollOffset).toInt() + 'px',
				top: (scroll.y + (size.y - this.win.offsetHeight) / 2).toInt() + 'px'
			});
		}




		return this.fireEvent('onMove', [this.overlay, this.win]);
	},
	
	parsers:{

		image: function(preset) {
			return (preset || (/\.(?:jpg|png|gif)$/i).test(this.url)) ? this.url : false;
		},

		clone: function(preset) {
			if (document.id(this.options.target)) return document.id(this.options.target);
			if (this.element && !this.element.parentNode) return this.element;
			var bits = this.url.match(/#([\w-]+)$/);
			return (bits) ? document.id(bits[1]) : (preset ? this.element : false);
		},

		ajax: function(preset) {
			return (preset || (this.url && !(/^(?:javascript|#)/i).test(this.url))) ? this.url : false;
		},

		iframe: function(preset) {
			return (preset || this.url) ? this.url : false;
		},

		string: function(preset) {
			return true;
		},
		url:function(preset){
			return this.parsers.ajax.bind(this)(preset);
		},
		adopt:function(preset){
			this.parsers.clone.bind(this)(preset);
		},
		append:function(el){
			return el;
		}
	},
	handlers:{

		image: function(url) {
			
			var size, tmp = new Image();
			
			//TODO: set default size.
			
			this.asset = null;
			tmp.onload = tmp.onabort = tmp.onerror = (function() {
				tmp.onload = tmp.onabort = tmp.onerror = null;
				if (!tmp.width) {
					this._onError.delay(10, this);
					return;
				}
				var box = this.doc.getSize();
				box.x -= this.options.marginImage.x;
				box.y -= this.options.marginImage.y;
				size = {x: tmp.width, y: tmp.height};
				for (var i = 2; i--;) {
					if (size.x > box.x) {
						size.y *= box.x / size.x;
						size.x = box.x;
					} else if (size.y > box.y) {
						size.x *= box.y / size.y;
						size.y = box.y;
					}
				}
				size.x = size.x.toInt();
				size.y = size.y.toInt();
				this.asset = document.id(tmp);
				tmp = null;
				this.asset.width = size.x;
				this.asset.height = size.y;
				this._applyContent(this.asset, size);
				if(this.options.images!=null&&this.options.images.length>1){
					this._addImageControls();
					
				}
			}).bind(this);
			tmp.src = url;
			if (tmp && tmp.onload && tmp.complete) tmp.onload();
			return (this.asset) ? [this.asset, size] : null;
		},

		clone: function(el) {
			if (el) return el.clone();
			return this._onError();
		},

		adopt: function(el) {
			if (el) return el;
			return this._onError();
		},

		ajax: function(url) {
			var options = this.options.ajaxOptions || {};
			this.asset = new Request.HTML(Object.append({
				method: 'get',
				evalScripts: false
			}, this.options.ajaxOptions)).addEvents({
				onSuccess: function(resp) {
					this._applyContent(resp);
					if (options.evalScripts !== null && !options.evalScripts) Browser.exec(this.asset.response.javascript);
					this.fireEvent('onAjax', [resp, this.asset]);
					this.asset = null;
				}.bind(this),
				onFailure: this._onError.bind(this)
			});
			this.asset.send.delay(10, this.asset, [{url: url}]);
		},

		iframe: function(url) {
			this.asset = new Element('iframe', Object.append({
				src: url,
				frameBorder: 0,
				width: this.options.size.x,
				height: this.options.size.y
			}, this.options.iframeOptions));
			if (this.options.iframePreload) {
				this.asset.addEvent('load', function() {
					this._applyContent(this.asset.setStyle('display', ''));
				}.bind(this));
				this.asset.setStyle('display', 'none').inject(this.content);
				return false;
			}
			return this.asset;
		},

		string: function(str) {
			return str;
		},
		url:function(url){
			return this.handlers.ajax.bind(this)(url);
		},
		append:function(el){
			return el;
		}
	}

});

PushBox.PushBoxStack=[];
/**
 * 
 * @param windowOrPbox
 * @returns Window returns the window from which this PushBox was opened from. in most situations there is one open pushbox above a root window. 
 * the root window is considered the opener in this case however, if there are two or more open PushBox windows, then the opener for the top window would 
 * be the second to top window. usually a PushBox opens an iframe, so to share data it is often neccesary to initiate communication between the two windows.
 * 
 * there are some special cases: if the opener Pushbox displays javascript content (not an iframe) then the opener window will is the same window as the openers opener 
 * window and so on. the root window does not have an opener. and is never in a PushBox, although each window that supports opening more PushBox windows, has a global 
 * PushBoxWindow that is declared although not technically open
 */
PushBox.GetOpenerWindow=function(windowOrPbox){

	var stack=PushBox.GetPushBoxStack();
	if(windowOrPbox==null)windowOrPbox=window;
	var found=null;
	var below=[];
	Array.each(stack,function(pb){
		if(!found){
			if((pb.asset&&pb.asset.contentWindow==windowOrPbox)||pb==windowOrPbox){
				found=pb.window;
			}else{
				below.push(pb);
			}
		}
	});
	if(below.length){
		var opener=below[below.length-1];
		if(opener.asset&&opener.asset.contentWindow)return opener.asset.contentWindow;
	}
	return found;
};



/**
 * 
 * @param windowOrPbox
 * @returns Window returns the pushbox from which this PushBox was opened from (this pushbox, being windowOrPbox if a pushbox is passed or the 
 * pushbox currently displaying windowOrbox).
 */
PushBox.GetOpenerPushBox=function(windowOrPbox){
	var stack=PushBox.GetPushBoxStack();
	if(windowOrPbox==null)windowOrPbox=window;
	var found=false;
	var below=[];

	Array.each(stack,function(pb){
		if(!found){
			if((pb.asset&&pb.asset.contentWindow==windowOrPbox)||pb==windowOrPbox){
				found=pb;
			}else{
				below.push(pb);
			}
		}
	});
	var opener=false;
	if(below.length&&below[below.length-1].asset) opener=below[below.length-1];
	
	return opener;
};
/**
 * 
 * @param windowOrPbox
 * @returns Window returns the pushbox which is currently displaying the window. this is usefull for altering display settings or resizing contents own window.
 * pushbox currently displaying windowOrbox).
 */
PushBox.GetCurrentPushBox=function(theWindow){
	
	var stack=PushBox.GetPushBoxStack();
	if(theWindow==null)theWindow=window;

	for(var i=0;i<stack.length;i++){
		var pushbox=null;
		if((pushbox=(function(pb){
			
			if((pb.asset&&pb.asset.contentWindow==theWindow)||pb==theWindow){
				return pb;
			}
			return false;
			
		})(stack[i])))return pushbox;
			
		}

	
	return null;
};

PushBox.AddToStack=function(pushBox){
	PushBox.GetPushBoxStack().push(pushBox);
};
PushBox.RemoveFromStack=function(pushBox){
	(window.parent.PushBox&&window.parent.PushBox!=PushBox)?window.parent.PushBox.RemoveFromStack(pushBox):PushBox.PushBoxStack.splice(PushBox.IndexOfPushBox(pushBox),1);
};
PushBox.PushBoxAtIndex=function(index){
	return (window.parent.PushBox&&window.parent.PushBox!=PushBox)?window.parent.PushBox.PushBoxAtIndex(index):PushBox.PushBoxStack[index];
};
PushBox.IndexOfPushBox=function(pushBox){
	return (window.parent.PushBox&&window.parent.PushBox!=PushBox)?window.parent.PushBox.IndexOfPushBox(pushBox):PushBox.PushBoxStack.indexOf(pushBox);
};
PushBox.GetPushBoxStack=function(){	
	return (window.parent.PushBox&&window.parent.PushBox!=PushBox)?window.parent.PushBox.GetPushBoxStack():PushBox.PushBoxStack;
};

PushBox.GetPushBoxesAbove=function(windowOrPbox){

	var stack=PushBox.GetPushBoxStack();
	//window.parent.console.debug(stack);
	var found=false;
	var above=[];
	Array.each(stack,function(pb){
		if(!found){
			if((pb.asset&&pb.asset.contentWindow==windowOrPbox)||pb==windowOrPbox)found=pb;
			//if windowOrPbox is actually the static Pushbox asigned to this widow, then it is not actually in the list so compare its window 
			if(windowOrPbox==window.PushBoxWindow&&pb.asset&&windowOrPbox.asset&&windowOrPbox.asset.contentWindow==pb.asset.contentWindow)found=pb;
		}else{
			above.push(pb);
		}
	});
	
	//if(above.length==0&&found==false)return stack; 
	//window.parent.console.debug(found); 
	return above;

};


window.addEvent("domready",function(){
	if(!window.PushBoxWindow){
		window.PushBoxWindow=new PushBox();
		PushBox.RemoveFromStack(window.PushBoxWindow);
		PushBox.PushBoxStack=[];
	}
});
