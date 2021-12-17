( function( mw, $ ) {
	OOJSPlus.ui.data.GridWidget = function( cfg ) {
		OOJSPlus.ui.data.GridWidget.parent.call( this, cfg );

		this.$element.addClass( 'oojsplus-data-gridWidget' );
		this.$table = $( '<table>' ).addClass( 'oojsplus-data-gridWidget-table' );

		this.style = cfg.style || 'none';
		this.$table.addClass( 'style-' + this.style );
		this.border = cfg.border || 'none';
		this.$table.addClass( 'border-' + this.border );

		this.deletable = cfg.deletable || false;
		this.deletePrompt = cfg.deletePrompt || mw.message( 'oojsplus-data-delete-row-prompt' ).plain();
		this.data = cfg.data || [];
		this.allowDuplicates = cfg.allowDuplicates || false;

		this.columns = {};
		this.buildColumns( cfg.columns );

		this.pageSize = cfg.pageSize || 25;
		this.paginator = new OOJSPlus.ui.data.paginator.Page( {
			grid: this,
			pageSize: this.pageSize
		} );

		// Data actually inserted into the grid
		this.gridData = {};
		this.isDirty = false;

		this.gridDataIndexCounter = 0;
		this.noHeader = cfg.noHeader || false;
		this.deleteNoConfirm = cfg.deleteNoConfirm || false;

		this.addHeader();
		this.addItems( this.data );
		$( 'body' ).on( 'click', this.onBodyClick.bind( this ) );

		this.$element.append( this.$table, this.paginator.$element );
	};

	OO.inheritClass( OOJSPlus.ui.data.GridWidget, OO.ui.Widget );

	OOJSPlus.ui.data.GridWidget.prototype.buildColumns = function( cfg ) {
		for( var field in cfg ) {
			var column = cfg[field];
			if( column instanceof OOJSPlus.ui.data.column.Column ) {
				this.columns[field] = column;
				column.on( 'columnSort', this.onColumnSort.bind( this ) );
				continue;
			}

			column.id = field;
			column.type = column.type || 'text';

			var type = column.type;
			var columnWidget;
			// TODO: Registry
			if( type === 'text' ) {
				columnWidget = new OOJSPlus.ui.data.column.Text( column );
			} else if( type === 'boolean' ) {
				columnWidget = new OOJSPlus.ui.data.column.Boolean( column );
			} else if( type === 'url' ) {
				columnWidget = new OOJSPlus.ui.data.column.Url( column );
			} else if ( type === 'icon' ) {
				columnWidget = new OOJSPlus.ui.data.column.Icon( column );
			} else if ( type === 'date' ) {
				columnWidget = new OOJSPlus.ui.data.column.Date( column );
			} else if ( type === 'action' ) {
				columnWidget = new OOJSPlus.ui.data.column.Action( this, column );
			}
			columnWidget.on( 'columnSort', this.onColumnSort.bind( this ) );
			this.columns[field] = columnWidget;
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.onAction = function( id, row ) {
		this.emit( 'action', id, row );
	};

	OOJSPlus.ui.data.GridWidget.prototype.addHeader = function() {
		if ( this.noHeader ) {
			return;
		}
		var $header = $( '<thead>' ).addClass( 'oojsplus-data-gridWidget-header' );
		var $row = $( '<tr>' ).addClass( 'oojsplus-data-gridWidget-row' );
		for( var field in this.columns ) {
			var $cell = this.columns[field].getHeader();
			$row.append( $cell );
		}

		if( this.deletable ) {
			$row.append( new OOJSPlus.ui.data.column.Delete().getHeader() );
		}
		$header.append( $row );

		this.$table.append( $header );
	};

	OOJSPlus.ui.data.GridWidget.prototype.addItems = function( data ) {
		var origData = this.getData();
		data = origData.concat( data );
		this.drawGrid( data );
	};

	OOJSPlus.ui.data.GridWidget.prototype.addItemsInternaly = function( data ) {
		if ( !this.allowDuplicates ) {
			var unique = [];
			for ( var i = 0; i < data.length; i++ ) {
				if ( !this.itemExists( unique, data[i] ) ) {
					unique.push( data[i] );
				}
			}
			data = unique;
		}
		for( var idx in data ) {
			if( this.schemaFits( data[idx] ) ) {
				this.gridData[this.gridDataIndexCounter] = data[idx];
				//this.appendItem( data[idx], this.gridDataIndexCounter );
				this.gridDataIndexCounter++;
			}
		}
		this.paginator.setData( this.gridData );
		this.paginator.reset();
		this.paginator.next();
	};

	OOJSPlus.ui.data.GridWidget.prototype.itemExists = function( list, item ) {
		if ( list.length === 0 ) {
			return false;
		}
		for ( var i = 0; i < list.length; i ++ ) {
			var different = false;
			for ( var key in list[i] ) {
				if ( !list[i].hasOwnProperty( key ) ) {
					continue;
				}
				if ( item[key] !== list[i][key] ) {
					different = true;
				}
			}
			if ( !different ) {
				return true;
			}
		}
		return false;
	};

	OOJSPlus.ui.data.GridWidget.prototype.sortData = function( field, dir ) {
		var sortedData = [];
		for( var rowIdx in this.gridData ) {
			var row = this.gridData[rowIdx];
			sortedData.push( row );
		}

		var column = this.columns[field];
		sortedData.sort( function( a, b ) {
			return column.sort( a[field], b[field] ) * dir;
		} );
		return sortedData;
	};

	OOJSPlus.ui.data.GridWidget.prototype.schemaFits = function( item ) {
		for( var field in this.columns ) {
			if ( !this.columns.hasOwnProperty( field ) ) {
				continue;
			}
			var column = this.columns[field];
			if ( column instanceof OOJSPlus.ui.data.column.Action ) {
				continue;
			}
			if( !( field in item ) ) {
				return false;
			}
		}
		return true;
	};

	OOJSPlus.ui.data.GridWidget.prototype.appendItem = function( item, idx ) {
		var $row = $( '<tr>' ).addClass( 'oojsplus-data-gridWidget-row' );
		$row.attr( 'data-row-idx', idx );
		for( var columnField in this.columns ) {
			var $cell = this.columns[columnField].renderCell( item[columnField], item );

			$cell.attr( 'data-idx', idx );
			$cell.on( 'click', {
				$cell: $cell,
				item: item
			}, this.onCellClick.bind( this ) );
			$cell.on( 'dblclick', {
				$cell: $cell,
				item: item
			}, this.onCellDblClick.bind( this ) );
			$row.append( $cell );
		}

		if( this.deletable ) {
			var $cell = new OOJSPlus.ui.data.column.Delete().renderCell( idx );
			$row.append( $cell );
			$cell.find( '.oojsplus-data-gridWidget-delete' ).on( 'click', {
				$row: $row,
				rowIdx: idx
			}, this.onRowDelete.bind( this ) );
		}

		$row.on( 'click', { $row: $row, item: item, idx: idx }, function( e ) {
			$( '.oojsplus-data-gridWidget-row' ).removeClass( 'row-selected' );
			e.data.$row.addClass( 'row-selected' );
			this.emit( 'rowSelected', e.data );
		}.bind( this ) );

		this.$table.append( $row );
	};

	OOJSPlus.ui.data.GridWidget.prototype.clearItems = function() {
		this.$table.find( 'tr' ).not( 'thead tr').remove();
	};

	OOJSPlus.ui.data.GridWidget.prototype.onBodyClick = function( e ) {
		var target = $( e.target );
		if( target.hasClass( 'oojsplus-data-edit' ) ) {
			return;
		}
		if( target.parents().hasClass( 'oojsplus-data-edit' ) ) {
			return;
		}
		this.saveCurrentCell();
	};

	OOJSPlus.ui.data.GridWidget.prototype.onCellClick = function( e ) {
		this.emit( 'cellClick', e );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onCellDblClick = function( e ) {
		var $cell = $( e.data.$cell );
		var field = $cell.attr( 'data-column' );

		this.emit( 'cellDblclick', e );
		if( this.columns[field].isEditable() === false ) {
			return;
		}

		var $cell = $( e.data.$cell );
		var field = $cell.attr( 'data-column' );
		var value = $cell.attr( 'data-value' );
		var editWidget = this.columns[field].getEditControls( value );

		this.currentlyEditedCell = {
			$cell: e.data.$cell,
			editWidget: editWidget
		};

		$cell.html( editWidget.$element );
	};

	OOJSPlus.ui.data.GridWidget.prototype.saveCurrentCell = function() {
		if( !this.currentlyEditedCell ) {
			return;
		}

		var $cell = $( this.currentlyEditedCell.$cell );
		var field = $cell.attr( 'data-column' );
		var rowIdx = $cell.attr( 'data-idx' );
		var oldValue = this.gridData[rowIdx][field];
		var newValue = this.columns[field].getNewValue( this.currentlyEditedCell.editWidget );
		$cell.attr( 'data-value', newValue );
		$cell.html( this.columns[field].getViewControls( newValue ).$element );

		// Update data
		this.gridData[rowIdx][field] = newValue;

		this.emit( 'cellEditComplete', {
			$cell: $cell,
			oldValue: oldValue,
			newValue: newValue
		} );

		if( newValue !== oldValue ) {
			$cell.addClass( 'oojsplus-data-cell-dirty' );
			this.setDirty( true );
		}

		this.currentlyEditedCell = null;
	};

	OOJSPlus.ui.data.GridWidget.prototype.onRowDelete = function( e ) {
		if ( this.deleteNoConfirm ) {
			this.doDeleteRow( e );
		} else {
			OO.ui.confirm( this.deletePrompt ).done( function( confirmed ) {
				if ( !confirmed ) {
					return;
				}
				this.doDeleteRow( e );
			}.bind( this ) );
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.doDeleteRow = function( e ) {
		var idx = e.data.rowIdx;
		var row = this.gridData[idx];
		// Update data
		delete( this.gridData[idx] );

		var $row = $( e.data.$row );
		$row.remove();

		this.emit( 'rowDeleteComplete', {
			row: row
		} );

		var newData = [];
		$.each( this.gridData, function( k, item ) {
			newData.push( item );
		} );

		this.drawGrid( newData );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onColumnSort = function( field ) {
		var dir = 1;
		if( this.columns[field].isSortable() === false ) {
			return;
		}

		for( var columnField in this.columns ) {
			var column = this.columns[columnField];
			if( field === columnField ) {
				if( column.isSorter() ) {
					// Flip direction if column is already the sorter
					dir = column.getSorter() * -1;
				}
				column.setSorter( dir );
			} else {
				column.setSorter( 0 );
			}
		}

		var sorted = this.sortData( field, dir );

		this.drawGrid( sorted );
	};

	OOJSPlus.ui.data.GridWidget.prototype.drawGrid = function( data ) {
		// Clear grid
		this.gridData = {};
		this.gridDataIndexCounter = 0;
		this.$table.children().remove();

		// Re-draw grid
		this.addHeader();
		this.addItemsInternaly( data );
	};

	OOJSPlus.ui.data.GridWidget.prototype.getData = function() {
		var data = [];
		$.each( this.gridData, function( idx, dataItem ) {
			data.push( dataItem );
		} );
		return data;
	};

	OOJSPlus.ui.data.GridWidget.prototype.setDirty = function( dirty ) {
		this.isDirty = dirty;

		if( this.isDirty === false ) {
			this.$table.find( '.oojsplusi-data-cell-dirty' ).removeClass( 'oojsplus-data-cell-dirty' );
		}
	};

	OOJSPlus.ui.data.GridWidget.static.tagName = 'div';
} )( mediaWiki, jQuery );
