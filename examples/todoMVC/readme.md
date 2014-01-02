# Kiss.js TodoMVC Example
Thanks to: [Addy Osmani](https://github.com/addyosmani) for the UI.

## History

* 131228_1030: state-handling has been rewritten to adopt new changes to kiss.
* 131231_1000: The UI hs been modified a bit to achieve a better UserXperience.
* 141201_2200: Addded faded removal of items.
* 141202_0840: Removed develop.json as the app is considered to be matured.
* 141202_0845: Added a slightly modified version (by moving add/remove logic to the item's constructor); it seems to have a **10 %** performance gain on rendering (1000 todos).
* 141202_1045: Bug: in calculating completed items fixed (caused by type conversion of isDone).

## Issues

* **Fixed:** Filters are applied after the content is rendered, this causes a glitch that shows the filered-out items.

## Learned

* Building a real app helps
	* To fix bugs and implement new features in the framework.
	* To understand and internalize the framework.
	* To understand how the community could help in building a framework (lots of usage and testing makes the framework mature).

## Notes

* The **inline usage of O_O.trans** discovered.
* Async module loading delays the inital load, but it too helps with spotting the 'loading glitches'.