# megaTable.js
displaying infinite sized tables with fixed number of dom elements

## Why?
Simple:
** The browser cannot handle a huge number of elements
** Tables are one of the most resource intensive elements for general layout
** Need
I found myself working on projects for some big companies who would throw money at a simple
problem that apparently couldn't be solved: table size would limit what the browser could do.
They needed big reports, but interfaces, tons of data.  Any sort of ui component that would trigger redraw
would cause the browser to fall flat on it's face for the end user.  This peaked when I was working on
a spreadsheet interface for a bank who calculated loan projections in a huge spreadsheet.

It seemed there was no answer.

After thinking about the simple equation that browsers have a hard time handling a large amount of
elements, specifically tables and their cells, I realized that we could shrink the size of the elements
used if we simply recycle them.  Using a finite sized table where we reused the elements on user interaction
(like scrolling, sorting, searching, paging, etc.) would could get rid of this problem all together.  In
practice, we went from having to load nearly a 1,000,000 cells, in over 5 minutes, to loading 100 cells
in under 0.5 seconds (along with 200mb of json).

## Usage:
```javascript
new MegaTable({
	element: document.getElementById('myElement')
});
```

## Settings:
```javascript
{
	/**
	 * element you want mega table in
	 * @type {Element}
	 */
	element: null,

	/**
	 * number of rows you'd like your table to have
	 * @type {Number}
	 */
	rows: 10,

	/**
	 * number of columns you'd like your table to have
	 * @type {Number}
	 */
	columns: 10,

	/**
	 * callback for when a table data element needs updated
	 * @type {Function}
	 * @param {Number} row
	 * @param {Number} column
	 * @param {HTMLTableCellElement} td
	 */
	updateCell: function(row, column, td) {},

	/**
	 * callback for when a table row header element needs updated
	 * @type {Function}
	 * @param {Number} i
	 * @param {HTMLTableCellElement} th
	 */
	updateRowHeader: function(i, th) {},

	/**
	 * callback for when a table column header element needs updated
	 * @type {Function}
	 * @param {Number} i
	 * @param {HTMLTableCellElement} th
	 * @param {HTMLTableColElement} col
	 */
	updateColumnHeader: function(i, th, col) {},

	/**
	 * turns on strict mode so that size comes strictly from col elements
	 * @type {Boolean}
	 */
	strict: false
}
```

## Methods
```
setRowStartIndex(Number trIndex) -> MegaTable
setColumnStartIndex(Number columnIndex) -> MegaTable
update(Number rowIndex, Number columnIndex) -> MegaTable
updateRows(Number rowIndex) -> MegaTable
updateColumns(Number columnIndex) -> MegaTable
newRow(Number trIndex) -> MegaTable
newColumn(Number thIndex) -> MegaTable
removeRow(Number rowIndex) -> MegaTable
removeColumn(Number thIndex) -> MegaTable
forceRedrawRows(Number trIndex) -> MegaTable
forceRedrawColumns(Number thIndex) -> MegaTable
col(Number i) -> HTMLElement
```

## Examples
### Simple
```javascript
new MegaTable({
  element: div
});
```

### Update Value, Rows, and Columns
```javascript
var mt = new MegaTable({
  element: div,
  updateCell: function(row, column, td) {
    td.innerHTML = 'value';
  },
  updateRowHeader: function(i, header) {
    header.innerHTML = i;
  },
  updateColumnHeader: function(i, header) {
    header.innerHTML = i;
  }
});
```

### Using chaining methods
```
mt
  .update(0, 0)
  .removeRow(1)
  .removeColumn(1);
```