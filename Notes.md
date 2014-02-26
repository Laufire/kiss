# kiss
### a library to make app making simple and stupid

## Goal

* To enable the rapid development of plugins that enable maintainable UIs, on the web stack.


## Idea

* Using the same application structure with all the frontend technologies (HTML, JS, CSS)


## ToDos

* O\_O.bind (to bind data to the UI. ? Could O\_O.value be used instead?).

* An example to demonstrate the features; it could serve as a stability tester, during development.

* Redo O\_O.pod.item to resemble box construction, without modifying the object.

* A custom toggle (with data bindings).

* \n instead of \r\n at the next stable release (as git treats all the lines ad modified, diff-ing wouldn't be possible).

* default event for contenteditable tags: blur.

* O\_O.kebab

* A cheat sheet.

* A bootstrap app.

* Redo the example page, with tabs.

* kiss recipes: a set of examples to demonstrate recipe style programming.


## Issues

* Compressing breaks the code; where as mangling works fine.


## Plugins

* O\_O.filter.

* O\_O.masterList: to handle complex data interactions like undoing etc. This is achieved by passing models between multiple (child-)lists.

* Limited pod (a pod with a limited number of items, to enable pagination, infinite scrolling etc), in which removed nodes are cached for reuse.

* Labeled checkbox.

* To communicate with the server.

* Iterator: a plugin to linearly move through a collection (like a slide show).

* To parse custom tags.

* To parse KO like data-binding attribute (without the evaluations of the expressions).

* A UI platform that digests an API based JSON to render standard UI controls. The JSON should be minimal.

* O\_O.sync to snyc a O\_O.value to a store (localStorage / cloud / DB)


## Consider

* O\_O.bind, to bind a behavior with different params (like calculator buttons).

* returning FormData of forms with $.val calls on form elements.

* Instead of having a single file, multiple modules could be brought together to maintain compatibility.

* A separate 'development' version, that could log all the calls etc.

* Uniform API across controls, elements and plugins.

* Combining multiple plugins to create a new plugin. Might be as simple as "O\_O.plugin(jQuery.AutoComplete).decorate(O\_O.plugins.OnEnter)" Ex: combining the Auto complete jQuery with 'OnEnter Textbox'.


## Goals

* To build a simple and powerful front-end-framework that enables "truly" rapid development.

* To achieve scalability, performance and flexibility through the simplicity of design.

* It should work well with other libraries; as the goal is to design a host for plugins (mainly UI controls).

* The learning curve should be very small; as unwanted complexity might hurt agility.

* To make it simpler, there won't be any rules but a few conventions.

* Developers doesn't have to think much about the coding pattern (The framework has one itself). <- Developers shouldn't be forced to practice a coding pattern.

* The focus is on the developers ease, in creating and maintaining projects.

* The code should make sense on the first glance. So no gimmicks, nor circuses.

* Should easily communicate with the Server (so to reduce the burdens of the front end developer).

	### Design

	* As a platform that load various apps on to a single page.
	
	* As a low-level library that could serve as the base for other libraries.
	
	* Should incorporate emerging technologies as soon as they are standardized. As the goal is agile development.
	
	* As a library that acts as the base to handle modules. I.e. if bootstrap has to be used, jQuery and Bootstrap will be loaded after KISS.
	
	* The code for the App should be brief.

	### Measures

	* Should support bootstrap.
	
	* Should work with backbone.
	
	* Could adapt jQuery UI as is.


## Way

* Use HTML elements as just placeholders for dynamic javascript objects.

* The javascript object is bound to it's html placeholder with a 'keyAttr' (the id attribute or some-other attribute).

* The object trees have a corresponding DOM tree in the html (without child to descendant discrimination). I.e. **App > Main > Control** in the DOM, could be **App{Main: {}, Control {}}** in kiss.

* JS objects without corresponding DOM elements (with the keyAttr=object name) are left intact; and vice versa.

* Plugins referred by JS can handle the corresponding html element.

* The scope is defined in JS.

* A lego like modular architecture with plugs and hosts instead of pub-sub.

* A simple implementation of jquery under the $ symbol, which on demand could be replaced by jquery's $.

* No type checks are fallbacks are to be implemented (on the execution level, not the construction level), as this would ensure structure and maintainability.


## Usage

* The keyAttr can't be a '**$**'.

* The order of properties in the objects, that are passed as parameters matters; they are processed in the order they are declared. So its better to have the init at last.

	### O\_O.box
	* 'el' can't be set inside the constructor.

		#### '$' properties

		* Relates to the elements properties such as *html, prop, attr* etc.

		* They could be accessed through the 'element.$' property like $.*property*.

		* Calling a $.*property* with parameters generally sets the value.

		* Calling a $.*property* without parameters generally gets the value.

			##### $.val

			* With input controls, it serializes the given box (generally a form) and returns the data as an object.

			
	### O\_O.pod
	* options.item should be a constructor function.
	
	* Item's children should be inside the item element.
	
	* Use *options.data* for **static lists**, where as *options.source* for **dynamic lists**.
	
	* Passing 'undefined' values to the item constructors will cause the properties to be missed pass '{}' instead.
	
	### O\_O.value
	* The 'change' is triggered only when the new value doesn't '**===**' the old value.
	
	### O\_O.list
	* **Never**, change the _id attribute of the items.

	### O\_O.trans
	* Could be used inline. Ex: text = O\_O.trans(pluralify)(itemCount)

	### O\_O.listen
	* Don't use listen as private variables of objects; it might cause memory leaks.

	### O\_O.watch
	* Don't use watch as private variables of objects; it might cause memory leaks.

	
## Tips

* Use the $.$el to set static properties; as they are faster and chainable.

* Use $.$el.<methods> to work around default kiss functionalities like 'one handler per event'. **But use it only when it's absolutely necessary, as this coud break the structure**.


## General

* Constructor functions like O\_O.box and O\_O.pod modifies the passed options object.


## How to kiss (recipe style)

* First define the observable values, with sensible defaults.

* Then define the UI.

* Followed by listeners.

* And at last the UI initiation.


## Structure

* The components communicate through an API.

* Classes are to be with the bare minimum of functionality, in order to avoid bloating. Needed futures could be added through extensions.


## Questions

* *Could html be automatically injected for collections, without the needed mark-up in the document?*

* *Could custom tag names be used to identify the class of the objects. Like: **<Collection> <Item> <ScrollBar>** etc?*

* *Could the tag name be used to identify objects instead of their ids?*

* *How does a spreadsheet achieve data bindings?*


## Noted

* HTML's Custom tag-names appear to be case insensitive.

* Duplicate IDs may be used inside a document; but have to be accessed through querySelector, not through getElementById.

* The precedence of the values $.default and $.html etc depends on the 'last declared' value.

* *RequireJs* messed up a lot.

* *Async* module loading slows down the loading.

* Chrome was a lot faster than firefox.

* As of 140221, O\_O.object and O\_O.watch weren't used, even once.

* Code Mangling is safer than code compression. As the structure is left intact (Code mangled by uglify.js works fine, where as the compressed fails).

* _id cannot be updated in Mongo.


## Decisions

* Native objects are not to be extended, in oder to avoid collisions other libraries.

* An element could only have one handler per event; as this would ensure simplicity. If multiple events are needed, a host handler could be used. Or a 'queue' could be made as a plugin.

* Events of O\_O objects are exposed through a O\_O.value name .event, instead of the usual on-off pattern. This is to maintain structure and improve efficiency (as multiple events tend affect a same set of values in slightly different ways). O\_O.listen on this events could act as 'controllers'.

* kiss does not affect the UI, as it's to be a separate concern.

* Plugins do not replace their placeholder tags (as this might bring in unwanted complexities); but they still could by injecting code with a custom **$.at** method.

* The base classes weren't checked for extensibility; as it's thought that extensions to the core could make the lib complex and unexpected, thus unusable.

* O\_O.list won't have methods or events related to sorting.

* O\_O.pod item is to be a constructor function, as it simplifies every-day coding. Though it makes extensions to the the 'item' harder; there still has ways to extend the 'item' (ref: O\_O.podSelect).


## Performance
### 1000 todos test

* kiss is 2.5x faster than angular in rendering, modifying the items and in changing the state.

* kiss is 4x faster than knockout in rendering.

* Backbone couldn't pull the weight of '1000 todos'. kiss is 230x faster than backbone in rendering, 20x faster in modifying the items and 15x faster in state change.

* kiss took a lot of time with the bulk-modifications right after the page load, but picked up speed, after it warmed up. This could be because of the browser might not have allocated resources as there weren't any bulk operation till then.

### Possible improvements

* document.getElementById is considerabbly faster than querySelectors; but it needs unique ids. Unique ids could be enabled by using IdMaps and having data-id as the keyAttr.

* After some performance tuning microDOM's overhead is 61ms on 1000 todos, previoulsy it was 107 ms.

* Getting rid of microDOM could improve the performance, **but** it could bring some other slower alternative, thus could cause more harm.

* If kiss could stop at providing the structure, it could surpass the speed of pureJs *(by providing the structure and by preventing from pitfalls)*

* Not depending on microDOM, **for the internals** will improve the **init time** by reducing the need for constructing $ objects, and the **update time** by removing the layer.

* Hard-coding the internals (using for loops instead of enumerate) etc will increase the performance.

* Prototyping/cloning/sharing the item constructor of .pod could improve the performance. (.box construction seems to take 80% of the initial execution, it's almost 4x costlier than DOM manipulation)

* .pod.item-s could be compiled / fabricated (in a factory) to increase init/change performances. Even, .box-es could be compiled.


### DOM Manipulation

* DOM-manipulation is the most costly process (tuning it will be highly beneficial).

* Removing the node and manipulating it, doesn't seem to bring any performance benefits (checked with .pod.add and .pod.change). The browsers seems to cache the results before rendering it.

* Using document fragments only pays-off when the insertion is more than 200 items (todoMVC items).

* The cost of inserting 1000 todoItems via .list is 840ms, the cost of inserting directly to the pod is 800ms.


## Known issues

* Though some performance check has been done; this is still a proof of concept. So it has to be checked for performance issues, memory leaks etc.

* kiss is not yet unit tested.


## Uses

* Could be used as a report generator like crystal reports.

* Could be used to support drop-in plugins like 'share via facebook' etc.


## Future

* A plugin for undoable values.

* When IE11 supports getters and setters; a rewrite could be done to utilize it.

* Wait for Object.observe.

* The code could be low-leveled for performance (ie: removing the higher level abstractions like enumerate).

* A module + plugin manager (with bundling etc).

* Consider not depending on microDOM, as the dependency is very little.

* Adopting the SPA projects' #-less history (this will need the SPA to be adopted completed, as the server has to parse the requests).


## Thoughts

* **Animations**.

* Wiring the default events to the triggers of 'flow'.

* First line of every function could be logger.

* Plugins may use lower level functions for performance (they don't have to depend on kiss).

* Building kiss entirely over microDOM will allow the easy replacement of microDOM, as microDOM does only simple tasks.

* If jQuery were to be used instead of microDOM, a wrapper over jQuery may be built to suuport the microDOM API. Or they might work along.

* Data driven UI: using JSON + OOCSS + Build Tools (could be built for target browsers).

* Getters and Setters along with Object.observe could simplify the structure of kiss.
