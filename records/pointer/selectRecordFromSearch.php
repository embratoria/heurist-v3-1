<html>
 <head>
  <link rel=stylesheet href="../../common/css/import.css">
  <title>Find records</title>
 </head>
 <body width="500" height="250" >
  <script src="../../common/js/heurist.js"></script>
  <script>
if (window == top) {
	top.HEURIST.loadScript(top.HEURIST.basePath +"common/php/heurist-obj-common.php");	// core HEURIST object definitions (dynamically generated)
}
  </script>

  <form onSubmit="this.submit(); return false;">
  <div id="search">
    <table border=0 cellspacing=0 cellpadding=0 class=expander style="margin-bottom: 1em;"><tr>
     <td style="width: 40px; text-align: right;">Find&nbsp;</td>
     <td style="padding: 5px;">
      <div style="width: 100%;">
       <div><input autocomplete=off type=text name=q id=q onChange="top.HEURIST.util.setDisplayPreference('record-search-string', value);" style="padding: 1px 18px 1px 2px; margin: 0; width: 100%;"></div>
       <div id=help-div>Enter part of word and click <img src="../../common/images/tiny-magglass.gif" onClick="document.forms[0].submit()" style="vertical-align: middle;"></div>
      </div>
     </td>
     <td style="width: 1px; vertical-align: middle;">
      <div style="overflow: visible; width: 1px;">
      <img src="../../common/images/small-magglass.gif" style="position: relative; cursor: pointer; z-index: 1; left: -22px;"
           onclick="document.forms[0].submit()" title="Search records">
      </div>
      <input type=submit value=Find style="display: none; font-weight: bold; padding: 0 1ex; margin-right: 1ex;">
     </td>
     <td style="width: 120px;" title="Restrict search to this record type">
      <select id=t name=t style="width: 100%;" onChange="top.HEURIST.util.setDisplayPreference('record-search-type', options[selectedIndex].value);"></select>
     </td>
     <td style="width: 80px; padding: 0 5px;">
      <div class=radio><nobr><label for=r-recent><input type=radio name=r id=r-recent value=recent> recent</label></nobr></div>
      <div class=radio><nobr><label for=r-all><input type=radio name=r id=r-all value=all> all records</label></nobr></div>
     </td>
    </tr></table>
   </div>
<!--   <div id=results-container class=expander style="overflow: hidden;">-->
    	<div id=results></div>
<!--   </div>-->
   <div id="add_records_footer">
    Didn't find what you were looking for?
    <a href="#" onClick="top.HEURIST.util.popupURL(window, top.HEURIST.basePath +'records/addrec/mini-add.html?reftype='+document.getElementById('t').value+'&amp;title='+document.getElementById('q').value, { callback: function(title, bd, bibID) { if (bibID) { window.close(bibID, title); } else { document.forms[0].submit(); } } }); return false;"><img src="../../common/images/add-record-small.png" />Add a new record</a>
   </div>
  </table>
  </form>

  <script language="JavaScript">
window.HEURIST.parameters = top.HEURIST.parseParams(window.location.search);

var reftype = window.HEURIST.parameters["t"];
if (reftype) {
	var reftypes = {};
	var refTypeName = "";
	if (reftype.search(",") != -1) {//seems like we have multiple type constraint, test that it is well formed
		var temp = reftype.split(",");
		for (var i=0; i<temp.length; i++) {
			if (temp[i].search(/\D/) == -1) {
				reftypes[temp[i]] = 1;
				refTypeName += top.HEURIST.reftypes.names[temp[i]].toLowerCase() + ",";
			}
		}
		refTypeName = refTypeName.slice(0,-1); // remove the last comma
		delete temp;
	}else if (reftype.search(/\D/) == -1) {
		reftypes[reftype] = 1;
		refTypeName = top.HEURIST.reftypes.names[reftype].toLowerCase();
	}else{
		reftypes = null;
	}
}

	/* If a reftype has been chosen then set a custom title -- need to do before onload so the popup code will catch it */
if (refTypeName) {
	document.title = "Find " + refTypeName + " records";
}

// search callback which fills the result area with a line for each record in the result set
function notifyResults(results) {
	var resultsDiv = document.getElementById("results");
	var records = eval(results.responseText).records;

	var recordDiv;
	var record;
	var bibID, img, title;

	resultsDiv.innerHTML = "";
	for (var i=0; i < records.length; ++i) {
		record = records[i];

		recordDiv = resultsDiv.appendChild(document.createElement("div"));
		recordDiv.className = "record";

		bibID = recordDiv.appendChild(document.createElement("span"));
		bibID.appendChild(document.createTextNode(record[0]));
		bibID.className = "id";

		img = recordDiv.appendChild(document.createElement("img"));
		img.src = top.HEURIST.basePath + "common/images/reftype-icons/" + (record[3]? record[3] : "blank") + ".png";

		title = recordDiv.appendChild(document.createElement("span"));
		title.appendChild(document.createTextNode(record[1]));
		title.title = record[1];
		title.className = "title";

		top.HEURIST.registerEvent(recordDiv, "click", function(bibID, bibTitle) {
			return function() {
				window.close(bibID, bibTitle);
			}
		}(record[0], record[1]));
	}

	if (records.length == 0) {
		resultsDiv.innerHTML = "<b style='padding: 1ex;'>No matching records</b>";
	}

	document.body.cursor = "";
}

document.forms[0].submit = function() {
	// Make an AJAX request for the search results.  If no search specified, default to RECENT entries.
	var q = document.forms[0].elements["q"].value;
	var t = document.forms[0].elements["t"].value;
	if (t == "0") t = "";
// saw TODO modify for multi constraints set
	var query = "q=" + encodeURIComponent(q + (t? (" type:"+parseInt(t)) : ""));
	if (document.getElementById("r-recent").checked  ||  q == "") {
		query += "&r=recent";
	}

	document.body.cursor = "wait";

	var resultsDiv = document.getElementById("results");
	resultsDiv.innerHTML = "<i style='padding: 1ex;'>Searching ...</i>";

	top.HEURIST.util.sendRequest(top.HEURIST.basePath + "records/pointer/json-bib-search.php", notifyResults, query);

	return false;
}

/* FLAGRANT abuse of the onsubmit function, but otherwise hitting return in the field submits the entire page */
document.forms[0].onsubmit = function() { document.forms[0].submit(); return false; };


function initPage() {
	var qVal = window.HEURIST.parameters["q"];
	if (! qVal  &&  ! (reftype)) {
		qVal = top.HEURIST.util.getDisplayPreference("record-search-string");
	}
	document.forms[0].elements["q"].value = qVal  ||  "";

	top.HEURIST.registerEvent(window, "load", function() { document.forms[0].elements["q"].focus(); });

	var preferredType = top.HEURIST.util.getDisplayPreference("record-search-type");
	var initialType = preferredType;
	if (reftypes) {
		for (var type in reftypes) {	// careful! this only runs once and then breaks.
			if (!reftypes[preferredType]) {
				initialType = type;
			}
			break;
		}
	}

	var tElt = document.getElementById("t");
	tElt.selectedIndex = 0;

	if (!reftypes) {
		tElt.options[tElt.options.length] = new Option("Any record type", "");

		var grp = document.createElement("optgroup");
		grp.label = "Bibliographic reference types";
		tElt.appendChild(grp);
	}

	for (var i=0; i < top.HEURIST.reftypes.primary.length; ++i) {
		var value = top.HEURIST.reftypes.primary[i];
		// if we have constraints then only add types in the constraint set
		if (reftypes && !reftypes[value]) {
			continue;
		}
		var name = top.HEURIST.reftypes.names[value];
		tElt.options[tElt.options.length] = new Option(name, value);

		if (value == initialType) {
			tElt.selectedIndex = tElt.options.length-1;
		}
	}
	if (!reftypes) {
		var grp = document.createElement("optgroup");
		grp.label = "Other reference types";
		tElt.appendChild(grp);
	}

	for (var i=0; i < top.HEURIST.reftypes.other.length; ++i) {
		var value = top.HEURIST.reftypes.other[i];
		if (reftypes && !reftypes[value]) {
			continue;
		}
		var name = top.HEURIST.reftypes.names[value];
		tElt.options[tElt.options.length] = new Option(name, value);

		if (value == initialType) {
			tElt.selectedIndex = tElt.options.length-1;
		}
	}

	if (window.HEURIST.parameters["r"] == "recent")
		document.getElementById("r-recent").checked = true;
	else
		document.getElementById("r-all").checked = true;

	document.forms[0].submit();

	var intervalID = setInterval(function() {
		try {
			if (document.getElementById("q")) {
				document.getElementById("q").focus();
				clearInterval(intervalID);
			}
		} catch (e) { }
	}, 0);
}
top.HEURIST.registerEvent(window, "load", initPage);
  </script>

 </body>
</html>