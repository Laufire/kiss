# kiss
### a super easy framework for front end development

We bet that you will learn it **with in 30 mins**. All you've to have, is the basics of the DOM. Just look at the examples.

Check the examples to see it working. You won't need much help. To understand some basic conecepts the [usage](#usage) section might help.

For an elobarate introduction check the [Notes.md](Notes.md).


## A simple explanation

* kiss matches the id-s of HTML elements simple JS objects, that decide what should be done to the HTML elements.

* kiss uses a handful of simple JS objects (six to be precise) to bind data to the DOM. All you have to do is to pump the data to those objects and see them build your UI.

* The six elements

	* **O_O.box** - it maps to a html element, which could also have children, it applies the data you provide over a HTML element, whose ID matches the name of the box.
	
	* **O_O.value** - a simple JS value, that binds to some part of the UI. Changing it, will affect the DOM element**s** it has been bound too.
	
	* **O_O.pod** - is a **collection** of O_O.box-es, of a same kind. Ex: A contact list or the rows of a spread sheet.
	
	* **O_O.list** - provides a O_O.pod with data. Changes in the list will affect the pod, which is bound to it.
	
	* **O_O.trans** - Alters a O_O.value, so that it could could be applied directly to a UI element. Ex: *{img: "1.jpg"}* could be transformed to *http://example.com/images/1.jpg*, so that it can be applied to an **IMG** tag to be displayed.
	
	* **O_O.listen** - helps with listening to events from the values, pods and the lists.
	

<a name="usage"></a>
## Usage

* The value of the keyAttr *(default: id)* can't be a '**$**'.

* The order of properties in the objects passed as parameters, matters; they are processed in the order they are declared. So its better to have $.init at last.

### O\_O.box

#### '$' properties

* Relates to the elements properties such as *html, prop, attr* etc.

* They could be accessed through the 'element.$' property, like element.$.*property*.

* Calling a $.*property* with parameters generally sets the value.

* Calling a $.*property* without parameters generally gets the value.

##### $.val

* With input controls, it serializes the given box (generally a form) and returns the data as an object.


### O\_O.pod
* options.item should be a constructor function.

* Item's children should be inside the item element.

* Use *options.data* for **static lists**, where as *options.source* to bind a **O\_O.list** for **dynamic lists**.

* pod.items[_id] gives the O_O.box of the item; which could be used to change the props of the box (note: this doesn't change any underlying data).

* When a O\_O.pod has a source O\_O.list; it's better not to use $.set of the items of the pod.

### O\_O.value
* The 'change' is triggered only when the new value doesn't '**===**' the old value.

* A value can be bound to two targets to achieve a two way binding.

### O\_O.list
* **Never**, change the _id attribute of the items.

### O\_O.trans
* Could be used inline. Ex: text = O\_O.trans(pluralify)(itemCount)

### O\_O.listen
* Don't use listen as private variables of objects; it might cause memory leaks.

### O\_O.watch
* Don't use watch as private variables of objects; it might cause memory leaks.


## How to kiss (recipe style)

* First define the observable values, with sensible defaults.

* Then define the UI.

* Followed by listeners.

* And at last the initiation *O\_O.at('root element's keyAttr', the_associated_kissEl, and_a_optional_callback)*.