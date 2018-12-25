// A small glue script to help facilitate the creation and usage of Web Components.
// by: Marty Stepp

if (typeof WebComponentsHelper == "undefined" || WebComponentsHelper.isLoaded) {
	"use strict";
	var WebComponentsHelper = function() {};
	WebComponentsHelper.isLoaded = true;

	WebComponentsHelper.createTemplate = function(elementName, options) {
		options = options || {};
		
		if (!options.parent) {
			options.parent = HTMLElement.prototype;
		}
		
		var templateID = "#" + elementName.replace("-", "") + "template";
		var prototype = Object.create(options.parent);
		
		prototype.createdCallback = function() {
			var template = document.querySelector(templateID);
			var clone = document.importNode(template.content, true);
			if (typeof this.createShadowRoot == "function") {
				this.createShadowRoot().appendChild(clone);
			} else {
				// backward compatibilty for old browsers
				this.appendChild(clone);
			}
		};
		
		prototype.attachedCallback = function() {
			var shadowRoot = (typeof this.shadowRoot == "undefined" ? this : this.shadowRoot);
			WebComponentsHelper.fillInTemplate(shadowRoot, WebComponentsHelper.elementToHash(this));
			if (options.attachedCallback) {
				options.attachedCallback(shadowRoot);
			}
		};
		
		document.registerElement(elementName, {"prototype": prototype});
	};

	/**
	 * Reads the given HTML DOM element object and turns its attributes into a hash object which is returned.
	 * For example,
	 * <div id="foo" class="bar" rel="quux"></div>
	 * turns into
	 * {id: "foo", class: "bar", rel: "quux"}
	 */
	WebComponentsHelper.elementToHash = function(element) {
		var hash = {};
		if (!element) {
			return hash;
		}
		for (var i = 0; i < element.attributes.length; i++) {
			var attrName = element.attributes[i].name;
			var attrValue = element.attributes[i].value;
			hash[attrName] = attrValue;
		}
		return hash;
	};

	WebComponentsHelper.fillInAllTemplates = function(template, destination, attrHashList) {
		if (!template || !destination || !attrHashList) {
			return destination;
		}
		for (var i = 0; i < attrHashList.length; i++) {
			var filledInTemplate = WebComponentsHelper.fillInTemplate(template.cloneNode(true), attrHashList[i]);
			destination.appendChild(filledInTemplate);
		}
		
		// remove 'loading' area, if present
		var loadingArea = destination.querySelector(".loadingarea");
		if (loadingArea) {
			loadingArea.parentNode.removeChild(loadingArea);
		}
		
		return destination;
	};

	WebComponentsHelper.fillInTemplate = function(template, attrsHash) {
		if (!template || !attrsHash) {
			return template;
		}

		var elementName = "";;
		if (template.id && template.id.indexOf("template") >= 0) {
			elementName = template.id.replace("template", "");
		}
		if (!elementName) {
			elementName = template.getAttribute("rel");
		}
		if (!elementName) {
			console.log("No element name specified in 'rel' attribute. Exiting.");
			return template;
		}
		
		if (attrsHash["id"]) {
			// avoid id collisions
			template.id += "_" + attrsHash["id"];
		}
		
		var aTags = template.querySelectorAll("a");
		var imgTags = template.querySelectorAll("img");
		var delayedElements = Array.prototype.slice.call(template.querySelectorAll(".delayed"));
		delayedElements.unshift(template);
		for (var attrName in attrsHash) {
			if (!attrsHash.hasOwnProperty(attrName)) { continue; }
			var attrValue = attrsHash[attrName];
			if (typeof attrValue == "function") {
				continue;
			}
			
			var cssSelector = "." + elementName.replace("-", "") + "_" + attrName;
			
			try {
				var elements = template.querySelectorAll(cssSelector);
				for (var j = 0; j < elements.length; j++) {
					elements[j].innerHTML = attrValue;
				}
			} catch (e) {
				// invalid CSS selector
				console.log("WebComponentsHelper.fillInTemplate: Invalid CSS selector: \"" + cssSelector + "\"");
				continue;
			}
			
			// look for {{attr}} in img src and a href attributes (special cases)
			var placeholder = "{{" + elementName.replace("-", "") + "_" + attrName + "}}";
			var placeholderValue = ("" + attrValue).toLowerCase().replace(" ", "-");
			for (var j = 0; j < imgTags.length; j++) {
				if (imgTags[j].src.indexOf(encodeURIComponent(placeholder)) >= 0) {
					// Chrome, Firefox
					imgTags[j].src = imgTags[j].src.replace(encodeURIComponent(placeholder), placeholderValue);
				} else if (imgTags[j].src.indexOf(placeholder) >= 0) {
					// Safari
					imgTags[j].src = imgTags[j].src.replace(placeholder, placeholderValue);
				}
			}
			for (var j = 0; j < aTags.length; j++) {
				if (aTags[j].href.indexOf(encodeURIComponent(placeholder)) >= 0) {
					aTags[j].href = aTags[j].href.replace(new RegExp(encodeURIComponent(placeholder), "g"), placeholderValue);
				} else if (aTags[j].href.indexOf(placeholder) >= 0) {
					aTags[j].href = aTags[j].href.replace(new RegExp(placeholder, "g"), placeholderValue);
				}
			}

			// look for {{attr}} in element's rel attribute (special cases)
			for (var j = 0; j < delayedElements.length; j++) {
				var rel = delayedElements[j].getAttribute("rel") || "";
				if (rel.indexOf(encodeURIComponent(placeholder)) >= 0) {
					rel = rel.replace(new RegExp(encodeURIComponent(placeholder), "g"), placeholderValue);
				} else if (rel.indexOf(placeholder) >= 0) {
					rel = rel.replace(new RegExp(placeholder, "g"), placeholderValue);
				}
				if (rel) {
					delayedElements[j].setAttribute("rel", rel);
				}
			}
		}
		
		// check for shadow DOM on the page to be inserted
		var shadowDomClass = elementName + "_shadowdom_" + attrsHash["id"];
		var shadowRoot = document.querySelector("." + shadowDomClass);
		if (shadowRoot) {
			for (var i = 0; i < shadowRoot.childNodes.length; i++) {
				var child = shadowRoot.childNodes[i];
				if (child.nodeType != 1 || !child.className || !child.classList) { continue; }  // elements only
				for (var j = 0; j < child.classList.length; j++) {
					var className = child.classList[j];
					var insertionPoint = template.querySelector("." + className);
					if (insertionPoint) {
						insertionPoint.appendChild(child);
					}
				}
			}
		}
		
		if (template.classList.contains("webcomponent") && template.style.display == "none") {
			// show the template, if not "delayed"
			if (!template.classList || !template.classList.contains("delayed")) {
				template.style.display = "";
			}
		}
		return template;
	};
}
