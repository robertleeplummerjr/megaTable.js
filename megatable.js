/**
 * MegaTable
 * Load infinite sized tables in the browser with a fixed number of elements
 * @constructor
 */
var MegaTable = (function(document) {
	"use strict";

	var charSize = function() {
		var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
			el = document.createElement('span'),
			size;

		el.innerHTML = characters;
		document.body.appendChild(el);

		size = {
			width: el.offsetWidth / characters.length,
			height: el.offsetHeight
		};

		el.parentNode.removeChild(el);

		return size;
	};

	/**
	 *
	 * @param {Object} settings inherits values from MegaTable.defaultSettings
	 * @constructor
	 */
	function MegaTable(settings) {

		var table = this.table = document.createElement('table'),
			colGroup = this.colGroup = document.createElement('colGroup'),
			tBody = this.tBody = document.createElement('tBody'),
			defaults = MegaTable.defaultSettings,
			i;

		this.charSize = charSize();

		for(i in defaults) if (defaults.hasOwnProperty(i)) {
			if (settings[i] === undefined) settings[i] = defaults[i];
		}

		this.rowIndex = 0;
		this.columnIndex = 0;

		this.rows = settings.rows;
		this.columns = settings.columns;
		this.updateCorner = settings.updateCorner;
		this.updateCell = settings.updateCell;
		this.updateRowHeader = settings.updateRowHeader;
		this.updateColumnHeader = settings.updateColumnHeader;

		table.appendChild(colGroup);
		table.appendChild(tBody);

		if (settings.strict) {
			table.style.tableLayout = 'fixed';
			table.style.width = '0px';
		}
		table.className = 'mega-table';

		this._createMegaTableDOM();

		if (settings.element !== null) {
			settings.element.appendChild(table);
		}
	}

	MegaTable.prototype = {
		/**
		 *
		 * @param {Number} rowIndex
		 * @param {Number} columnIndex
		 */
		update: function (rowIndex, columnIndex) {
			this.updateRows(rowIndex);
			this.updateColumns(columnIndex);
		},

		/**
		 * @param {Number} rowIndex
		 */
		updateRows: function (rowIndex) {
			var up = 0,
				down = 0,
				detachedRow;

			if (this.rowIndex > rowIndex) {
				up = this.rowIndex - rowIndex;
			} else if (this.rowIndex < rowIndex) {
				down = rowIndex - this.rowIndex;
			}

			if (up > 0) {
				while (up > 0) {
					this.rowIndex--;
					detachedRow = this._moveBottomRowHeaderToTop();
					this._moveBottomRowToTop(detachedRow);
					up--;
				}
				this._updateCorner();
			}

			else if (down > 0) {
				while (down > 0) {
					this.rowIndex++;
					detachedRow = this._moveTopRowHeaderToBottom();
					this._moveTopRowToBottom(detachedRow);
					down--;
				}
				this._updateCorner();
			}
		},

		/**
		 *
		 * @param {Number} columnIndex
		 */
		updateColumns: function (columnIndex) {
			var left = 0,
				right = 0;

			if (this.columnIndex > columnIndex) {
				left = this.columnIndex - columnIndex;
			} else if (this.columnIndex < columnIndex) {
				right = columnIndex - this.columnIndex;
			}

			if (left > 0) {
				this.table.style.visibility = 'hidden';
				while (left > 0) {
					this.columnIndex--;
					this.moveRightColumnHeaderToLeft();
					this._moveRightColumnToLeft();
					left--;
				}
				this.table.style.visibility = '';
			}

			else if (right > 0) {
				this.table.style.visibility = 'hidden';
				while (right > 0) {
					this.columnIndex++;
					this._moveLeftColumnHeaderToRight();
					this._moveLeftColumnToRight();
					right--;
				}
				this.table.style.visibility = '';
			}
		},

		//used in instantiation
		_createCornerDOM: function (tr) {
			var th = this.cornerTh = document.createElement('th'),
				col = this.cornerCol = document.createElement('col');

			col.style.width = '14px';

			tr.appendChild(th);

			this.updateCorner(th, col);

			this.colGroup.appendChild(col);
		},

		_createColumnHeaderDOM: function () {
			var tr = document.createElement('tr'),
				colGroup = this.colGroup,
				columnIndex = this.columnIndex,
				columns = this.columns,
				i = 0,
				th,
				col;

			this._createCornerDOM(tr);

			this.tBody.appendChild(tr);

			for (; i <= columns; i++) {
				th = document.createElement('th');
				tr.appendChild(th);
				col = document.createElement('col');
				colGroup.appendChild(col);

				this.updateColumnHeader(columnIndex + i, th, col);
			}
		},

		_createRowHeaderDOM: function (tr, i) {
			var th = document.createElement('th');
			this.updateRowHeader(i, th);
			tr.appendChild(th);
		},

		_createMegaTableDOM: function () {
			var tBody = this.tBody,
				max = this.rows,
				rowIndex = this.rowIndex,
				columns = this.columns,
				i = 0,
				columnIndex = 0,
				tr,
				td;

			this._createColumnHeaderDOM();

			for (; i <= max; i++) {
				columnIndex = 0;
				tr = document.createElement('tr');

				this._createRowHeaderDOM(tr, rowIndex + i);

				tBody.appendChild(tr);
				for (; columnIndex <= columns; columnIndex++) {
					td = document.createElement('td');
					tr.appendChild(td);
					this.updateCell(rowIndex + i, columnIndex, td);
				}
			}
		},

		//used in updating
		_updateCorner: function() {
			var tBody = this.tBody,
				col = this.cornerCol,
				targetRow = tBody.lastChild,
				th = targetRow.firstChild,
				newWidth,
				minWidth = 20;

			newWidth = this.charSize.width * (th.textContent || th.innerText).length;
			//set a minimum width, because css doesn't respect this on col in FF
			newWidth = (newWidth > minWidth ? newWidth : minWidth);

			if (newWidth !== col._width || col._width === undefined) {
				col._width = newWidth;
				col.style.width = newWidth + 'px';
			}
		},
		moveRightColumnHeaderToLeft: function() {
			var parent = this.tBody.children[0],
				colGroup = this.colGroup,
				col = colGroup.lastChild,
				header = parent.lastChild;

			parent.removeChild(header);
			colGroup.removeChild(col);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}
			header.removeAttribute('style');
			header.removeAttribute('class');
			col.removeAttribute('style');

			this.updateColumnHeader(this.columnIndex, header, col);

			//insert before corner
			parent.insertBefore(header, parent.children[1]);
			colGroup.insertBefore(col, colGroup.children[1]);
		},
		_moveLeftColumnHeaderToRight: function() {
			var parent = this.tBody.children[0],
				colGroup = this.colGroup,
				col = colGroup.children[1],
				header = parent.children[1];

			parent.removeChild(header);
			colGroup.removeChild(col);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}
			header.removeAttribute('style');
			header.removeAttribute('class');
			col.removeAttribute('style');

			this.updateColumnHeader(this.columnIndex + parent.children.length, header, col);

			//insert at end
			parent.appendChild(header);
			colGroup.appendChild(col);
		},

		_moveBottomRowHeaderToTop: function() {
			var parent = this.tBody,
				header = parent.lastChild.children[0];

			//we intentionally leave the node detached here because the body manages it
			parent.removeChild(header.parentNode);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}
			header.removeAttribute('style');
			header.removeAttribute('class');

			this.updateRowHeader(this.rowIndex, header);

			return header.parentNode;
		},
		_moveTopRowHeaderToBottom: function() {
			var parent = this.tBody,
				header = parent.children[1].children[0];

			//we intentionally leave the node detached here because the body manages it
			parent.removeChild(header.parentNode);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}
			header.removeAttribute('style');
			header.removeAttribute('class');

			this.updateRowHeader(this.rowIndex + parent.children.length, header);

			return header.parentNode;
		},

		_moveBottomRowToTop: function (row) {
			var children = row.children,
				max = children.length,
				element,
				i;

			for (i = 1; i < max; i++) {
				element = children[i];

				while(element.lastChild !== null) {
					element.removeChild(element.lastChild);
				}
				element.removeAttribute('style');
				element.removeAttribute('colSpan');
				element.removeAttribute('rowSpan');
				element.removeAttribute('class');

				this.updateCell(this.rowIndex, this.columnIndex + i - 1, element);
			}

			this.tBody.insertBefore(row, this.tBody.children[1]);
		},

		_moveTopRowToBottom: function (row) {
			var children = row.children,
				max = children.length,
				element,
				i;

			for (i = 1; i < max; i++) {
				element = children[i];

				while(element.lastChild !== null) {
					element.removeChild(element.lastChild);
				}
				element.removeAttribute('style');
				element.removeAttribute('colSpan');
				element.removeAttribute('rowSpan');
				element.removeAttribute('class');

				this.updateCell(this.rowIndex + this.tBody.children.length, this.columnIndex + i - 1, element);
			}

			this.tBody.insertBefore(row, null);
		},

		_moveRightColumnToLeft: function () {
			var rows = this.tBody.children,
				max = rows.length,
				row,
				tdElement,
				i;

			for (i = 1; i < max; i++) {
				row = rows[i];
				tdElement = row.lastChild;
				row.removeChild(tdElement);

				while(tdElement.lastChild !== null) {
					tdElement.removeChild(tdElement.lastChild);
				}

				this.updateCell(this.rowIndex + i - 1, this.columnIndex, tdElement);

				row.insertBefore(tdElement, row.children[1]);
			}
		},

		_moveLeftColumnToRight: function () {
			var rows = this.tBody.children,
				max = rows.length - 1,
				row,
				columnIndexEnd = this.columnIndex + rows[0].children.length,
				tdElement,
				i;

			for (i = 1; i < max; i++) {
				row = rows[i];
				tdElement = row.children[1];
				row.removeChild(tdElement);

				while(tdElement.lastChild !== null) {
					tdElement.removeChild(tdElement.lastChild);
				}

				this.updateCell(this.rowIndex + i - 1, columnIndexEnd, tdElement);

				row.insertBefore(tdElement, null);
			}
		}
	};

	/**
	 *
	 * @type {Object}
	 */
	MegaTable.defaultSettings = {
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
		strict: false,

		updateCorner: function(th, col) {

		}
	};

	return MegaTable;
})(document);