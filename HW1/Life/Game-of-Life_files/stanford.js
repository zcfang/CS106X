/*
 * Marty Stepp's Stanford CS course web site script
 * Sets up various things on my course web site pages,
 * such as links to files, email addresses and campus buildings.
 *
 * @version 2016/01/03 (Winter 2016)
 */

// wrap entire script in an anonymous function to avoid polluting global scope
// (JS module pattern)
if (typeof Stanford == "undefined" || !Stanford.isLoaded) {
	"use strict";
	var Stanford = function() {
		// empty
	};
	Stanford.isLoaded = true;

	Stanford.DEPARTMENT_EMAIL_DOMAIN = "cs.stanford.edu";
	Stanford.UNIVERSITY_EMAIL_DOMAIN = "stanford.edu";
	Stanford.DEFAULT_EMAIL_DOMAIN = Stanford.DEPARTMENT_EMAIL_DOMAIN;

	// URL stub for campus map building links
	// (this list is woefully incomplete; if you need to add a building, go ahead)
	Stanford.BUILDING_IDS = {
		"50": "01-050",
		"540": "02-540",
		"annenberg": "03-010",
		"annenberg auditorium": "03-010",
		"art": "03-010",
		"bishop": "08-350",
		"bishop auditorium": "08-350",
		"blume earthquake center (civil eng)": "02-540",
		"blume earthquake center": "02-540",
		"blume": "02-540",
		"braun": "07-210",
		"braun auditorium": "07-210",
		"braun corner": "01-320",
		"building 300": "01-300",
		"building 300, main quad": "01-300",
		"cemex": "08-050C",
		"cemex auditorium": "08-050C",
		"chem": "07-200",
		"chemistry": "07-200",
		"civil eng": "02-540",
		"cubberley": "03-300",
		"cubberley auditorium": "03-300",
		"cummings": "03-010",
		"cummings art": "03-010",
		"dinkelspiel": "02-200",
		"dinkelspiel auditorium": "02-200",
		"educ": "03-300",
		"education": "03-300",
		"encina": "06-010",
		"encina hall center": "06-010",
		"encinaw": "06-020",
		"encina hall west": "06-020",
		"encina west": "06-020",
		"gates": "07-450",
		"geology": "01-320",
		"gilbert": "07-420",
		"herrin": "07-410",
		"herrin hall": "07-410",
		"herrint": "07-410",
		"hewlett": "04-510",
		"history": "01-200",
		"huang": "04-080",
		"huang basement": "04-080",
		"huang engineering": "04-080",
		"huang engineering center": "04-080",
		"jacks": "01-460",
		"jordan hall (psychology)": "01-420",
		"jordan hall": "01-420",
		"jordan": "01-420",
		"lane": "01-200",
		"lane history corner": "01-200",
		"lathrop": "08-350",
		"lathrop library": "08-350",
		"littlefield": "08-360",
		"margaret jacks": "01-460",
		"margaret jacks hall": "01-460",
		"mcclatchy": "01-120",
		"mcclatchy hall": "01-120",
		"memorial": "08-300",
		"memorial auditorium": "08-300",
		"mudd": "07-210",
		"mudd chemistry": "07-210",
		"nvidia": "04-080",
		"nvidia auditorium": "04-080",
		"old": "02-580",
		"old union": "02-580",
		"sapp": "07-200",
		"sapp center": "07-200",
		"sapp center for teaching learning": "07-200",
		"science teaching learning center": "07-200",
		"science teaching & learning center": "07-200",
		"shriram": "04-060",
		"shriram center": "04-060",
		"sloan": "01-380",
		"sloan mathematics": "01-380",
		"slct": "07-200",
		"sltc": "07-200",
		"stlc": "07-200",
		"thornton": "04-720",
		"tresider": "02-300",
		"tresidder": "02-300",
		"tressider": "02-300",
		"tressidder": "02-300",
		"wallenberg": "01-160",
		"zambrano": "08-050C",
		"zambrano hall": "08-050C",
	};
	Stanford.MAPS_URL = "http://campus-map.stanford.edu/index.cfm?ID=";

	// Turns spans with class of "building" into links to a campus map to that building.
	Stanford.buildingMapLinks = function(element) {
		element = element || document.body;
		var cells = element.querySelectorAll(".building");
		for (var i = 0; i < cells.length; i++) {
			var addr = cells[i].innerHTML;
			if (addr == "TBD" || addr == "TBA") {
				continue;
			}
			
			var tokens = addr.split(/[ \-]+/);
			var building = tokens[0];
			var roomNumber = "";

			if (tokens.length >= 2) {
				roomNumber = " " + tokens[1];
			}

			var buildingLC = building.toLowerCase();
			var buildingID = addr;
			if (Stanford.BUILDING_IDS[buildingLC]) {
				buildingID = Stanford.BUILDING_IDS[buildingLC];
			} else {
				// possible weird building link like "160-321";
				// check for just the first part ("160") in BUILDING_IDS map; if it's there, use that;
				// if not, assume most common "01-" prefix, e.g. "01-160"
				if (Stanford.BUILDING_IDS[building]) {
					buildingID = Stanford.BUILDING_IDS[building];
				} else {
					buildingID = "01-" + building;
				}
			}
			cells[i].innerHTML = "<a target=\"_blank\" href=\"" + Stanford.MAPS_URL + buildingID + "\">" + cells[i].innerHTML + "</a>";
		}
	};

	// Turns spans with class of "ema" into links to email that person.
	Stanford.emailAddressLinks = function(element) {
		element = element || document.body;
		var cells = element.querySelectorAll(".ema");
		for (var i = 0; i < cells.length; i++) {
			var addr = cells[i].textContent ? cells[i].textContent : cells[i].innerText;
			var linkText = addr;
			var domain = Stanford.DEFAULT_EMAIL_DOMAIN;
			if (cells[i].classList.contains("deptema")) {
				domain = Stanford.DEPARTMENT_EMAIL_DOMAIN;
			} else if (cells[i].classList.contains("universityema")) {
				domain = Stanford.UNIVERSITY_EMAIL_DOMAIN;
			}

			if (!cells[i].classList.contains("hideema")) {
				linkText += "@" + domain;
			}
			cells[i].innerHTML = "<a href=\"mailto:" + addr + "@" + domain + "\"><i class=\"fa fa-envelope\"></i>&nbsp;" + linkText + "</a>";
		}
	};

	// sets up an "honor code warning" popup window that will display later
	Stanford.honorCodePopup = function() {
		if (document.getElementById("honorcodeaccept")) {
			document.getElementById("honorcodeaccept").addEventListener("click", function() {
				if (document.getElementById("honorcodeaccept").popup) {
					window.open(document.getElementById("honorcodeaccept").href);
				} else {
					location.href = document.getElementById("honorcodeaccept").href;
				}
				document.getElementById("honorcodemessage").style.display = "none";
			});
		}
		if (document.getElementById("honorcodecancel")) {
			document.getElementById("honorcodecancel").addEventListener("click", function() {
				document.getElementById("honorcodemessage").style.display = "none";
			});
		}
	};

	// Turns links with class of "honorcode" into links that pop up a reminder to obey the course honor code
	Stanford.honorCodeLinks = function(element) {
		element = element || document.body;
		var links = element.querySelectorAll("a.honorcodelink");
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			
			// turn off popup in new tab because of interstitial popup window
			if (link.classList.contains("popup")) {
				// link.target = "";
			}

			link.addEventListener("click", function(event) {
				event = event || window.event;
				event.preventDefault();
				event.stopPropagation();
				if (!document.getElementById("honorcodeaccept")) {
					return false;
				}
				document.getElementById("honorcodeaccept").link = this;
				document.getElementById("honorcodeaccept").href = this.href;
				document.getElementById("honorcodeaccept").popup = this.classList.contains("popup") || this.target == "_blank";
				document.getElementById("honorcodemessage").style.display = "";
				return false;
			});
		}
	};

	Stanford.insertStaffTableRows = function(sectionLeaderList) {
		if (typeof(sectionLeaderList) == "undefined" || !sectionLeaderList) {
			return;
		}

		var template = document.querySelector("#slboxtemplate, .slboxtemplate");
		if (!template) {
			return;
		}

		var slInsertArea = document.getElementById("slboxinsertarea");
		if (!slInsertArea) {
			return;
		}

		for (var i = 0; i < sectionLeaderList.length; i++) {
			var slBox = template.cloneNode(true);
			slBox.id = "";
			slBox.style.display = "inline-block";

			var sl = sectionLeaderList[i];
			if (typeof(sl) == "string") {
				// "Aaron Broder (abroder)	Thursday 3:30 PM	TBD",
				// convert string to object:
				// {name: "Ashley Taylor", email: "ataylor4", _time: "Wednesday 3:30 PM", _room: "TBD"}
				var tokens = sl.trim().split(/\t/);
				if (tokens.length < 3) { continue; }
				var nameRegex = /(.*)[ \t]+\((.*)\)/;
				var name = tokens[0].replace(nameRegex, "$1");
				var sunetid = tokens[0].replace(nameRegex, "$2");
				var time = tokens[1];
				var room = tokens[2];
				sl = {
					"name": name,
					"email": sunetid,
					"time": time,
					"room": room
				};
			}
			
			for (var prop in sl) {
				if (sl.hasOwnProperty(prop)) {
					var slBoxElement = slBox.querySelector(".sl" + prop);
					if (slBoxElement) {
						slBoxElement.innerHTML = sl[prop];
					}
				}
			}
			var slImage = slBox.querySelector(".slimage");
			if (slImage) {
				var slNameLC = sl["name"].toLowerCase().replace(/ /g, "-");
				slImage.src = slImage.src.replace("SLNAME", slNameLC);
			}
			
			var slEmailLink = slBox.querySelector(".slemaillink");
			if (slEmailLink) {
				slEmailLink.href = slEmailLink.href.replace("SLEMAIL", sl["email"]);
			}
			
			slInsertArea.appendChild(slBox);
		}
	};

	// make links with the class 'popup' show in a new window
	Stanford.popupLinks = function(element) {
		element = element || document.body;
		var popups = element.querySelectorAll("a.popup");
		for (var i = 0; i < popups.length; i++) {
			popups[i].target = "_blank";
		}
	};

	Stanford.showSCPDElements = function(element) {
		element = element || document.body;
		var scpdElements = element.querySelectorAll("#scpdlink, .scpd");
		for (var i = 0; i < scpdElements.length; i++) {
			scpdElements[i].style.display = "";
		}
	};

	// This is "main", the main function of code that runs when the page loads.

	function windowOnLoad() {
		RelativeDates.initialize();
		Stanford.popupLinks();
		Stanford.emailAddressLinks();
		Stanford.buildingMapLinks();
		Stanford.honorCodePopup();
		Stanford.honorCodeLinks();
		if (localStorage["scpd"]) {
			Stanford.showSCPDElements();
		}
		if (typeof(SpecialEffects) !== "undefined") {
			SpecialEffects.setupClickToShowAreas();
		}
	}
	
	window.addEventListener("load", windowOnLoad);
}
