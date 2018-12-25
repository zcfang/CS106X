/*
 * Marty Stepp's Stanford web script for inserting relative dates.
 * Also allows for showing/hiding content on certain absolute or relative dates.
 * @version 2016/01/03 (Winter 2016)
 * - updated insertDates for CS 194 lectures page
 * - updated checkPageOutOfDate to alert about old course web pages
 */

if (typeof RelativeDates == "undefined" || !RelativeDates.isLoaded) {
	"use strict";
	var RelativeDates = function() {};
	RelativeDates.isLoaded = true;

	/// CONSTANTS
	RelativeDates.WEEK1_SUN = "";
	RelativeDates.ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;
	RelativeDates.DATES = {};
	RelativeDates.DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	RelativeDates.DAYS_IN_MONTH = [-1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	RelativeDates.MONTHS_OF_YEAR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	RelativeDates.QUARTERS = ["wi", "sp", "su", "au"];
	RelativeDates.QUARTER_NAME_TO_NUM = {
		"au": 2,
		"wi": 4,
		"sp": 6,
		"su": 8,
	};
	RelativeDates.QUARTER_NUM_TO_NAME = {
		2: "au",
		4: "wi",
		6: "sp",
		8: "su",
	};
	RelativeDates.QUARTER_START = {
		"wi": "Jan 1",
		"sp": "Mar 15",
		"su": "Jun 15",
		"au": "Sep 15"
	};
	RelativeDates.QUARTER_END = {
		"wi": "Mar 14",
		"sp": "Jun 14",
		"su": "Sep 14",
		"au": "Dec 31"
	};
	RelativeDates.QUARTER_FULL_NAME = {
		"wi": "Winter",
		"sp": "Spring",
		"su": "Summer",
		"au": "Autumn"
	};

	/// UTILITY FUNCTIONS BEGIN ///
	// Returns all query parameters on the page as a [key => value] hash.
	RelativeDates.getQueryParams = function() {
		var hash = {};
		if (location.search && location.search.length >= 1) {
			var url = location.search.substring(1);
			var chunks = url.split(/&/);
			for (var i = 0; i < chunks.length; i++) {
				var keyValue = chunks[i].split("=");
				if (keyValue[0]) {
					var thisValue = true;
					if (typeof(keyValue[1]) !== "undefined") {
						thisValue = decodeURIComponent(keyValue[1]);
						thisValue = thisValue.replace(/[+]/g, " ");  // unescape URL spaces
					}
					hash[keyValue[0]] = thisValue;
				}
			}
		}
		return hash;
	};

	RelativeDates.getParent = function(element, tag) {
		if (!element) {
			return null;
		}
		if (!tag) {
			return element.parentNode;
		}
		tag = tag.toLowerCase();
		
		var parent = element.parentNode;
		while (parent) {
			if (parent.tagName && parent.tagName.toLowerCase() == tag) {
				return parent;
			}
			parent = parent.parentNode;
		}
		return null;
	};
	
	RelativeDates.getTextContent = function(element) {
		try {
			if (typeof element.textContent !== "undefined") {
				return element.textContent;
			} else if (typeof element.innerText !== "undefined") {
				return element.innerText;
			} else if (typeof element.value !== "undefined") {
				return element.value;
			} else if (typeof element.firstChild !== "undefined" && typeof element.firstChild.nodeValue !== "undefined") {
				return element.firstChild.nodeValue;
			}
		} catch (e) {}

		return null;
	};

	RelativeDates.setTextContent = function(element, text) {
		try {
			if (element.textContent !== undefined) {
				element.textContent = text;
			} else if (element.value !== undefined) {
				element.value = text;
			} else if (element.innerText !== undefined) {
				element.innerText = text;
			} else if (element.firstChild !== undefined) {
				element.firstChild.nodeValue = text;
			}
		} catch (e) {}

		return element;
	}
	/// UTILITY FUNCTIONS END ///

	/// DATE FUNCTIONS BEGIN ///
	// Displays a warning message on the page if this is not the current quarter's web site.
	RelativeDates.checkPageOutOfDate = function() {
		// try to figure out what quarter this web site is for
		
		// http://web.stanford.edu/class/archive/cs/cs106b/cs106b.1156/
		// 1156:
		//  1 => meaningless
		// 15 => 2015
		//  6 => 2=fall, 4=winter, 6=spring, 8=summer
		var quarterNum  = "";     // "1162"
		var quarterYear = "";     // "2015"
		var quarterQtr  = "";     // "au"
		var quarterStr  = "";     // "15au"

		if (location.href.match(/.*\/archive\/.*/)) {
			var quarterNum = location.href.replace(/.*\/archive\/cs\/[^\/]+\/[a-zA-Z0-9]+\./gi, "");
			quarterNum = quarterNum.replace(/[^0-9]/gi, "");
			if (quarterNum.length >= 4) {
				var quarterYear = 2000 + parseInt(quarterNum.substring(1, 3), 10);   // "15" -> 2015
				var quarterQtr  = parseInt(quarterNum.charAt(3), 10);
				quarterQtr = RelativeDates.QUARTER_NUM_TO_NAME[quarterQtr];
				if (quarterQtr == "au") {
					quarterYear--;   // autumn is actually in the previous calendar year (e.g. 2015-16 "autumn" => 15au)
				}
				quarterStr = ("" + quarterYear).substring(2) + quarterQtr;
			}
		} else {
			// try to infer current quarter from H1 heading
			var h1 = document.querySelector("h1");
			if (!h1) {
				return false;
			}
			
			// "CS 106B, Autumn 2015"      => "Autumn 2015"
			// "CS 106B <br> Autumn 2015"  => "Autumn 2015"
			var text = h1.innerHTML.trim().replace(/.*,/, "").trim();
			text = text.replace(/.*>/, "").trim();
			var tokens = text.split(/[ ]+/);
			if (tokens.length == 2) {
				quarterYear = parseInt(tokens[1], 10);                  // 2015
				quarterQtr = tokens[0].toLowerCase().substring(0, 2);   // "au"
				quarterStr = ("" + quarterYear).substring(2) + quarterQtr;
			}
		}
		if (!quarterStr || !quarterYear || !quarterQtr) {
			return false;
		}
		
		var now = RelativeDates.getToday();
		var currentYear = now.getYear();
		if (currentYear < 1000) {
			// non-IE<=8 returns year since 1900; IE<=8 returns actual year
			currentYear += 1900;
		}
		var currentQtr  = "";       // e.g. "11au"
		var currentQtrQtr = "";     // e.g. "au"
		var obsolete = false;

		// try to figure out what quarter it is currently (roughly)
		// "Dec 6 2011 8:15 AM"
		for (var i = 0; i < RelativeDates.QUARTERS.length; i++) {
			var qtrName = RelativeDates.QUARTERS[i];
			var dateStart = new Date(Date.parse(RelativeDates.QUARTER_START[qtrName] + " " + currentYear + " 12:00 AM"));
			var dateEnd   = new Date(Date.parse(RelativeDates.QUARTER_END[qtrName]   + " " + currentYear + " 11:59 PM"));
			if (dateStart <= now && now <= dateEnd) {
				// found the current quarter!  now see if this web page is from that quarter.
				currentQtr = currentYear % 100 + qtrName;
				currentQtrQtr = qtrName;
				break;
			}
		}

		if (quarterYear < currentYear) {
			obsolete = true;                    // this web site comes from a past year
		} else if (typeof(quarterStr) != "undefined" && typeof(currentQtr) != "undefined" && quarterStr && currentQtr) {
			// this web site may come from a past quarter in the same year
			var quarterIndex = RelativeDates.QUARTERS.indexOf(quarterQtr);
			var currentQtrIndex = RelativeDates.QUARTERS.indexOf(currentQtrQtr);
			obsolete = quarterStr != currentQtr &&
				(quarterIndex >= 0 && currentQtrIndex >= 0 && quarterIndex < currentQtrIndex);   // this web site may come from a past quarter in the same year
		}

		var quarterFullName = RelativeDates.QUARTER_FULL_NAME[quarterQtr] + " " + quarterYear;
		var currentQuarterFullName = RelativeDates.QUARTER_FULL_NAME[currentQtrQtr] + " " + currentYear;

		if (obsolete) {
			if (document.getElementById("webpageoutofdate")) {
				document.getElementById("webpageoutofdate").style.display = "";
			}
			
			/*
			var div = document.createElement("div");

			// try to figure out what course this web site is for
			var websiteLink = "http://cs" + course + ".stanford.edu/";

			div.className = "excitingnews";
			div.innerHTML = "NOTE: This old web site is <strong>out of date</strong>.  " +
					"This is the course web site from a past quarter, <strong>" + "quarter??" + "</strong> (" + quarterFullName + "), " +
					"but the current quarter is <strong>" + currentQtr + "</strong> (" + currentQuarterFullName + ").  " +
					"If you are a current student taking the course, this is not your class web site, " +
					"and you should visit the <a href=\"" + websiteLink + "\">current class web site</a> instead.";

			var container = document.querySelector("div.centerpane") || document.getElementById("container") || document.body;
			container.insertBefore(div, container.firstChild);*/
		}
		return true;
	};
	
	RelativeDates.getWebSiteQuarterString = function() {
		var quarterNum  = "";     // "1162"
		var quarterYear = "";     // "2015"
		var quarterQtr  = "";     // "au"
		var quarterStr  = "";     // "15au"
		if (location.href.match(/.*\/archive\/.*/)) {
			var quarterNum = location.href.replace(/.*\/archive\/cs\/[^\/]+\/[a-zA-Z0-9]+\./gi, "");
			quarterNum = quarterNum.replace(/[^0-9]/gi, "");
			console.log("quarterNum = " + quarterNum);
			if (quarterNum.length >= 4) {
				var quarterYear = 2000 + parseInt(quarterNum.substring(1, 3), 10);   // "15" -> 2015
				var quarterQtr  = parseInt(quarterNum.charAt(3), 10);
				quarterQtr = RelativeDates.QUARTER_NUM_TO_NAME[quarterQtr];
				if (quarterQtr == "au") {
					quarterYear--;   // autumn is actually in the previous calendar year (e.g. 2015-16 "autumn" => 15au)
				}
				quarterStr = ("" + quarterYear).substring(2) + quarterQtr;
				return quarterStr;
			}
		} else {
			// try to infer current quarter from H1 heading
			var h1 = document.querySelector("h1");
			if (!h1) {
				return null;
			}
			
			// "CS 106B, Autumn 2015"      => "Autumn 2015"
			// "CS 106B <br> Autumn 2015"  => "Autumn 2015"
			var text = h1.innerHTML.trim().replace(/.*,/, "").trim();
			text = text.replace(/.*>/, "").trim();
			var tokens = text.split(/[ ]+/);
			if (tokens.length == 2) {
				quarterYear = parseInt(tokens[1], 10);                  // 2015
				quarterQtr = tokens[0].toLowerCase().substring(0, 2);   // "au"
				quarterStr = ("" + quarterYear).substring(2) + quarterQtr;
				return quarterStr;
			}
		}
		return null;
	};
	
	RelativeDates.getWebSiteYear = function() {
		var quarterStr = RelativeDates.getWebSiteQuarterString();
		if (quarterStr.length >= 2) {
			return parseInt(quarterStr.substring(0, 2), 10) + 2000;
		} else {
			return 2016;  // kludge
		}
	};
	
	RelativeDates.getToday = function() {
		var realToday = new Date();
		var queryParams = RelativeDates.getQueryParams();
		if (queryParams["today"]) {
			var todayStr = queryParams["today"];
			var today = new Date(todayStr);
			var todayYear = today.getYear();
			if (todayYear < 1000) { todayYear += 1900; }
			var realTodayYear = realToday.getYear();
			if (realTodayYear < 1000) { realTodayYear += 1900; }
			if (todayYear < realTodayYear - 5) {
				// kludge to set year to current year if omitted
				today.setYear(realTodayYear);
			}
			return today;
		} else {
			return realToday;
		}
	};

	// try to highlight current date table cell on lecture calendar page
	RelativeDates.highlightCurrentDate = function() {
		var subheadings = document.querySelectorAll(".folder.subheading, .datelabel");
		for (var i = 0; i < subheadings.length; i++) {
			var element = subheadings[i];
			var text = RelativeDates.getTextContent(element);
			if (!text) {
				continue;
			}
			text = text.trim().replace(/\n.*/gi, "");
			if (text.match(/[0-9]{1,2}-[0-9]{1,2}/)) {
				// then this is a date
				var today = RelativeDates.getToday();
				var tokens = text.split(/-/);
				var month = parseInt(tokens[0], 10);
				var day = parseInt(tokens[1], 10);
				if (month == today.getMonth() + 1 && day == today.getDate()) {
					var td = RelativeDates.getParent(element, "td");
					if (td) {
						td.classList.add("today");
						td.id = "today";
					} else {
						element.classList.add("today");
						element.id = "today";
					}

					if (location.hash == "#today") {
						// this line might seem useless, but re-setting the #hash makes
						// the browser jump down to the element with that newly-set id
						location.hash = "#today";
					}
				} else if (month > today.getMonth() + 1 ||
						(month == today.getMonth() + 1 && day > today.getDate())) {
					// let's also set a style on days in the future, just for fun
					var td = RelativeDates.getParent(element, "td");
					if (td) {
						td.classList.add("future");
					} else {
						element.classList.add("future");
					}
				}
			}
		}
	};

	RelativeDates.insertDates = function(element) {
		element = element || document.body;
		
		// inject each date's month/day into "date" spans sequentially
		//                    Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
		var month = 0;
		var day = 0;
		var year = RelativeDates.getWebSiteYear();
		if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
			RelativeDates.DAYS_IN_MONTH[2]++;  // leap years
		}

		var today = RelativeDates.getToday();
		var tomorrow = RelativeDates.getToday();
		tomorrow.setDate(today.getDate() + 1);
		var yesterday = RelativeDates.getToday();
		yesterday.setDate(today.getDate() - 1);
		
		if (RelativeDates.WEEK1_SUN) {
			var week1sun = new Date(RelativeDates.WEEK1_SUN);
			if (week1sun) {
				month = week1sun.getMonth() + 1;
				day = week1sun.getDate();
			}
		}

		var dates = element.querySelectorAll(".date");
		for (var i = 0; i < dates.length; i++) {
			var advance = false;
			var element = dates[i];
			if (!RelativeDates.WEEK1_SUN && element.innerHTML) {
				// reference first date in the page
				var tokens = element.innerHTML.split(/\//);
				month = parseInt(tokens[0], 10);
				day = parseInt(tokens[1], 10);
				advance = true;
			} else if (month > 0 && day > 0) {
				element.innerHTML = month + "/" + day;
				advance = true;
			}

			if (advance) {
				day++;
				if (day > RelativeDates.DAYS_IN_MONTH[month]) {
					day = 1;
					month = (month % 12) + 1;
				}
			}

			var td = RelativeDates.getParent(element, "td");
			if (td) {
				var thisDate = new Date(year, month - 1, day);
				if (thisDate > yesterday && thisDate <= today) {
					td.classList.add("today");
				}
			}
		}
	};

	// Shows any "delayed" sections such as labs or sections to pop up on certain dates.
	// Useful for setting up an initially hidden div that will suddenly show up later.
	// Example:
	// <div class="assignmentarea delayed" style="display: none">
	//     <span class="showdate" style="display: none">Dec 6 2011 8:15 AM</span>
	//     ...
	// </div>
	RelativeDates.processDelayedContent = function(element) {
		element = element || document.body;
		RelativeDates.setupReferenceDates();
		var queryParams = RelativeDates.getQueryParams();
		if (queryParams["debug"]) {
			console.log("looking for delayed content in element: " + element);
		}
		
		var changed = false;
		var delayedElements = element.querySelectorAll(".delayed");
		if (!delayedElements) {
			return;
		}
		if (element.classList && element.classList.contains("delayed")) {
			delayedElements.unshift(element);
		}
		
		for (var i = 0; i < delayedElements.length; i++) {
			var delayedElement = delayedElements[i];
			var showDateText = "";
			var hideDateText = "";
			RelativeDates.replaceRelativeDate(delayedElement, /* skipInnerHTML */ true);

			// option 1: rel attribute with the date/time to show it
			var rel = delayedElement.getAttribute("rel") || "";
			if (rel && RelativeDates.hasAbsoluteDate(rel)) {
				showDateText = rel;
			}

			// option 2: another class attribute with the date/time to show it
			if (!showDateText) {
				for (var j = 0; j < delayedElement.classList.length; j++) {
					var cssClass = delayedElement.classList.item(j);
					if (cssClass.match(/delayed_/) || cssClass.match(/showdate_/)) {
						// "delayed_May_24_2011_11__00_PM"
						showDateText = cssClass.replace(/delayed_/, "").replace(/showdate_/, "");
						showDateText = showDateText.replace(/__/g, ":");
						showDateText = showDateText.replace(/_/g, " ");
						break;
					}
				}
			}

			// option 3: a span with the date/time to show it
			if (!showDateText) {
				var showDateSpan = delayedElement.querySelector(".showdate");
				if (showDateSpan) {
					showDateText = showDateSpan.innerHTML || showDateSpan.getAttribute("rel");
					if (showDateSpan.classList.contains("showdate_second_pass")) {
						showDateSpan.classList.remove("showdate_second_pass");
					} else if (showDateSpan.innerHTML && ((!queryParams["ta"] && !queryParams["debug"]) || queryParams["clean"])) {
						showDateSpan.parentNode.removeChild(showDateSpan);
					}
				}
			}

			// can also have a "hide date" where the element will go away
			var hideDateSpan = delayedElement.querySelector(".hidedate");
			if (hideDateSpan) {
				hideDateText = hideDateSpan.innerHTML || hideDateSpan.getAttribute("rel");
				if (hideDateSpan.classList.contains("hidedate_second_pass")) {
					hideDateSpan.classList.remove("hidedate_second_pass");
				} else if (showDateSpan && showDateSpan.innerHTML && ((!queryParams["ta"] && !queryParams["debug"]) || queryParams["clean"])) {
					hideDateSpan.parentNode.removeChild(hideDateSpan);
				}
			} else {
				for (var j = 0; j < delayedElement.classList.length; j++) {
					var cssClass = delayedElement.classList.item(j);
					if (cssClass.match(/hidedate_/)) {
						// "hidedate_May_24_2011_11__00_PM"
						hideDateText = cssClass.replace(/hidedate_/, "");
						hideDateText = hideDateText.replace(/__/g, ":");
						hideDateText = hideDateText.replace(/_/g, " ");
						break;
					}
				}
			}

			if (!showDateText && !hideDateText) {
				if (queryParams["debug"]) {
					console.log("skipping delayed element because no show/hide date text: " + delayedElement + " id=" + delayedElement.id + " class=" + delayedElement.className + ", display=" + delayedElement.style.display);
				}
				continue;
			}
			
			var now = RelativeDates.getToday();
			if (showDateText) {
				var showDate = new Date(showDateText);
				if (showDate) {
					if (queryParams["ta"] || now >= showDate) {
						if (delayedElement.style.display != "") {
							changed = true;
						}
						delayedElement.style.display = "";
						delayedElement.style.visibility = "";
						if (queryParams["debug"]) {
							if (queryParams["ta"]) {
								console.log("showing (because of TA flag): " + delayedElement + " id=" + delayedElement.id + " class=" + delayedElement.className + ", display=" + delayedElement.style.display);
							} else {
								console.log("showing (because today is " + now + ", which is after " + showDate + "): " + delayedElement + " id=" + delayedElement.id + " class=" + delayedElement.className + ", display=" + delayedElement.style.display);
							}
						}
					} else {
						if (queryParams["debug"]) {
							console.log("NOT showing (because today is " + now + ", which is not after " + showDate + "): " + delayedElement + " id=" + delayedElement.id + " class=" + delayedElement.className + ", display=" + delayedElement.style.display);
						}
					}
				}

				if (showDateSpan && queryParams["ta"] && now < showDate) {
					showDateSpan.classList.add("showdatevisible");
					showDateSpan.title = "This content on the page will become visible to the students at the given date/time: " + showDate;
					if (delayedElement.style.display != "") {
						changed = true;
					}
					showDateSpan.style.display = "";
					delayedElement.style.visibility = "";
				}
			}

			if (hideDateText) {
				var hideDate = new Date(Date.parse(hideDateText));
				if (hideDate && now >= hideDate) {
					if (delayedElement.style.display != "none") {
						changed = true;
					}
					delayedElement.parentNode.removeChild(delayedElement);
				}
			}
		}

		if (changed) {
			// run again after browser has laid out other previously hidden content,
			// which is needed if there are any nested "delayed" elements (for some reason)
			setTimeout(function() { RelativeDates.processDelayedContent(element); }, 50);
		}
	};
	
	RelativeDates.hasAbsoluteDate = function(str) {
		var date = new Date(str);
		return !isNaN(date.getTime());
	};
	
	RelativeDates.hasRelativeDate = function(str) {
		var datePattern = /week[_]*(\d+)[_ ]*(sun|mon|tue|wed|thu|fri|sat)/i;
		var match = str.match(datePattern);
		return !!(match && match.length >= 2);
	};
	
	RelativeDates.replaceRelativeDateInString = function(str, style) {
		style = style || "short";
		var datePattern = /week[_ ]*(\d+)[_ ]*(sun|mon|tue|wed|thu|fri|sat)/i;
		var match = str.match(datePattern);
		if (match && match.length >= 3) {
			// regex match returns array of numbered parts matching () groups
			// match = ["Week2 Fri", "2", "Fri"]
			var dateString = "Week" + match[1] + " " + match[2][0].toUpperCase() + match[2].substring(1).toLowerCase();
			if (RelativeDates.DATES[dateString]) {
				var date = RelativeDates.DATES[dateString];

				var year = date.getYear();
				if (year < 1000) {
					// non-IE<=8 returns year since 1900; IE<=8 returns actual year
					year += 1900;
				}

				var newDateString;
				if (style == "longest") {
					newDateString = RelativeDates.DAYS_OF_WEEK[date.getDay()] + ", " +
							RelativeDates.MONTHS_OF_YEAR[date.getMonth()] + " " + date.getDate() +
							", " + year;
				} if (style == "long") {
					newDateString = RelativeDates.DAYS_OF_WEEK[date.getDay()] + ", " +
							RelativeDates.MONTHS_OF_YEAR[date.getMonth()] + " " + date.getDate();
				} else if (style == "short") {
					if (typeof(RelativeDates.DAYS_OF_WEEK[date.getDay()]) != "undefined"
							&& typeof(RelativeDates.MONTHS_OF_YEAR[date.getMonth()]) != "undefined") {
						newDateString = RelativeDates.DAYS_OF_WEEK[date.getDay()].substring(0, 3) +
								" " + RelativeDates.MONTHS_OF_YEAR[date.getMonth()].substring(0, 3) +
								" " + date.getDate();
					}
				} else if (style == "numeric") {
					var monthStr = "" + (date.getMonth() + 1);
					var dayStr = "" + date.getDate();
					
					// zero-pad
					if (monthStr.length < 2) { monthStr = "0" + monthStr; }
					if (dayStr.length < 2) { dayStr = "0" + dayStr; }
					
					newDateString = monthStr + "/" + dayStr;
				} else {
					if (typeof(RelativeDates.DAYS_OF_WEEK[date.getDay()]) != "undefined"
							&& typeof(RelativeDates.MONTHS_OF_YEAR[date.getMonth()]) != "undefined") {
						newDateString = RelativeDates.DAYS_OF_WEEK[date.getDay()].substring(0, 3) +
								" " + RelativeDates.MONTHS_OF_YEAR[date.getMonth()].substring(0, 3) +
								" " + date.getDate() +
								" " + year;
					}
				}
				str = str.replace(datePattern, newDateString);
			}
		}
		return str;
	};

	// Replaces any element inner text that contains a relative date such as "Week2 Fri"
	// with the actual absolute date such as "Fri Mar 17".
	RelativeDates.replaceRelativeDate = function(element, skipInnerHTML) {
		if (!element) {
			return;
		}
		RelativeDates.setupReferenceDates();
		
		var text = element.getAttribute("rel") || RelativeDates.getTextContent(element);
		var style = "longest";
		if (RelativeDates.hasRelativeDate(text)) {
			if (element.classList.contains("insertdatelong")) style = "long";
			if (element.classList.contains("insertdateshort")) style = "short";
			if (element.classList.contains("insertdatenumeric")) style = "numeric";
			text = RelativeDates.replaceRelativeDateInString(text, style);
			element.setAttribute("rel", text);
			if (skipInnerHTML !== true) {
				RelativeDates.setTextContent(element, text);
			}
		}
	};

	// auto-insert dates on "date" spans
	RelativeDates.replaceRelativeDates = function(element) {
		element = element || document.body;
		RelativeDates.setupReferenceDates();
		
		// look for relative date in 'rel' attribute
		var rel = element.getAttribute("rel") || "";
		if (rel && RelativeDates.hasRelativeDate(rel)) {
			rel = RelativeDates.replaceRelativeDateInString(rel);
			element.setAttribute("rel", rel);
		}
		
		var replaceElements = element.querySelectorAll(".insertdate, .insertdateshort, .dateshort, .showdate, .hidedate");
		for (var i = 0; i < replaceElements.length; i++) {
			RelativeDates.replaceRelativeDate(replaceElements[i]);
		}
	};

	// <span class="showdate" style="display: none">Week1 Fri 8:00 AM</span>
	// Due <span class="insertdate" rel="Week2 Wed"></span>, 11:30pm. <br />
	RelativeDates.setupReferenceDates = function() {
		if (RelativeDates.WEEK1_SUN) {
			return;   // prevent multiple initialization
		}
		if (typeof(RelativeDates.WEEK1_SUN) == "undefined" || RelativeDates.WEEK1_SUN === null || RelativeDates.WEEK1_SUN == "") {
			// check for a global variable
			if (window.WEEK1_SUN) {
				if (typeof(window.WEEK1_SUN) == "string") {
					RelativeDates.WEEK1_SUN = window.WEEK1_SUN;
				} else if (typeof(window.WEEK1_SUN.getAttribute) != "undefined") {
					RelativeDates.WEEK1_SUN = window.WEEK1_SUN.getAttribute("content");
				}
			} else if (localStorage && localStorage["WEEK1_SUN"]) {
				// localStorage variable (can be set in JS)
				RelativeDates.WEEK1_SUN = localStorage["WEEK1_SUN"];
			} else if (document.getElementById("WEEK1_SUN")) {
			// check for a DOM element with that ID
				RelativeDates.WEEK1_SUN = new Date(Date.parse(document.getElementById("WEEK1_SUN").getAttribute("content") || document.getElementById("WEEK1_SUN").getAttribute("rel") || document.getElementById("WEEK1_SUN").innerHTML));
			} else {
				var meta = document.querySelector("meta[name='WEEK1_SUN']");
				if (meta) {
					// meta tag in page header (this is what Marty's course web sites use)
					RelativeDates.WEEK1_SUN = meta.getAttribute("content");
				} else {
					// parameter in URL query string
					var queryParams = RelativeDates.getQueryParams();
					if (queryParams["WEEK1_SUN"]) {
						RelativeDates.WEEK1_SUN = queryParams["WEEK1_SUN"];
					}
				}
			}
		}
		if (typeof(RelativeDates.WEEK1_SUN) == "undefined" || !RelativeDates.WEEK1_SUN) {
			console.log("No WEEK1_SUN variable found.  Unable to compute relative dates.");
			return;
		}

		// set up reference dates of the week for each week of the quarter
		var week1sun = new Date(RelativeDates.WEEK1_SUN);
		var week0sun = new Date(RelativeDates.WEEK1_SUN);
		week0sun.setTime(week0sun.getTime() - RelativeDates.ONE_WEEK_MS);   // rewind by 7 days
		
		for (var week = 0; week <= 20; week++) {
			for (var day = 0; day < RelativeDates.DAYS_OF_WEEK.length; day++) {
				var template = week == 0 ? week0sun : week1sun;
				var date2 = new Date(template);
				RelativeDates.DATES["Week" + week + " " + RelativeDates.DAYS_OF_WEEK[day].substring(0, 3)] = date2;
				template.setDate(template.getDate() + 1);   // handles month wrapping
			}
		}
	};

	// for debugging; shows all delayed elements on the page.
	RelativeDates.showDelayed = function(element) {
		element = element || document.body;
		var delayedElements = document.querySelectorAll(".delayed");
		for (var i = 0; i < delayedElements.length; i++) {
			var element = delayedElements[i];
			element.style.display = "";
			element.style.visibility = "";
		}
	};
	
	// This is "main", the main function of code that runs when the page loads.
	RelativeDates.initialize = function() {
		RelativeDates.replaceRelativeDates();
		// RelativeDates.insertDates();   // only used in CS 194

		// show any "delayed" links such as labs or sections to pop up on certain dates
		RelativeDates.processDelayedContent();

		// put up a warning if this is not the current quarter's web site
		RelativeDates.checkPageOutOfDate();

		if (location.href.match(/lectures.[s]?html/)) {
			RelativeDates.highlightCurrentDate();
		}
	};
	// window.addEventListener("load", RelativeDates.initialize);
	/// DATE FUNCTIONS END ///
}
