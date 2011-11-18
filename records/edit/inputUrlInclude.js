/*
 * inputUrlInclude.js
 *
 *
 * brief description, date of creation, by whom
 * @copyright (C) 2005-2010 University of Sydney Digital Innovation Unit.
 * @link: http://HeuristScholar.org
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 * @package Heurist academic knowledge management system
 * @todo
 */

top.HEURIST.edit.inputs.BibDetailURLincludeInput = function() { top.HEURIST.edit.inputs.BibDetailInput.apply(this, arguments); };
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype = new top.HEURIST.edit.inputs.BibDetailInput;
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.focus = function() { this.inputs[0].textElt.focus(); };
//top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.regex = new RegExp("^[1-9]\\d*$");
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.typeDescription = "a url to be included";

top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.addInput = function(bdValue) {
	var thisRef = this;	// provide input reference for closures

	var newDiv = this.document.createElement("div");
		newDiv.className = bdValue? "resource-div" : "resource-div empty";
		newDiv.expando = true;
	this.addInputHelper.call(this, bdValue, newDiv);

	var val = "";
	if(bdValue){
		val = bdValue.value;
		var arr = val.split("|");
		if(arr && arr.length>0){
			val = arr[0];
		}
	}

	var hiddenElt = newDiv.hiddenElt = this.document.createElement("input");
		hiddenElt.name = newDiv.name;
		hiddenElt.value = hiddenElt.defaultValue = (bdValue)? bdValue.value : "";
		hiddenElt.type = "hidden";
		newDiv.appendChild(hiddenElt);

	var textElt = newDiv.textElt = newDiv.appendChild(this.document.createElement("input"));
		textElt.type = "text";
		textElt.value = textElt.defaultValue = val;
		textElt.title = "Click here to upload file and/or define the URL";
		textElt.setAttribute("autocomplete", "off");
		textElt.className = "in"; //"resource-title";
		textElt.style.width = 200;
		textElt.onkeypress = function(e) {
			// refuse non-tab key-input
			if (! e) e = window.event;

			if (! newDiv.readOnly  &&  e.keyCode != 9  &&  ! (e.ctrlKey  ||  e.altKey  ||  e.metaKey)) {
				// invoke popup
				thisRef.defineURL(newDiv);
				return false;
			}
			else return true;	// allow tab or control/alt etc to do their normal thing (cycle through controls)
		};
		top.HEURIST.registerEvent(textElt, "click", function() { thisRef.defineURL(newDiv); });
		top.HEURIST.registerEvent(textElt, "mouseup", function() { if (! newDiv.readOnly) thisRef.handlePossibleDragDrop(thisRef, newDiv); });
		top.HEURIST.registerEvent(textElt, "mouseover", function() { if (! newDiv.readOnly) thisRef.handlePossibleDragDrop(thisRef, newDiv); });


	var removeImg = newDiv.appendChild(this.document.createElement("img"));
		removeImg.src = top.HEURIST.basePath+"common/images/12x12.gif";
		removeImg.className = "delete-resource";
		removeImg.title = "Clear url";
		var windowRef = this.document.parentWindow  ||  this.document.defaultView  ||  this.document._parentWindow;
		top.HEURIST.registerEvent(removeImg, "click", function() {
			if (! newDiv.readOnly) {
				thisRef.clearURL(newDiv);
				windowRef.changed();
			}
		});

/*
	var editImg = newDiv.appendChild(this.document.createElement("img"));
		editImg.src = top.HEURIST.basePath +"common/images/edit-pencil.png";
		editImg.className = "edit-resource";
		editImg.title = "Edit this record";

	top.HEURIST.registerEvent(editImg, "click", function() {
		top.HEURIST.util.popupURL(window,top.HEURIST.basePath +"records/edit/formEditRecordPopup.html?recID=" + hiddenElt.value, {
			callback: function(bibTitle) { if (bibTitle) textElt.defaultValue = textElt.value = bibTitle; }
		});
	});
*/

	if (window.HEURIST && window.HEURIST.parameters && window.HEURIST.parameters["title"]  &&  bdValue  &&  bdValue.title  &&  windowRef.parent.frameElement) {
		// we've been given a search string for a record pointer field - pop up the search box
		top.HEURIST.registerEvent(windowRef.parent.frameElement, "heurist-finished-loading-popup", function() {
			thisRef.defineURL(newDiv, bdValue.title);
		});
	}
};
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.getPrimaryValue = function(input) { return input? input.hiddenElt.value : ""; };

/**
* Open popup - to upload file and specify URL
*/
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.defineURL = function(element, editValue) {

	var thisRef = this;

	if (!editValue) editValue = element.hiddenElt.value;
	var url = top.HEURIST.basePath+"records/files/uploadFileOrDefineURL.html?value="+encodeURIComponent(editValue);
	/*if (element.input.constrainrectype){
		url += "&t="+element.input.constrainrectype;
	}*/

	top.HEURIST.util.popupURL(window, url, {
		height: 480,
		width: 640,
		callback: function(url, source, type) {
			//it returns url - link to external or heurist file
			//			source - name of source/service
			//			type - type of media
			if(top.HEURIST.util.isempty(url)){
				//element.input.setURL(element, "", "");
			}else{
				element.input.setURL(element, url, url+'|'+source+"|"+type);
			}
		}
	} );
};

/**
* clear value
*/
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.clearURL = function(element) { this.setURL(element, "", ""); };
/**
* assign new URL value
*/
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.setURL = function(element, url, src_type) {

	element.textElt.title = element.textElt.value = element.textElt.defaultValue = url? url : "";
	element.hiddenElt.title = element.hiddenElt.value = element.hiddenElt.defaultValue = src_type? src_type : "";


	var windowRef = this.document.parentWindow  ||  this.document.defaultView  ||  this.document._parentWindow;
	windowRef.changed();
};

/**
*  TODO - to implement
*/
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.handlePossibleDragDrop = function(input, element) {
	/*
	 * Invoked by the mouseup property on resource textboxes.
	 * We can't reliably detect a drag-drop action, but this is our best bet:
	 * if the mouse is released over the textbox and the value is different from what it *was*,
	 * then automatically popup the search-for-resource box.

	if (element.textElt.value != element.textElt.defaultValue  &&  element.textElt.value != "") {
		var searchValue = this.calculateDroppedText(element.textElt.defaultValue, element.textElt.value);

		// pause, then clear search value
		setTimeout(function() { element.textElt.value = element.textElt.defaultValue; }, 1000);

		element.input.defineURL(element, searchValue);
	}
	 */
};

/**
*  TODO - to implement
*/
top.HEURIST.edit.inputs.BibDetailURLincludeInput.prototype.calculateDroppedText = function(oldValue, newValue) {
/*
	// If a value is dropped onto a resource-pointer field which already has a value,
	// the string may be inserted into the middle of the existing string.
	// Given the old value and the new value we can determine the dropped value.
	if (oldValue == "") return newValue;

	// Compare the values character-by-character to find the longest shared prefix
	for (var i=0; i < oldValue.length; ++i) {
		if (oldValue.charAt(i) != newValue.charAt(i)) break;
	}

	// simple cases:
	if (i == oldValue.length) {
		// the input string was dropped at the end
		return newValue.substring(i);
	}
	else if (i == 0) {
		// the input string was dropped at the start
		return newValue.substring(0, newValue.length-oldValue.length);
	}
	else {
		// If we have ABC becoming ABXYBC,
		// then the dropped string could be XYB or BXY.
		// No way to tell the difference -- we always return the former.
		return newValue.substring(i, i + newValue.length-oldValue.length);
	}
*/
};