# ToDos

* The code for the App should be brief.

* Better collections.

* Dealing with history.

* A bootstrap app.

* Redo the example page, with tabs.

* kiss recipes: a set of examples to demonstrate recipe style programming.


# Plugins

* To communicate with the server.

* Iterator: a plugin to linearly move through a collection.

* To parse custom tags.

* To parse KO like data-binding attribute (without the evaluations of the expressions).

* A UI platform that digests an API based JSON to render standard UI controls. The JSON should be minimal.

* For history.

* A module importer.


# Components

* Observable dictionary.

* Sorted List: With just Add, Remove and Replace methods.

* Filtered Arrays.


# Consider

* Instead of having a single file, multiple modules could be brought together to maintain compatibility.

* A separate 'development' version, that could log all the calls etc.

* Uniform API across controls, elements and plugins.

* Combining multiple plugins to create a new plugin. Might be as simple as "O\_O.plugin(jQuery.AutoComplete).decorate(O\_O.plugins.OnEnter)" Ex: combining the Auto complete jQuery with 'OnEnter Textbox'.


# Goals

* To build a simple and powerful front-end-framework that enables "truly" rapid development.

* It should work well with other libraries; as the goal is to design a host for plugins (mainly UI controls).

* The learning curve should be very small; as unwanted complexity might hurt agility.

* To make it simpler, there won't be any rules but a few conventions.

* Developers doesn't have to think much about the coding pattern (The framework has one itself). <- Developers shouldn't be forced to practice a coding pattern.

* The focus is on the developers ease, in creating and maintaining projects.

* The code should make sense on the first glance. So no gimmicks nor circuses.

* Should easily communicate with the Server (so to reduce the burdens of the front end developer).

	## Design

	* As a platform that load various apps on to a single page.
	
	* Should incorporate emerging technologies as soon as they are standardized. As the goal is agile development.
	
	* As a library that acts as the base to handle modules. I.e. if bootstrap has to be used, jQuery and Bootstrap will be loaded after KISS.
	
	* The code for the App should be brief.


	## Measures

	* Should support bootstrap.
	
	* Should work with backbone.
	
	* Could adapt jQuery UI as is.



# Way

* Use HTML elements as just placeholders for dynamic javascript objects.

* The javascript object is bound to it's html placeholder with a 'keyAttr' (the id attribute or some-other attribute).

* The object trees have a corresponding DOM tree in the html (without child to descendant discrimination). I.e. **App > Main > Control** in the DOM, could be **App{Main: {}, Control {}}** in kiss.

* JS objects without corresponding DOM elements (with the keyAttr=object name) are left intact; and vice versa.

* Plugins referred by JS can handle the corresponding html element.

* The scope is defined in JS.

* A lego like modular architecture with plugs and hosts instead of pub-sub.

* A simple implementation of jquery under the $ symbol, which on demand could be replaced by jquery's $.

* No type checks are fallbacks are to be implemented (on the execution level, not the construction level), as this would ensure structure and maintainability.


# Usage

* The keyAttr can't be a '**$**'.

* The order of properties in the objects, that are passed as parameters matters; they are processed in the order they are declared. So its better to have the init at last.

	## O\_O.box

	* 'el' can't be set inside the constructor.

		### '$' properties

		* Relates to the elements properties such as *html, prop, attr* etc.

		* They could be accessed through the 'element.$' property like $.*property*.

		* Calling a $.*property* with parameters generally sets the value.

		* Calling a $.*property* without parameters generally gets the value.

			#### $.val

			* With input controls, it serializes the given box (generally a form) and returns the data as an object.

	## O\_O.pod
	* Item should be a constructor function.


	## O\_O.value

	* The 'change' is triggered only when the new value doesn't '**===**' the old value.


	## O\_O.trans

	* Could be used inline. Ex: text = O\_O.trans(pluralify)(itemCount)


	## O\_O.listen

	* Don't use listen as private variables of objects; it might cause memory leaks.


	## O\_O.watch

	* Don't use watch as private variables of objects; it might cause memory leaks.


# General

* Constructor functions like O\_O.box and O\_O.pod modifies the passed options object.



# How to kiss (recipe style)

* First define the observable values, with sensible defaults.

* Then define the UI.

* Followed by listeners.

* And at last the UI initiation.


# Structure

* The components communicate through an API.


# Questions

* *Could html be automatically injected for collections, without the needed mark-up in the document?*

* *Could custom tag names be used to identify the class of the objects. Like: **<Collection> <Item> <ScrollBar>** etc?*

* *Could the tag name be used to identify objects instead of their ids?*

* *How does a spreadsheet achieve data bindings?*


# Noted

* HTML's Custom tag-names appear to be case insensitive.

* Duplicate IDs may be used inside a document; but have to be accessed through querySelector, not through getElementById.

* The precedence of the values $.default and $.html etc depends on the 'last declared' value.

* *RequireJs* messed up a lot.

* *Async* module loading slows down the loading.

* Chrome was a lot faster than firefox.


# Decisions

* An element could only have one handler per event; as this would ensure simplicity. If multiple events are needed a host could be used. Or a 'queue' could be made as a plugin.

* Events of O\_O objects are exposed through a O\_O.value name .event, instead of the usual on-off pattern. This is to maintain structure and improve efficiency (as multiple events tend affect a same set of values in slightly different ways). O\_O.listen on this events could act as 'controllers'.

* kiss does not affect the UI, as it's to be a separate concern.


# Performance
## 1000 todos test

* kiss is 2.5x faster than angular in rendering, modifying the items and in changing the state.

* kiss is 4x faster than knockout in rendering.

* Backbone couldn't pull the weight of '1000 todos'. kiss is 230x faster than backbone in rendering, 20x faster in modifying the items and 15x faster in state change.

* kiss took a lot of time with the bulk-modifications right after the page load, but picked up speed, after it warmed up. This could be because of the browser might not have allocated resources as there weren't any bulk operation till then.


## DOM Manipulation

* DOM-manipulation is the most costly process (tuning it will be highly beneficial).

* Removing the node and manipulating it, doesn't seem to bring any performance benefits (checked with .pod.add and .pod.change). The browsers seems to cache the results before rendering it.

* Using document fragments only pays-off when the insertion is more than 200 items (todoMVC items).

* The cost of inserting 1000 todoItems via .list is 840ms, the cost of inserting directly to the pod is 800ms.


# Known issues

* Though some performance check has been done; this is still a proof of concept. So it has to be checked for performance issues, memory leaks etc.

* The DOM isn't gracefully loaded.


# Uses

* Could be used as a report generator like crystal reports.

* Could be used to support drop-in plugins like 'share via facebook' etc.

# Future

* A plugin for undoable values.

* IE11 supports getters and setters; a rewrite might be needed to utilize it.

* A module + plugin manager (with bundling etc).

* Consider not depending on microDOM, as the dependency is very little.

* Adopting the SPA projects' #-less history (this will need the SPA to be adopted completed, as the server has to parse the requests).


# Thoughts

* Plugins may use lower level functions for performance (they don't have to depend on kiss).

* Building kiss entirely over microDOM will allow the easy replacement of microDOM, as microDOM does only simple tasks.
