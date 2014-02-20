# Kiss.js TodoMVC Example
Thanks to: [Addy Osmani](https://github.com/addyosmani) for the UI.

## History

* 131228_1030	state-handling has been rewritten to adopt new changes to kiss.
* 131231_1000	The UI hs been modified a bit to achieve a better UserXperience.
* 140101_2200	Addded faded removal of items.
* 140102_0840	Removed develop.json as the app is considered to be matured.
* 140102_0845	Added a slightly modified version (by moving add/remove logic to the item's constructor); it seems to have a **10 %** performance gain on rendering (1000 todos).
* 140102_1045	Bug fixed: in calculating completed items fixed (caused by type conversion of isDone).
* 140104_0830	Found that the modified version has the same performance as the other version.
* 140220_2255	Brought main.js, out of its sand-box to make it easier to debug.


## Issues

* **Fixed:** Filters are applied after the content is rendered, this causes a glitch that shows the filered-out items.


## Notes

* The **inline usage of O_O.trans** discovered.
* Async module loading delays the inital load, but it too helps with spotting the 'loading glitches'.
* Performance inprovement discovered: Passing nodes to the .box.at instead of query strings, improves the performance.


## Learned

* Building a real app helps
	* To fix bugs and implement new features in the framework.
	* To discover.
	* To understand and internalize the framework.
	* To understand how the community could help in building a framework (lots of usage and testing makes the framework mature).
	
* DOM manipulation is not the performance dragger, but object construction is.


## Performance init/modifing timings in milliseconds (on 1000 todos test)

* pureJs	93 / 31

* microDOM	203 / 62

* kiss / kiss(alt)	436 / 140

* angular	2465 / 220 (on toggle all)
