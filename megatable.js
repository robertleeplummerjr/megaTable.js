/**
 * MegaTable
 * Load infinite sized tables in the browser with a fixed number of elements
 * @constructor
 */
var MegaTable = (function(document) {

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

		for(i in defaults) if (defaults.hasOwnProperty(i)) {
			if (settings[i] === undefined) settings[i] = defaults[i];
		}

		this.rows = settings.rows;
		this.columns = settings.columns;
		this.updateCell = settings.updateCell;
		this.updateRowHeader = settings.updateRowHeader;
		this.updateColumnHeader = settings.updateColumnHeader;
		this.rowIndex = 0;
		this.columnIndex = 0;

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
			var up,
				down,
				detachedRow;

			if (this.rowIndex > rowIndex) {
				up = true;
				down = false;
				this.rowIndex = rowIndex;
			} else if (this.rowIndex < rowIndex) {
				down = true;
				up = false;
				this.rowIndex = rowIndex;
			}

			detachedRow = this._updateRowHeaders(up, down);
			this._updateBody(detachedRow, up, down);
		},

		/**
		 *
		 * @param {Number} columnIndex
		 */
		updateColumns: function (columnIndex) {
			var left,
				right;

			if (this.columnIndex > columnIndex) {
				left = true;
				right = false;
				this.columnIndex = columnIndex;
			} else if (this.columnIndex < columnIndex) {
				right = true;
				left = false;
				this.columnIndex = columnIndex;
			}

			this._updateColumnHeaders(left, right);
			this._updateBody(null, false, false, left, right);
		},

		//used in instantiation
		_createCornerDOM: function (tr) {
			var th = document.createElement('th'),
				col = document.createElement('col');

			tr.appendChild(th);
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
					this.updateCell(rowIndex, columnIndex, td);
				}
			}
		},

		//used in updating
		_updateColumnHeaders: function (left, right) {
			var parent = this.tBody.children[0],
				colGroup = this.colGroup,
				col,
				header;

			if (left) {
				header = parent.lastChild;
				col = colGroup.lastChild;

				parent.removeChild(header);
				colGroup.removeChild(col);

				header.removeAttribute('style');
				header.removeAttribute('class');
				col.removeAttribute('style');

				this.updateColumnHeader(this.columnIndex, header, col);

				//insert before corner
				parent.insertBefore(header, parent.children[0]);
				colGroup.insertBefore(col, colGroup.children[0]);
			} else if (right) {
				header = parent.children[1];
				col = colGroup.children[1];

				parent.removeChild(header);
				colGroup.removeChild(col);

				header.removeAttribute('style');
				header.removeAttribute('class');
				col.removeAttribute('style');

				this.updateColumnHeader(this.columnIndex + parent.children.length, header, col);

				//insert at end
				parent.appendChild(header);
				colGroup.appendChild(col);
			}
		},

		_updateRowHeaders: function (up, down) {
			var parent = this.tBody,
				header;

			if (up) {
				header = parent.lastChild.children[0];

				//we intentionally leave the node detached here because the body manages it
				parent.removeChild(header.parentNode);

				header.removeAttribute('style');
				header.removeAttribute('class');

				this.updateRowHeader(this.rowIndex, header);

				return header.parentNode;
			} else if (down) {
				header = parent.children[1].children[0];

				//we intentionally leave the node detached here because the body manages it
				parent.removeChild(header.parentNode);

				header.removeAttribute('style');
				header.removeAttribute('class');

				this.updateRowHeader(this.rowIndex + parent.children.length, header);

				return header.parentNode;
			}
			return null;
		},

		_moveBottomRowToTop: function (row) {
			var children = row.children,
				max = children.length,
				element,
				i;

			for (i = 1; i < max; i++) {
				element = children[i];

				element.attributes['style'] =
					element.className = '';

				if (element.rowSpan > 0) {
					element.rowSpan = 0;
				}

				if (element.colSpan > 0) {
					element.colSpan = 0;
				}

				this.updateCell(this.rowIndex, i + this.columnIndex, element);
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

				element.removeAttribute('style');
				element.removeAttribute('colSpan');
				element.removeAttribute('rowSpan');
				element.removeAttribute('class');

				this.updateCell(this.rowIndex + this.tBody.children.length, i + this.columnIndex, element);
			}

			this.tBody.insertBefore(row, null);
		},

		_moveRightColumnToLeft: function () {
			this.table.style.visibility = 'hidden';

			var rows = this.tBody.children,
				max = rows.length,
				row,
				tdElement,
				i;

			for (i = 1; i < max; i++) {
				row = rows[i];
				tdElement = row.lastChild;
				row.removeChild(tdElement);

				this.updateCell(this.rowIndex + i, this.columnIndex, tdElement);

				row.insertBefore(tdElement, row.children[1]);
			}

			this.table.style.visibility = '';
		},

		_moveLeftColumnToRight: function () {
			this.table.style.visibility = 'hidden';

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

				this.updateCell(this.rowIndex + i, columnIndexEnd, tdElement);

				row.insertBefore(tdElement, null);
			}

			this.table.style.visibility = '';
		},

		_updateBody: function (row, up, down, left, right) {
			if (up) {
				this._moveBottomRowToTop(row);
			} else if (down) {
				this._moveTopRowToBottom(row);
			} else if (left) {
				this._moveRightColumnToLeft();
			} else if (right) {
				this._moveLeftColumnToRight();
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
		strict: false
	};

	return MegaTable;
})(document);