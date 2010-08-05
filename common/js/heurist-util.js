/* heurist-util.js
 * Copyright 2006, 2007 Tom Murtagh and Kim Jackson
 * http://heuristscholar.org/
 *
 * Useful functions/vars for Heurist pages -- autosizing, popups, drag/drop wrappers etc
 * These are not in heurist.js because they can be loaded asynchronously -- only post-load
 * stuff should be put in here.
 * Included automatically by heurist.js
 * functions are installed as  top.HEURIST.util.*
 */

/*
This file is part of Heurist.

Heurist is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

Heurist is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/



if (! top.HEURIST.util) top.HEURIST.util = {
	setVersion: function() {
		var e = document.getElementById("version");
		if (e) {
			e.innerHTML = top.HEURIST.VERSION;
		}
	},

	setInstanceName: function() {
		var e = document.getElementById("instance-name");
		if (e) {
			e.innerHTML = top.HEURIST.instance.name;
		}
	},

	/* see README.style for comments on the autosize functions */

	autosizeElement: function(elt) {
		/* Set the size of the given element to that of its parent
		 *
		 * Opera has a special braindeadness: the parent can't be relied upon to expand
		 * to its parent's size, so we have to go directly to the grandparent
		 */

		var width = (elt.parentNode.offsetWidth > 0)? elt.parentNode.offsetWidth : (elt.parentNode.parentNode.offsetWidth - 10);
		var height = (elt.parentNode.offsetHeight > 0)? elt.parentNode.offsetHeight : (elt.parentNode.parentNode.offsetHeight - 10);

		elt.style.width = width + "px";
		elt.style.minWidth = width + "px";	// firefox occasionally ignores the width/height setting!
		elt.style.height = height + "px";
		elt.style.minHeight = height + "px";
	},

	autosizeContainer2: function(elt, cont, flag ) {
  /*      Set the size of the given container to that of its contained element with flags for height only or width only
          */
        var width = (elt.scrollWidth > 0) ? elt.parentNode.offsetWidth :  (elt.parentNode.parentNode.offsetWidth - 10);
        var height = (elt.parentNode.offsetHeight > 0) ? elt.parentNode.offsetHeight : (elt.parentNode.parentNode.offsetHeight - 10);
        if (!flag) flag = "both";
        switch (flag){
            case "height":
                cont.style.height = height + "px";
                cont.style.minHeight = height + "px";
                break;
            case  "width":
                cont.style.width = width + "px";
                cont.style.minWidth = width + "px";    // firefox occasionally ignores the width/height setting!
                break;
            case "both":
            default:
                cont.style.width = width + "px";
                cont.style.minWidth = width + "px";    // firefox occasionally ignores the width/height setting!
                cont.style.height = height + "px";
                cont.style.minHeight = height + "px";
        }
     },

    autosizeAllElements: function(e) {
		// get the document from the event
		var targ = null;
		if (! e) e = window.event;
		if (e) {
			if (e.target) targ = e.target;
			else if (e.srcElement) targ = e.srcElement;
			if (targ  &&  targ.nodeType != 9) {
				targ = null;
			}
		}
		if (! targ) targ = top.document;

		/* automatically resize all DIV elements marked with classname "autosize" */
		var allDivs = targ.getElementsByTagName("div");
		var re = new RegExp("(?:^|\\s+)autosize(?:\\s+|$)");
		for (var i = 0; i < allDivs.length; ++i) {
			if (re.test(allDivs[i].className)) {
				top.HEURIST.util.autosizeElement.call(this, allDivs[i]);
			}
		}
	},

	popups: { list: [] },
	popupWindow: function(parentWindow, options) {
		/* Make a new Heurist-managed popup window.
		 *  parentWindow is the frame that the window should think opened it,
		 *  options is an object, you may supply:
		 *   url:        "url"   ... open an iframe in the popup window
		 *   element: ID or element ... a DOM element or element ID to be displayed in the popup
		 *
		 *   callback:   function() { }   ... a function to call when the popup is closed
		 *   "no-close": true        ... do not present a close button to the user
		 *   "no-resize": true       ... do not allow the user to resize the window
		 *   "no-titlebar": true     ... hide the titlebar entirely
		 *   "close-on-blur": true   ... close the window if the user clicks outside it
		 *   width / height          ... pixel sizes for the width and height of the window
		 *   x / y                   ... pixel positions left and top for the window (resp. right and bottom if they are negative)
		 */

		if (! options) options = {};

		var url = options["url"]? options["url"] : "popup";
		var newHeuristID = top.HEURIST.createHeuristWindowID(url);
		var newPopup = {
			"id": newHeuristID,
			"opener": parentWindow,
			"closeCallback": options["callback"],
			"visible": false
		};

		top.HEURIST.util.popups[newHeuristID] = newPopup;
		top.HEURIST.util.popups.list.push(newPopup);

		newPopup.closeOnBlur = options["close-on-blur"]? true: false;
		top.HEURIST.util.startLoadingPopup();

		var positionDiv = newPopup.positionDiv = top.document.createElement("div");
			positionDiv.className = "popup";
			positionDiv.expando = true;
		var newTable = newPopup.table = positionDiv.appendChild(top.document.createElement("table"));
			newTable.className = "popup";
			newTable.cellSpacing = 0;	// IE6 doesn't know about border-spacing
		    newTable.appendChild(top.document.createElement("tbody"));
		    newTable.lastChild.appendChild(top.document.createElement("tr"));
		var titleCell = newPopup.titleCell = newTable.lastChild.lastChild.appendChild(top.document.createElement("td"));
			titleCell.className = "header";
		    newTable.lastChild.appendChild(top.document.createElement("tr"));
		if (! options["no-close"]) {
			var closeDiv = titleCell.appendChild(top.document.createElement("div"));
				closeDiv.className = "close-button";
				closeDiv.id = "close";
				closeDiv.title = "Close this window";
		}
		if (! options["no-help"]) {
			var helpDiv = titleCell.appendChild(top.document.createElement("div"));
				helpDiv.className = "help-button";
				helpDiv.id = "help";
				helpDiv.innerHTML = "<span>Help is " + ((top.HEURIST.util.getDisplayPreference("help") === "hide")? "off" : "on") + "</span>";
		}
		if (options["title"]) {
			titleCell.appendChild(top.document.createTextNode(options["title"]));
		}

		var bodyCell = newPopup.bodyCell = newTable.lastChild.lastChild.appendChild(top.document.createElement("td"));

		// Put the content-iframe as 100%x100% inside a DIV; we then resize the DIV.
		if (! options["no-resize"]) {
			// This way we can make the iframe display=none while dragging
			var resizeDiv = positionDiv.appendChild(top.document.createElement("div"));
				resizeDiv.className = "resize-handle";
		} else {
			positionDiv.style.backgroundImage = 'none';	// get rid of resize handle indicator
		}

		var sizeDiv = newPopup.sizeDiv = bodyCell.appendChild(top.document.createElement("div"));
			sizeDiv.className = "size-div";

		var width = null, height = null;
		if (options["url"]) {
			titleCell.appendChild(top.document.createTextNode("Loading ..."));

			var newIframe = newPopup.iframe = top.document.createElement("iframe");
				newIframe.HEURIST_WINDOW_ID = newHeuristID;
				newIframe.frameBorder = 0;
				//newIframe.style.display = "none";
				newIframe.style.visibility = "hidden";
				newIframe.close = function() {
					var newArgs = [ newIframe.HEURIST_WINDOW_ID ];
					for (var i=0; i < arguments.length; ++i) {
						newArgs.push(arguments[i]);
					}
					top.HEURIST.util.closePopup.apply(this, newArgs);
				};

				if (options["width"]) { sizeDiv.style.width = options["width"] + "px"; width = parseInt(options["width"]); }
				if (options["height"]) { sizeDiv.style.height = options["height"] + "px"; height = parseInt(options["height"]); }

				var oneTimeOnload = function() {
					// One time onload to set the position and possibly the width and height of the bodyCell
					try {
						if (! width  &&  newIframe.contentWindow.document.body.getAttribute("width")) {
							sizeDiv.style.width = newIframe.contentWindow.document.body.getAttribute("width")+"px";
							sizeDiv.style.minWidth = newIframe.contentWindow.document.body.getAttribute("minwidth")+"px";
							width = parseInt(sizeDiv.style.width);
						}
					} catch (e) { }
					if (! width  &&  sizeDiv.offsetWidth) {
						width = sizeDiv.offsetWidth;
						sizeDiv.style.width = width + "px";
					}

					try {
						if (! height  &&  newIframe.contentWindow.document.body.getAttribute("height")) {
							sizeDiv.style.height = newIframe.contentWindow.document.body.getAttribute("height")+"px";
							sizeDiv.style.minHeight = newIframe.contentWindow.document.body.getAttribute("minheight")+"px";
							height = parseInt(sizeDiv.style.height);
						}
					} catch (e) { }
					if (! height  &&  sizeDiv.offsetHeight) {
						height = sizeDiv.offsetHeight;
						sizeDiv.style.height = height + "px";
					}

					var topWindowDims = top.HEURIST.util.innerDimensions(top);
					if (options["x"] < 0) options["x"] = topWindowDims.w - width + parseInt(options["x"]);
					if (options["y"] < 0) options["y"] = topWindowDims.h - height + parseInt(options["y"]);

					positionDiv.style.zIndex = parseInt(top.HEURIST.util.coverall.style.zIndex) + 1;

					var xy = top.HEURIST.util.suggestedPopupPlacement(width, height);
					positionDiv.style.left = (options["x"]? options["x"] : xy.x) + "px";
					positionDiv.style.top = (options["y"]? options["y"] : xy.y) + "px";
					positionDiv.style.visibility = "visible";

					top.HEURIST.util.finishLoadingPopup();

					//newIframe.style.display = "block";
					newIframe.style.visibility = "visible";
					newPopup.visible = true;

					top.HEURIST.fireEvent(newIframe, "heurist-finished-loading-popup");

					top.HEURIST.deregisterEvent(newIframe, "load", oneTimeOnload);
				};
				top.HEURIST.registerEvent(newIframe, "load", oneTimeOnload);
				top.HEURIST.registerEvent(newIframe, "load", function() {
					// Multi-shot onload -- when(ever) document loads, set the title bar
					try {
						titleCell.replaceChild(top.document.createTextNode(newIframe.contentWindow.document.title), titleCell.lastChild);
						newIframe.contentWindow.close = newIframe.close;	// make window.close() do what we expect
						newIframe.contentWindow.popupOpener = parentWindow;	// make a persistent reference to the popup opener
						newIframe.contentWindow.HEURIST_WINDOW_ID = newHeuristID;
					} catch (e) { }	// might get cross-domain woes
				});

			newPopup.element = newIframe;
			newIframe.src = url;

			if (! options["no-close"]) {
				top.HEURIST.registerEvent(closeDiv, "click", function() { newIframe.close(); });
			}
			if (! options["no-help"]) {
				var u = top.HEURIST.util;
				var alts = { "hide": "Click here to show help text", "show": "Click here to hide help text" };

				helpDiv.title = alts[u.getDisplayPreference("help")];
				top.HEURIST.registerEvent(helpDiv, "click", function() { top.HEURIST.util.helpToggler(helpDiv); });
			}

			sizeDiv.expando = true;
			sizeDiv.iframe = newIframe;
			positionDiv.expando = true;
			positionDiv.iframe = newIframe;

		} else if (options['element']) {
			var element;
			if (options['element'].substring) {	// element ID, not an element
				element = parentWindow.document.getElementById(options['element']);
			} else {
				element = options['element'];
			}
			// get the element out of its current parent (if it has one)
			if (! options["auto-position"]  &&  element.parentNode) {
				newPopup.originalParentNode = element.parentNode;
				element.parentNode.removeChild(element);
			}

			if (! options["width"]) {
				if (element.offsetWidth) options["width"] = element.offsetWidth;
				else if (element.style.width) options["width"] = parseInt(element.style.width);
				else options["width"] = 300;
			}
			if (! options["height"]) {
				if (element.offsetHeight) options["height"] = element.offsetHeight;
				else if (element.style.height) options["height"] = parseInt(element.style.height);
				else options["height"] = 200;
			}

			if (options["width"]) { sizeDiv.style.width = options["width"] + "px"; width = parseInt(options["width"]); }
			if (options["height"]) { sizeDiv.style.height = options["height"] + "px"; height = parseInt(options["height"]); }

			if (! options["auto-position"]) {
				var topWindowDims = top.HEURIST.util.innerDimensions(top);
				if (options["x"] < 0) options["x"] = topWindowDims.w - width + parseInt(options["x"]);
				if (options["y"] < 0) options["y"] = topWindowDims.h - height + parseInt(options["y"]);

				var xy = top.HEURIST.util.suggestedPopupPlacement(width, height);
				positionDiv.style.left = (options["x"]? options["x"] : xy.x) + "px";
				positionDiv.style.top = (options["y"]? options["y"] : xy.y) + "px";
			}
			positionDiv.style.visibility = "visible";

			top.HEURIST.util.finishLoadingPopup();
			positionDiv.style.zIndex = parseInt(top.HEURIST.util.coverall.style.zIndex) + 1;

			newPopup.visible = true;

			newPopup.element = element;
			element.style.display = "block";

			if (! options["no-close"]) {
				top.HEURIST.registerEvent(closeDiv, "click", function() { top.HEURIST.util.closePopup(newHeuristID); });
			}

			if (! options["title"]) titleCell.appendChild(top.document.createTextNode("Heurist"));
		}
		if (options["min-width"]) sizeDiv.style.minWidth = parseInt(options["min-width"]);
		if (options["min-height"]) sizeDiv.style.minHeight = parseInt(options["min-height"]);


		if (! options["no-resize"]) {
			top.HEURIST.registerEvent(resizeDiv, "mousedown", function(e) { top.HEURIST.util.startResize(e, sizeDiv); return false; });
		}
		if (options["no-titlebar"]) {
			// remember to hide the TR containing the titlecell, not just the TD
			titleCell.parentNode.style.display = "none";
		}
		if (options["close-on-blur"]) {
			// make a click handler on the coverall to close this window
			top.HEURIST.registerEvent(top.HEURIST.util.coverallDiv, "click",
							function() { top.HEURIST.util.closePopup(newHeuristID); });
		}

		top.HEURIST.registerEvent(titleCell, "mousedown", function(e) {
			if (e && e.target && e.target.id == "close") return;
			top.HEURIST.util.startMove(e, positionDiv);
		});

		if (! options["auto-position"]) {
			top.document.body.appendChild(positionDiv);
		} else {
			// insert the popup where the element was originally
			newPopup.originalParentNode = element.parentNode;
			element.parentNode.replaceChild(positionDiv, element);
		}

		newPopup.originalElementStyleWidth = newPopup.element.style.width;
		newPopup.originalElementStyleHeight = newPopup.element.style.height;
		newPopup.element.style.width = "100%";
		newPopup.element.style.height = "100%";
		sizeDiv.appendChild(newPopup.element);

		return newPopup;
	},

	popupURL: function(parentWindow, url, options) {
		// Convenience wrapper around popupWindow

		if (! options) options = { "url": url };
		else options["url"] = url;

		return top.HEURIST.util.popupWindow(parentWindow, options);
	},

	popupElement: function(parentWindow, element, options) {
		// Convenience wrapper around popupWindow

		if (! options) options = { element: element };
		else options["element"] = element;

		return top.HEURIST.util.popupWindow(parentWindow, options);
	},

	popupTinyElement: function(parentWindow, element, options) {
		// Convenience wrapper around popupWindow, with no chrome, resizing, and close-on-blur

		if (! options) options = { element: element };
		else options["element"] = element;

		if (options["no-titlebar"] === undefined) options["no-titlebar"] = true;
		if (options["close-on-blur"] === undefined) options["close-on-blur"] = true;
		if (options["no-resize"] === undefined) options["no-resize"] = true;

		return top.HEURIST.util.popupWindow(parentWindow, options);
	},


	coverall: null,
	coverallDiv: null,
	bringCoverallToFront: function(invisible) {
		// bring the coverall to the front (if it exists)
		if (! top.HEURIST.util.coverall) {
			// Coverall is actually an IFRAME -- otherwise system-window elements such as dropdowns peek through
			var coverall = top.HEURIST.util.coverall = top.document.createElement('iframe');
			coverall.id = "coverall";
			coverall.frameBorder = 0;
			coverall.style.visibility = "hidden";
			coverall.style.zIndex = 100000;
			top.document.body.appendChild(coverall);

			// There is also a DIV on top of the IFRAME, so that we can display messages (can't write on an iframe)
			var coverallDiv = top.HEURIST.util.coverallDiv = top.document.createElement('div');
			coverallDiv.className = "coverall-div";
			coverallDiv.style.visibility = "hidden";
			coverallDiv.style.zIndex = coverall.style.zIndex;
			top.document.body.appendChild(coverallDiv);
		}

		var coverall = top.HEURIST.util.coverall;
		var popupCount = top.HEURIST.util.popups.list.length;
		coverall.style.zIndex = 100000 + ((popupCount - 1) * 2);

		if (invisible  ||  (popupCount == 1  &&  top.HEURIST.util.popups.list[0].closeOnBlur)) {
			// if it's a single level of popups, and that one is marked to close on blur,
			// then don't display an opaque coverall
			coverall.className = "invisible";
		} else {
			coverall.className = "";
		}

		coverall.style.visibility = "visible";
		top.HEURIST.util.coverallDiv.style.visibility = "visible";

		// register an ESCAPE key handler on the document
		top.document.onkeypress = top.HEURIST.util.coverallEscapeHandler;
	},
	sendCoverallToBack: function() {
		top.HEURIST.util.coverallDiv.style.visibility = "hidden";
		top.HEURIST.util.coverall.style.visibility = "hidden";
		top.document.onkeypress = null;
	},

	coverallEscapeHandler: function(e) {
		if (! e) e = window.event;
		if (! (e.keyCode == 27  ||  e.which == 27)) {	// not the escape key
			return true;
		}

		// if there is a popup loading, stop that.
		// Otherwise, if there is a popup open, [try to] close it.
		var popupsList = top.HEURIST.util.popups.list;
		if (popupsList.length > 0) {
			top.HEURIST.util.closePopup(popupsList[popupsList.length-1].id);

			e.cancelBubble = true;
			if (e.stopPropagation) e.stopPropagation();
			return false;
		}
		return true;
	},

	startLoadingPopup: function() {
		top.HEURIST.util.bringCoverallToFront();
		top.HEURIST.util.coverallDiv.style.cursor = "wait";
		top.HEURIST.util.coverallDiv.style.backgroundImage = "";
		//top.HEURIST.util.coverallDiv.style.backgroundPosition = "";
	},

	finishLoadingPopup: function() {
		top.HEURIST.util.coverallDiv.style.backgroundImage = "none";	// get rid of "loading" animation
/*
		top.HEURIST.util.coverallDiv.style.backgroundPosition = "-100px -100px";	// get rid of "loading" animation
*/
			// changing the backgroundImage appears to intermittently crash Firefox 2.0.0.6 on Windows

		top.HEURIST.util.coverallDiv.style.cursor = "default";
	},

	suggestedPopupPlacement: function(width, height) {
		var POPUP_OFFSET = 15;

		var prevX, prevY, prevChromeW, prevChromeH;
		var previousPopup;
		if (top.HEURIST.util.popups.list.length > 1) {
			// look for the previous visible popup
			for (var i=top.HEURIST.util.popups.list.length-1; i >= 0; --i) {
				if (top.HEURIST.util.popups.list[i].visible) {
					previousPopup = top.HEURIST.util.popups.list[i];
					break;
				}
			}
		}
		if (previousPopup) {
			prevX = parseInt(previousPopup.positionDiv.style.left);	if (prevX < 0) prevX = -1;
			prevY = parseInt(previousPopup.positionDiv.style.top);	if (prevY < 0) prevY = -1;
			prevChromeW = previousPopup.table.offsetWidth - previousPopup.sizeDiv.offsetWidth;
			prevChromeH = previousPopup.table.offsetHeight - previousPopup.sizeDiv.offsetHeight;
		} else {
			prevX = -1;
			prevY = -1;
			prevChromeW = 6;	// 6px of handles
			prevChromeH = 25;	// titlebar plus handles ... give or take
		}

		// default popup width and height are 300px x 200px
		if (! width) width = 300;
		if (! height) height = 200;

		var topWindowDims = top.HEURIST.util.innerDimensions(top);

		if ((prevX + POPUP_OFFSET + prevChromeW + width) > topWindowDims.w) {
			// width would go offscreen ... don't do that
			prevX = -1;
		}
		if ((prevY + POPUP_OFFSET + prevChromeH + height) > topWindowDims.h) {
			// height would go offscreen ... don't do that
			prevY = -1;
		}

		var x, y;
		x = Math.max(0, Math.round((topWindowDims.w - (width + prevChromeW)) / 2));
		y = Math.max(0, Math.round((topWindowDims.h - (height + prevChromeH)) / 2));

		if (prevX >= 0  &&  Math.abs(x - prevX) < POPUP_OFFSET)
			x = prevX + POPUP_OFFSET;
		if (prevY >= 0  &&  Math.abs(y - prevY) < POPUP_OFFSET)
			y = prevY + POPUP_OFFSET;

		return { x: x, y: y };
	},

	dragDetails: { dragging: false },
	startDrag: function(evt, updateCallback, endCallback) {
		if (! evt) evt = window.event;
		if (! evt.view) {
			evt.expando = true;
			evt.view = evt.srcElement.ownerDocument.parentWindow;
		}

		if (top.HEURIST.util.dragDetails.dragging  &&  top.HEURIST.util.dragDetails.endDrag) {
			top.HEURIST.util.dragDetails.endDrag(evt);
		}

		var dragCaptureElement = evt.view.document.createElement("div");
			dragCaptureElement.style.position = "absolute";
			dragCaptureElement.style.width = "100%";
			dragCaptureElement.style.height = "100%";
			dragCaptureElement.style.top = "0";
			dragCaptureElement.style.left = "0";
			dragCaptureElement.style.zIndex = 999999;
		evt.view.document.body.appendChild(dragCaptureElement);

		var dragDetails = {
			dragging: true,
			xy: top.HEURIST.util.getEventPosition(evt),

			updateCallback: updateCallback,
			endCallback: endCallback,

			dragCaptureElement: dragCaptureElement
		};


		top.HEURIST.registerEvent(evt.view.document, "mousemove", updateCallback);
		top.HEURIST.registerEvent(evt.view.document, "mouseup", top.HEURIST.util.endDrag);

		top.HEURIST.util.dragDetails = dragDetails;

		evt.cancelBubble = true;
		if (evt.stopPropagation) evt.stopPropagation();

		return false;
	},

	endDrag: function(evt) {
		if (! evt) evt = window.event;
		if (! evt.view) {
			evt.expando = true;
			evt.view = evt.srcElement.ownerDocument.parentWindow;
		}

		if (top.HEURIST.util.dragDetails.endCallback) top.HEURIST.util.dragDetails.endCallback(evt);

		var dce = top.HEURIST.util.dragDetails.dragCaptureElement;
		dce.parentNode.removeChild(dce);

		top.HEURIST.deregisterEvent(evt.view.document, "mouseup", top.HEURIST.util.endDrag);
		top.HEURIST.deregisterEvent(evt.view.document, "mousemove", top.HEURIST.util.dragDetails.updateCallback);
		top.HEURIST.util.dragDetails = { dragging: false };

		evt.cancelBubble = true;
		if (evt.stopPropagation) evt.stopPropagation();

		return false;
	},

/* element resizing hooks for the drag framework */
	startResize: function(evt, element, reversed) {
		if (! evt) evt = window.event;
		if (! evt.view) {
			evt.expando = true;
			evt.view = evt.srcElement.ownerDocument.parentWindow;
		}

		if (element && element.substring) element = evt.view.document.getElementById(element);
		if (! element) return;


		if (element.iframe) {
			// iframes mess up dragging by capturing events themselves ... hide them while resizing
			element.iframe.style.display = "none";
		}

		top.HEURIST.util.startDrag(evt, top.HEURIST.util.dragResizer, top.HEURIST.util.endResize, element);

		top.HEURIST.util.dragDetails.element = element;
		top.HEURIST.util.dragDetails.wh = { w: parseInt(element.style.width), h: parseInt(element.style.height) };
		top.HEURIST.util.dragDetails.reversed = reversed? true : false;

		return false;
	},

	dragResizer: function(e) {
		if (! e) e = window.event;
		var newXY = top.HEURIST.util.getEventPosition(e);
		var resizeDetails = top.HEURIST.util.dragDetails;

		if (! resizeDetails.reversed) {
			var newWidth = (newXY.x - resizeDetails.xy.x) + resizeDetails.wh.w;
			var newHeight = (newXY.y - resizeDetails.xy.y) + resizeDetails.wh.h;
		}
		else {
			var newWidth = (resizeDetails.xy.x - newXY.x) + resizeDetails.wh.w;
			var newHeight = (resizeDetails.xy.y - newXY.y) + resizeDetails.wh.h;
		}

		// semi-sane minima
		var minWidth = parseInt(resizeDetails.element.style.minWidth);
		if (minWidth) { if (newWidth < minWidth) newWidth = minWidth; }
		else if (newWidth < 100) newWidth = 100;

		var minHeight = parseInt(resizeDetails.element.style.minHeight);
		if (minHeight) { if (newHeight < minHeight) newHeight = minHeight; }
		else if (newHeight < 50) newHeight = 50;

		resizeDetails.element.style.width = newWidth + "px";
		resizeDetails.element.style.height = newHeight + "px";

		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();

		return false;
	},

	endResize: function(e) {
		var resizeDetails = top.HEURIST.util.dragDetails;
		if (resizeDetails.element  &&  resizeDetails.element.iframe) {
			resizeDetails.element.iframe.style.display = "block";
		}

		if (resizeDetails.element.isScratchpad) {
			top.HEURIST.util.setDisplayPreference("scratchpad-width", parseInt(resizeDetails.element.style.width));
			top.HEURIST.util.setDisplayPreference("scratchpad-height", parseInt(resizeDetails.element.style.height));
		}
	},

/* element moving hooks for the drag framework */
	startMove: function(evt, element, reversed) {
		if (! evt) evt = window.event;
		if (! evt.view) {
			evt.expando = true;
			evt.view = evt.srcElement.ownerDocument.parentWindow;
		}

		if (element && element.substring) element = evt.view.document.getElementById(element);
		if (! element) return;

		if (element.iframe) {
			// iframes mess up dragging by capturing events themselves ... hide them while moving
			element.iframe.style.display = "none";
		}

		top.HEURIST.util.startDrag(evt, top.HEURIST.util.dragMover, top.HEURIST.util.endMove);

		top.HEURIST.util.dragDetails.element = element;
		if (! reversed) {
			if (element.style.right  &&  ! element.style.left) {	// allow right-offset position
				element.style.left = element.offsetLeft + 'px';
				element.style.right = '';
			}
			if (element.style.bottom  &&  ! element.style.top) {	// allow bottom-offset position
				element.style.top = element.offsetTop + 'px';
				element.style.bottom = '';
			}
			top.HEURIST.util.dragDetails.pos = { left: parseInt(element.style.left), top: parseInt(element.style.top) };
		}
		else {
			top.HEURIST.util.dragDetails.pos = { right: parseInt(element.style.right), bottom: parseInt(element.style.bottom) };
		}
		top.HEURIST.util.dragDetails.reversed = reversed? true : false;

		return false;
	},

	dragMover: function(e) {
		if (! e) e = window.event;
		var newXY = top.HEURIST.util.getEventPosition(e);
		var moveDetails = top.HEURIST.util.dragDetails;

		if (! moveDetails.reversed) {
			var newLeft = (newXY.x - moveDetails.xy.x) + moveDetails.pos.left;
			var newTop = (newXY.y - moveDetails.xy.y) + moveDetails.pos.top;

			moveDetails.element.style.left = newLeft + "px";
			moveDetails.element.style.top = newTop + "px";
		}
		else {
			var newRight = (moveDetails.xy.x - newXY.x) + moveDetails.pos.right;
			var newBottom = (moveDetails.xy.y - newXY.y) + moveDetails.pos.bottom;

			moveDetails.element.style.right = newRight + "px";
			moveDetails.element.style.bottom = newBottom + "px";
		}

		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();

		return false;
	},

	endMove: function(evt) {
		var moveDetails = top.HEURIST.util.dragDetails;
		if (moveDetails.element  &&  moveDetails.element.iframe) {
			moveDetails.element.iframe.style.display = "block";
		}

		if (moveDetails.element.isScratchpad) {
			top.HEURIST.util.setDisplayPreference("scratchpad-bottom", parseInt(moveDetails.element.style.bottom));
			top.HEURIST.util.setDisplayPreference("scratchpad-right", parseInt(moveDetails.element.style.right));
		}
	},

	closePopup: function(windowID) {
		// Close this popup window (or TRY to)
		// If there is a callback, and it returns falsey, then we shan't close.

		if (! windowID  ||  ! top.HEURIST.util.popups[windowID]) {
			return null;	// not one of ours ... what to do?
		}

		var popup = top.HEURIST.util.popups[windowID];
		if (popup.closeCallback) {
			// invoke the callback, using the window that opened the popup as "this", and any passed parameters
			var callbackParameters = [];
			for (var i=1; i < arguments.length; ++i) callbackParameters.push(arguments[i]);

			var rval = popup.closeCallback.apply(popup.opener, callbackParameters);
			if (! rval  &&  rval !== undefined) return false;	// whoopsy! the opener doesn't want you to close yet
		}

		// Remove the window and clean up
		//popup.positionDiv.style.visibility = "hidden";
			// TFM 2007-08-21 ... why was this visibility: hidden and not display: none?
			// the former leaves some artefacts (inner IFRAME still partially visible for a short while)
		popup.positionDiv.style.display = "none";
		popup.visible = false;

		var popups = top.HEURIST.util.popups;
		delete popups[windowID];

		if (popup === top.HEURIST.util.popups.list[top.HEURIST.util.popups.list.length-1]) {
			// Normal (only?) case ... the popup on top is closing

			popups.list.pop();

			if (popups.list.length > 0) {
				// Bring the next-highest window to the front
				top.HEURIST.util.coverall.style.zIndex = parseInt(popups.list[popups.list.length-1].positionDiv.style.zIndex) - 1;
			} else {
				// All popups are closed ... remove the coverall
				top.HEURIST.util.sendCoverallToBack();
			}

		}
		else {
			// Some background popup is closing ... just a bit of administratia

			for (var i=0; i < popups.list.length; ++i) {
				if (popup === popups.list[i]) {
					popups.list.splice(i, 1);	// remove one element from popups list
					break;
				}
			}
		}

		// if the popup element was originally in the document, then return it to its rightful parent
		if (popup.originalParentNode) {
			var element = popup.element.parentNode.removeChild(popup.element);
			element.style.display = "none";
			element.style.width = popup.originalElementStyleWidth;
			element.style.height = popup.originalElementStyleHeight;
// FIXME: element didn't necessarily belong at the end of the parent ... should have a placeholder or something
			popup.originalParentNode.appendChild(element);
		}


		// have to detach the actual deletion from this thread, otherwise the function may return to a non-existent window!
		setTimeout(function() { popup.positionDiv.parentNode.removeChild(popup.positionDiv); }, 0);

		return true;
	},

	parentWindow: function(win) {
		if (top.HEURIST.util.popups[win.HEURIST_WINDOW_ID])
			return top.HEURIST.util.popups[win.HEURIST_WINDOW_ID].opener;
		return null;
	},

	getEventPosition: function(evt) {
		// return the coordinates of the given event relative to the document
		var x = 0, y = 0;
		if (evt.pageX  ||  evt.pageY) {
			x = evt.pageX;
			y = evt.pageY;
		} else if (evt.clientX  ||  evt.clientY) {
			x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		return { x: x, y: y };
	},

	innerDimensions: function(win) {
		// return the inner dimensions of a window
		var w, h;

		if (win.innerHeight) {
			// all except IE
			w = win.innerWidth;
			h = win.innerHeight;
		} else if (win.document.documentElement  &&  win.document.documentElement.clientHeight) {
			// IE6 strict mode
			w = win.document.documentElement.clientWidth;
			h = win.document.documentElement.clientHeight;
		} else if (win.document.body) {
			// other IE
			w = win.document.body.clientWidth;
			h = win.document.body.clientHeight;
		}
		return { w: w, h: h };
	},


	setDisplayPreference: function(prefName, val, win, replacementRegExp) {
		// set display preference in all windows below win; save preferences too
		// The third and fourth arguments are for recursion: don't use them externally.

		if (! win) {
			// top-level stuff
			replacementRegExp = new RegExp('$');

			if (! top.HEURIST.displayPreferences) {	// hmm ... display-preferences.php didn't load
								// we can wing it for now
				top.HEURIST.displayPreferences = {};
			}
			if (top.HEURIST.displayPreferences[prefName]) {
				if (top.HEURIST.displayPreferences[prefName] == val) {
					return;	// we already have that value
				} else {
					replacementRegExp = new RegExp('(^|\\s+)'+ prefName + '-' + top.HEURIST.displayPreferences[prefName] + '(\\s+|$)|^$');
				}
			}
			top.HEURIST.displayPreferences[prefName] = val;
			top.HEURIST.loadScript(top.HEURIST.basePath+'common/php/display-preferences.php?' + encodeURIComponent(prefName) + '=' + encodeURIComponent(val));

			win = top;
		}
		if (! (val+"").match(/\s/)) {
            if (win.document.body.className.search(prefName)== -1){
                win.document.body.className = win.document.body.className + ' '+prefName+'-'+val+' ';
            }else{
			    win.document.body.className = win.document.body.className.replace(replacementRegExp, ' '+prefName+'-'+val+' ');
            }
		}

		for (var i=0; i < win.frames.length; ++i) {
			try {
				// some frames may be from another domain, e.g. addthis
				top.HEURIST.util.setDisplayPreference(prefName, val, win.frames[i], replacementRegExp);
			} catch (e) { }
		}
	},

	getDisplayPreference: function(prefName) {
		return top.HEURIST.displayPreferences[prefName];
	},

	// XMLHttpRequest stuff from www.quirksmode.org
	sendRequest: function(url,callback,postData) {
		if (! url.match(/^http:/)  &&  ! url.match(/^\//))
			url = top.HEURIST.basePath + url;

		var req = top.HEURIST.util.createXMLHTTPObject();
		if (!req) return;
		var method = (postData) ? "POST" : "GET";
		req.open(method,url,true);
		if (postData)
			req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		req.onreadystatechange = function () {
			if (req.readyState != 4) return;
			if (req.status != 200 && req.status != 304) {
				alert('HTTP error ' + req.status);
				return;
			}
			callback(req);
		}
		if (req.readyState == 4) return;
		req.send(postData);
	},

	XMLHttpFactories: [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	],

	createXMLHTTPObject: function() {
		var xmlhttp = false;
		for (var i=0;i<top.HEURIST.util.XMLHttpFactories.length;i++) {
			try {
				xmlhttp = top.HEURIST.util.XMLHttpFactories[i]();
			}
			catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	},

	xhrFormSubmit: function(form, callback) {
	// submit a form via XMLHttpRequest;
	// call the callback with the response text when it is done
		var postData = "";
		for (var i=0; i < form.elements.length; ++i) {
			var elt = form.elements[i];

			// skip over un-selected options
			if ((elt.type == "checkbox"  ||  elt.type == "radio")  &&  ! elt.checked) continue;

			// FIXME: deal with select-multiple at some stage   (perhaps we should use | to separate values)
			// place form data into a stream of name = value pairs
			if (elt.strTemporal && (elt.strTemporal.search(/\|VER/) != -1)) elt.value = elt.strTemporal;	// saw fix to capture simple date temporals.
			if (postData) postData += "&";
			postData += encodeURIComponent(elt.name) + "=" + encodeURIComponent(elt.value);
		}

		top.HEURIST.util.sendRequest((form.getAttribute && form.getAttribute("jsonAction")) || form.action, callback, postData);
	},

	evalJson: function() {
		// Note that we use a different regexp from RFC 4627 --
		// the only variables available now to malicious JSON are those made up of the characters "e" and "E".
		// EEEEEEEEEEEEEEEEEEeeeeeeeeeeeeeeeeeEEEEEEEEEEEEEEEEEEEeEEEEEEEEEE
		var re1 = /"(\\.|[^"\\])*"|true|false|null/g;
		var re2 = /[^,:{}\[\]0-9.\-+Ee \n\r\t]/;
		return function(testString) {
			return ! re2.test(testString.replace(re1, " "))  &&  eval("(" + testString + ")");
		};
	}(),

	getJsonData: function(url, callback, postData) {
		top.HEURIST.util.sendRequest(url, function(xhr) {
			var obj = top.HEURIST.util.evalJson(xhr.responseText);
			if (obj  &&  obj.error) alert(obj.error);
			if (callback) callback(obj);
		}, postData);
	},

	keywordAutofill: function(term) {
	// FIXME: we can improve this a lot by doing very simple caching

		if (term === "") return [];

		var keywords = top.HEURIST.user.keywords;

		/* Do complicated matching:
		 * We match the (whitespace-separated) words in the term with the words in the keyword.
		 * If there is just one word in the term this is very easy.
		 * Note that punctuation is treated as whitespace for the purposes of this experiment
		 *
		 * We treat the first word of the term as special, and make keywords that start with that word float to the top
		 */

		term = term.replace(/[^a-zA-Z0-9]/g, " ");	// remove punctuation and other non-alphanums
		term = term.toLowerCase().replace(/^ +| +$/, "");	// trim whitespace from start and end
		var regexSafeTerm = term.replace(/[\\^.$|()\[\]*+?{}]/g, "\\$0");	// neutralise any special regex characters
		var regex;
		if (regexSafeTerm.indexOf(" ") == -1) {
			// term is a single word ... look for it to start any word in the keyword
			regex = new RegExp("(.?)\\b" + regexSafeTerm);
		} else {
			// multiple words: match all of them at the start of words in the keyword
			/*
			for input
				WORD1 WORD2 WORD3 WORD4 ...
			want output
				(?=.*?\bWORD2)(?=.*?\bWORD3)(?=.*?\bWORD4) ... (^.*?)\bWORD1
			This matches all words in the search term using look-ahead (no matter what order they are in)
			except for the first word, which it prefers to match at the beginning of the keyword.
			When it matches at the beginning, $1 is empty: we test this to float it to the top of the results.
			*/
			var bits = regexSafeTerm.split(/ /);
			var firstBit = bits.shift();

			regexSafeTerm = "(?=.*?\\b" + bits.join(")(?=.*?\\b") + ")(^.*?)\\b" + firstBit;
			regex = new RegExp(regexSafeTerm);
		}
		var startMatches = [];
		var otherMatches = [];

		for (var i=0; i < keywords.length; ++i) {
			var match = keywords[i].toLowerCase().match(regex);

			if (match  &&  match[1] == "")
				startMatches.push(keywords[i]);
			else if (match)
				otherMatches.push(keywords[i]);
		}

		// splice start matches at the beginning of the other matches
		var matches = otherMatches;
		startMatches.unshift(0, 0);
		matches.splice.apply(matches, startMatches);

		return matches;
	},

	showConfirmNewTag: function(tag) {
		// "this" is the autocomplete object
		var that = this;

		if (this.confirmImg) {
			if (! tag) {
				this.confirmImg.parentNode.removeChild(this.confirmImg);
				this.confirmImg = null;
			}
			return false;
		}
		else if (! tag) return false;

		var start = this.textbox.value.indexOf(this.delimiter + this.currentWordValue + this.delimiter) + 1;
		if (start == 0  &&  this.textbox.value.substring(this.textbox.value.length - this.currentWordValue.length) == this.currentWordValue)
			start = this.textbox.value.length - this.currentWordValue.length;
		if (start < 0) start = 0;
		var end = start + this.currentWordValue.length;

		this.currentWordStart = start;
		this.currentWordEnd = end;


		var confirmImg = this.confirmImg = this.document.createElement("div");
			confirmImg.className = "confirmImg";
		var confirmOption = confirmImg.appendChild(this.document.createElement("div"));
			confirmOption.className = "option";
			confirmOption.style.top = "2px";
			confirmOption.onmousedown = function() { top.HEURIST.util.autocompleteConfirm.call(that); return false; };
		var changeOption = confirmImg.appendChild(this.document.createElement("div"));
			changeOption.className = "option";
			changeOption.style.top = "14px";
			changeOption.onmousedown = function() { top.HEURIST.util.autocompleteChange.call(that); return false; };


		// take a punt at where the caret is
		var offset = this.textbox.value.indexOf(","+tag+",")+1;	// could be somewhere in the middle ...
		if (offset == 0  &&  this.textbox.value.substring(this.textbox.value.length - tag.length) == tag) {
			offset = this.textbox.value.length - tag.length;	// could be at the end ...
		}
		if (offset < 0) offset = 0;	// otherwise it's at the beginning!


		var approxLeft = Math.round(offset * 5.5);
		if (approxLeft > this.textbox.offsetWidth) approxLeft = this.textbox.offsetWidth;
		else if (approxLeft < 20) approxLeft = 20;

		var tagsPosition = top.HEURIST.getPosition(this.textbox);
		confirmImg.style.left = (tagsPosition.x + approxLeft - 10) + "px";
		confirmImg.style.top = (tagsPosition.y + 20) + "px";

		this.document.body.appendChild(confirmImg);
		this.setTextboxRange(start, end);
		this.freeze();
		if (top.HEURIST.edit) top.HEURIST.edit.preventTabSwitch = true;

		return false;
	},
	autocompleteConfirm: function() {
		// (this) is the AutoComplete
		var newTag = this.currentWordValue.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
		top.HEURIST.user.keywords.push(newTag);

		this.confirmImg.parentNode.removeChild(this.confirmImg);
		this.confirmImg = null;

		if (top.HEURIST.edit) top.HEURIST.edit.preventTabSwitch = false;
		this.unfreeze();

		// move caret to end of text
		if (this.textbox.createTextRange) {
			var range = this.textbox.createTextRange();
			range.collapse(false);
			range.select();
		} else if (this.textbox.setSelectionRange) {
			this.textbox.focus();
			var length = this.textbox.value.length;
			this.textbox.setSelectionRange(length, length);
		}
		this.currentWord = -1;
		this.currentWordValue = null;
	},
	autocompleteChange: function() {
		this.confirmImg.parentNode.removeChild(this.confirmImg);
		this.confirmImg = null;

		if (top.HEURIST.edit) top.HEURIST.edit.preventTabSwitch = false;
		this.unfreeze();

		if (this.currentWordEnd === this.textbox.value.length-1  &&  this.textbox.value.charAt(this.currentWordEnd) === ",") {
			this.textbox.value = this.textbox.value.substring(0, this.textbox.value.length - 1);
		}
		this.textbox.focus();
		this.setTextboxRange(this.currentWordEnd, this.currentWordEnd);
	},
	autocompleteRemove: function() {
		this.confirmImg.parentNode.removeChild(this.confirmImg);
		this.confirmImg = null;

		var start = this.currentWordStart;
		var end = this.currentWordEnd;
		if (this.textbox.value.substring(end, end+this.delimiter.length) == this.delimiter) {
			end += this.delimiter.length;
		}

		this.textbox.value = this.textbox.value.substring(0, start) + this.textbox.value.substring(end);

		if (top.HEURIST.edit) top.HEURIST.edit.preventTabSwitch = false;
		this.unfreeze();

		this.textbox.focus();
		this.setTextboxRange(this.textbox.value.length, this.textbox.value.length);
		this.currentWord = -1;
		this.currentWordValue = null;
	},

	userAutofill: function(term) {
		if (term === "") return [];

		var users = top.HEURIST.allUsers;

		term = term.toLowerCase().replace(/\s+/g, " ");
		var cleanTerm = term.replace(/[^a-z0-9]/g, " ");
		cleanTerm = cleanTerm.replace(/^ +| +$/, "");
		if (! cleanTerm) return [];

		var regex = new RegExp('(?=.*' + cleanTerm.split(/ +/).join(')(?=.*') + ')');

		var reallyGoodMatches = [];
		var otherMatches = [];
		for (var i in users) {
			var match = users[i][0].toLowerCase().match(regex)  ||  users[i][1].toLowerCase().match(regex);
			if (! match) continue;

			if (users[i][0].indexOf(term) >= 0  ||  users[i][0].indexOf(term) >= 0)
				reallyGoodMatches.push(users[i][1]);
			else
				otherMatches.push(users[i][1]);
		}

		reallyGoodMatches.unshift(0);
		reallyGoodMatches.unshift(0);
		otherMatches.splice.apply(otherMatches, reallyGoodMatches);
		return otherMatches;
	},

	helpToggler: function(helpDiv) {
		var u = top.HEURIST.util;
		var alts = { "hide": "Click here to show help text", "show": "Click here to hide help text" };

		if (u.getDisplayPreference("help") === "hide") {
			u.setDisplayPreference("help", "show");
			helpDiv.title = alts["show"];
			helpDiv.innerHTML = "<span>Help is on</span>";
		}
		else {
			u.setDisplayPreference("help", "hide");
			helpDiv.title = alts["hide"];
			helpDiv.innerHTML = "<span>Help is off</span>";
		}
	}
};

top.HEURIST.registerEvent(window, "contentloaded", top.HEURIST.util.setVersion);

/* Invoke  autosizeAllElements()  when the window loads or is resized */
top.HEURIST.registerEvent(window, "load", function() { setTimeout(top.HEURIST.util.autosizeAllElements, 0); }, false, 99);	// need to autosize very late
top.HEURIST.registerEvent(window, "resize", function() {
	if (window.resizeTimeout) {
		window.clearTimeout(window.resizeTimeout);
	}
	window.resizeTimeout = window.setTimeout(function() { top.HEURIST.util.autosizeAllElements(); window.resizeTimeout = 0; }, 250);
});