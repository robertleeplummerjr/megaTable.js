var tf = new Testify("megaTable.js");

tf.test("scroll down", function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5
        }),
        row = mt.tBody.children[1];


    tf.assertEquals(row.rowIndex, 1, "Top row starts at top");

    mt.updateRows(1);

    tf.assertEquals(row.rowIndex, 5, "megaTable scrolls one down, and now top row is at bottom");
});

tf.test("scroll up", function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5
        }),
        topRow = mt.tBody.children[1];

    mt.updateRows(1);

    tf.assertEquals(topRow.rowIndex, 5, "Bottom row starts at bottom");

    mt.updateRows(0);

    tf.assertEquals(topRow.rowIndex, 1, "scroll one up, and now bottom row is at top");
});

tf.test("scroll right", function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5
        }),
        colGroup = mt.colGroup,
        tBody = mt.tBody,
        col = colGroup.children[1],
        column = [],
        i = 0;

    tf.assertSame(col, colGroup.children[1], "left col starts at left");

    for (; i < 5;i++) {
        column.push(tBody.children[i].children[1]);
        tf.assertEquals(1, tBody.children[i].children[1].cellIndex, "left column starts at left");
    }

    mt.updateColumns(1);

    tf.assertSame(col, colGroup.children[5], "left col is now at right");

    for (i = 0; i < 5;i++) {
        tf.assertEquals(5, column[i].cellIndex, "scroll right one, and not left column is at right");
    }

});

tf.test("scroll left", function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5
        }),
        colGroup = mt.colGroup,
        tBody = mt.tBody,
        col = colGroup.children[1],
        column = [],
        i = 0;

    mt.updateColumns(1);

    tf.assertSame(col, colGroup.children[5], "right col starts at right");

    for (; i < 5;i++) {
        column.push(tBody.children[i].children[5]);
        tf.assertEquals(5, tBody.children[i].children[5].cellIndex, "right column starts at right");
    }

    mt.updateColumns(0);

    tf.assertSame(col, colGroup.children[1], "scroll left one, and right col is now at left");

    for (i = 0; i < 5;i++) {
        tf.assertEquals(1, column[i].cellIndex, "now right column is at left");
    }

});

tf.test("redraw rows", function(tf) {
    var el = document.createElement('div'),
        i = 0,
        j = 0,
        k = 0,
        mt = new MegaTable({
            element: el,
            rows: 4,
            columns: 4,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = i++;
                }
            },
            updateRowHeader: function(_i, th) {
                if (this.initiated) {
                    th.innerHTML = i++;
                }
            }
        });

    mt.forceRedrawRows();

    tf.assertEquals(20, i, 'correct number of redraws were made');

    for (i = 1; i <= 4;i++) {
        tf.assertEquals(k++, mt.tBody.children[i].children[0].innerHTML, "row header forced redraw in right order");
    }

    for (i = 1; i <= 4;i++) {
        for (j = 1; j <= 4; j++) {
            tf.assertEquals(k++, mt.tBody.children[i].children[j].innerHTML, "row cells forced redraw in right order");
        }
    }

});

tf.test("redraw columns", function(tf) {
    var el = document.createElement('div'),
        i = 0,
        j = 0,
        k = 0,
        mt = new MegaTable({
            element: el,
            rows: 4,
            columns: 4,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = i++;
                }
            },
            updateColumnHeader: function(_i, th) {
                if (this.initiated) {
                    th.innerHTML = i++;
                }
            }
        });

    mt.forceRedrawColumns();

    tf.assertEquals(20, i, 'correct number of redraws were made');

    for (i = 1; i < 5;i++) {
        tf.assertEquals(k++, mt.tBody.children[0].children[i].innerHTML, "column header forced redraw in right order");
    }

    for (j = 1; j < 5;j++) {
        for (i = 1; i < 5; i++) {
            tf.assertEquals(k++, mt.tBody.children[i].children[j].innerHTML, "column cells forced redraw in right order");
        }
    }

});

tf.test('row insertion @ 0', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted';
                }
            }
        }),
        tBody = mt.tBody;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.newRow(0);
    tf.assertEquals(tBody.children[1].textContent, 'insertedinsertedinsertedinsertedinserted', "top row has been inserted correctly");
});

tf.test('row insertion @ 2', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted';
                }
            }
        }),
        tBody = mt.tBody;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.newRow(2);
    tf.assertEquals(tBody.children[3].textContent, 'insertedinsertedinsertedinsertedinserted', "top row has been inserted correctly");
});

tf.test('column insertion', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted';
                }
            }
        }),
        tBody = mt.tBody,
        i = 1;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.newColumn(0);

    for(;i <= 5; i++) {
        tf.assertEquals(tBody.children[i].children[1].textContent, 'inserted', "left column has been inserted correctly");
    }
});

tf.test('column insertion @ 2', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted';
                }
            }
        }),
        tBody = mt.tBody,
        i = 1;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.newColumn(2);

    for(;i <= 5; i++) {
        tf.assertEquals(tBody.children[i].children[3].textContent, 'inserted', "left column has been inserted correctly");
    }
});

tf.test('row insertion @ 0 after scrolling 5 down', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted' + r + c;
                }
            },
            updateRowHeader: function(r, th) {
                if (this.initiated) {
                    th.innerHTML = r + '';
                }
            },
            updateColumnHeader: function(c, th, col) {
                if (this.initiated) {
                    th.innerHTML = c + '';
                }
            }
        }),
        tBody = mt.tBody;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.updateRows(5);
    mt.newRow(0);
    tf.assertEquals(tBody.children[1].textContent, '5inserted50inserted51inserted52inserted53inserted54', "top row has been inserted correctly");
});

tf.test('column insertion @ 0 after scrolling 5 right', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted' + r + c;
                }
            },
            updateRowHeader: function(r, th) {
                if (this.initiated) {
                    th.innerHTML = r + '';
                }
            },
            updateColumnHeader: function(c, th, col) {
                if (this.initiated) {
                    th.innerHTML = c + '';
                }
            }
        }),
        tBody = mt.tBody;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.updateColumns(5);
    mt.newColumn(0);
    tf.assertEquals(tBody.children[1].textContent, 'inserted05inserted06inserted07inserted08inserted09', "column has been inserted correctly");
});

tf.test('row removal @ 0', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted' + r + c;
                }
            },
            updateRowHeader: function(r, th) {
                if (this.initiated) {
                    th.innerHTML = r + '';
                }
            },
            updateColumnHeader: function(c, th, col) {
                if (this.initiated) {
                    th.innerHTML = c + '';
                }
            }
        }),
        tBody = mt.tBody;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.removeRow(0);
    tf.assertEquals(tBody.lastChild.textContent, '5inserted50inserted51inserted52inserted53inserted54', "right column has been inserted correctly");
});

tf.test('column removal @ 0', function(tf) {
    var el = document.createElement('div'),
        mt = new MegaTable({
            element: el,
            rows: 5,
            columns: 5,
            updateCell: function(r, c, td) {
                if (this.initiated) {
                    td.innerHTML = 'inserted' + r + c;
                }
            },
            updateRowHeader: function(r, th) {
                if (this.initiated) {
                    th.innerHTML = r + '';
                }
            },
            updateColumnHeader: function(c, th, col) {
                if (this.initiated) {
                    th.innerHTML = c + '';
                }
            }
        }),
        tBody = mt.tBody;

    tf.assertEquals(el.textContent, '', 'Table is empty');
    mt.removeColumn(0);
    tf.assertEquals(tBody.children[1].textContent, 'inserted05', "right column has been inserted correctly");
    tf.assertEquals(tBody.children[2].textContent, 'inserted15', "right column has been inserted correctly");
    tf.assertEquals(tBody.children[3].textContent, 'inserted25', "right column has been inserted correctly");
    tf.assertEquals(tBody.children[4].textContent, 'inserted35', "right column has been inserted correctly");
    tf.assertEquals(tBody.children[5].textContent, 'inserted45', "right column has been inserted correctly");

});