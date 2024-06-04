( function( mw, $ ) {
	/**
	 * Definition of the grid
	 * {
	 *     style: 'none'|'differentiate-rows' // Default to 'none'
	 *     border: 'none'|'all'|'horizontal'|'vertical' // Default to 'none'
	 *     noHeader: true|false // Hide header if true. Default to false
	 *     pageSize: {number}, // Default to 10, also affected by the store's pageSize
	 *     columns: { {definition of the columns}  }, // See Column.js
	 *     unspecifiedGroupHeader: 'No group selected', // If store has a groupField, this will be the header for the unspecified group
	 *     store: {OOJSPlus.ui.data.store.Store}, // See Store.js
	 *     data: {Array}, // Data to use if no store is specified (only evaluated if no store is specified)
	 *     paginator: {Instance of OOJSPlus.ui.data.grid.Paginator}|null. Nul for no pagination. If not specified, a default paginator will be used
	 *     toolbar: {Instance of OOJSPlus.ui.data.grid.Toolbar}|null. Null for no toolbar. If not specified, a default toolbar will be used
	 *     tools: {Array of OO.ui.ButtonWidget or subclasses of it (eg. OO.ui.PopupButtonWidget)}. Tools to add to the toolbar
	 *     orderable: true|false, // Default to true
	 *     resizable: true|false, // Default to true
	 * }
	 * @type {OOJSPlus.ui.data.GridWidget}
	 */
	OOJSPlus.ui.data.GridWidget = function( cfg ) {
		mw.hook( 'oojsplus.grid.init' ).fire( this, cfg );

		OOJSPlus.ui.data.GridWidget.parent.call( this, cfg );

		this.$element.addClass( 'oojsplus-data-gridWidget' );
		this.$table = $( '<table>' ).addClass( 'oojsplus-data-gridWidget-table' );
		this.$table.append( $( '<thead>' ).addClass( 'oojsplus-data-gridWidget-header' ) );
		this.$table.append( $( '<tbody>' ).addClass( 'oojsplus-data-gridWidget-tbody' ) );
		this.$wrapper = $( '<div>' );
		this.$element.append( this.$wrapper.append( this.$table ) );

		this.style = cfg.style || 'none';
		this.noHeader = cfg.noHeader || false;
		this.border = cfg.border || 'none';
		this.pageSize = cfg.pageSize || 25;
		this.multiSelect = cfg.multiSelect || false;
		this.store = cfg.store || this.createLocalStore( cfg.data || [] );
		this.sticky = false;
		this.groupers = {};
		this.unspecifiedGroupHeader = cfg.unspecifiedGroupHeader || null;
		this.data = cfg.data || [];
		this.resizable = typeof cfg.resizable === 'undefined' ? true : cfg.resizable;
		this.orderable = typeof cfg.orderable === 'undefined' ? true : cfg.orderable;
		if ( this.noHeader ) {
			// Cannot be orderable and/or resizable without header
			this.orderable = false;
			this.resizable = false;
		}
		this.alwaysVisibleColumns = [];
		this.visibleColumns = [];

		this.selectedRows = [];

		this.columns = {};
		this.buildColumns( cfg.columns );
		this.addHeader();
		this.paginator = typeof cfg.paginator === 'undefined' ? this.makePaginator() : cfg.paginator;
		if ( this.paginator ) {
			this.paginator.connect( this, {
				// Reset group headers when switching pages. This is done in order to insert a fresh header
				// on the other page, even if the group is the same
				next: function() {
					if ( this.store.groupField ) {
						this.currentGroupHeader = null;
					}
				},
				previous: function() {
					if ( this.store.groupField ) {
						this.currentGroupHeader = null;
					}
				}
			} );
		}

		this.toolbar = typeof cfg.toolbar === 'undefined' ?
			this.makeToolbar( ( cfg.tools || [] ).concat( this.getGridSettingsWidget() ) ) : cfg.toolbar;

		this.$table.addClass( 'style-' + this.style );
		this.$table.addClass( 'border-' + this.border );
		this.checkForStickyColumn();
		var classes = 'grid-container';
		if ( this.sticky ) {
			classes += ' sticky-container';
		}
		this.$wrapper.addClass( classes );
		if ( this.toolbar instanceof OOJSPlus.ui.data.grid.Toolbar ) {
			this.$element.append( this.toolbar.$element );
		}

		this.makeLoadingOverlay();
		this.store.connect( this, {
			loading: 'onStoreLoading',
			loaded: 'onStoreLoaded',
			reload: function( data ) {
				if ( !( this.paginator instanceof OOJSPlus.ui.data.grid.Paginator ) ) {
					this.setItems( Object.values( data ) );
				}
			}
		} );
		this.store.load().done( function( data ) {
			if ( this.paginator instanceof OOJSPlus.ui.data.grid.Paginator ) {
				this.paginator.init();
			} else {
				this.setItems( Object.values( data ) );
			}
		}.bind( this ) );

		this.connect( this, {
			selected: 'clickOnRow'
		} );

		if ( this.orderable ) {
			this.$table.sorttable( {} );
		}
	};

	OO.inheritClass( OOJSPlus.ui.data.GridWidget, OO.ui.Widget );

	OOJSPlus.ui.data.GridWidget.static.tagName = 'div';

	OOJSPlus.ui.data.GridWidget.prototype.buildColumns = function( cfg ) {
		if ( this.multiSelect ) {
			var multiselect = {}
			multiselect.check = {
				type: 'selection',
				title: mw.message( 'oojsplus-data-grid-selection-column-label' ).text(),
				actionId: 'checkRow'
			};
			cfg = Object.assign( multiselect, cfg );
		}

		for( var field in cfg ) {
			if ( !cfg.hasOwnProperty( field ) ) {
				continue;
			}
			var columnWidget,
				column = cfg[field];
			if ( !( column instanceof OOJSPlus.ui.data.column.Column ) ) {
				column.id = field;
				var type = column.type || 'text';

				var columnClass = OOJSPlus.ui.data.registry.columnRegistry.lookup( type );
				if ( !columnClass ) {
					console.error( 'OOJSPlus.data: Tried to instantiate non-registered column for type: ' + type );
					columnClass = OOJSPlus.ui.data.registry.columnRegistry.lookup( 'text' );
				}
				columnWidget = new columnClass( $.extend( column, { resizable: this.resizable } ) );
				columnWidget.bindToGrid( this );
				if ( !columnWidget.canChangeVisibility() ) {
					this.alwaysVisibleColumns.push( field );
				}
				if ( columnWidget.getVisibility() === 'visible' ) {
					this.visibleColumns.push( field );
				}
			} else {
				columnWidget = column;
			}
			columnWidget.connect( this, {
				filter: 'onFilter',
				filterToggle: 'onFilterToggle',
				sort: 'onSort'
			} );
			this.columns[field] = columnWidget;
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.checkForStickyColumn = function() {
		for ( var columnKey in this.columns ) {
			if ( !this.columns.hasOwnProperty( columnKey ) ) {
				continue;
			}
			if ( this.columns[ columnKey ].sticky ) {
				this.sticky = true;
				break;
			}
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.createLocalStore = function( data ) {
		return new OOJSPlus.ui.data.store.Store( {
			data: data, pageSize: this.pageSize, remoteFilter: false, remoteSort: false
		} );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onFilterToggle = function( filterButton, visible ) {
		// Prevent multiple open filters at the same time
		if ( visible ) {
			if ( this.openedFilter ) {
				this.openedFilter.popup.toggle( false );
			}
			this.openedFilter = filterButton;
		} else {
			this.openedFilter = null;
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.makeToolbar = function( tools ) {
		return new OOJSPlus.ui.data.grid.Toolbar( {
			store: this.store,
			paginator: this.paginator,
			tools: tools
		} );
	};

	OOJSPlus.ui.data.GridWidget.prototype.makePaginator = function() {
		return new OOJSPlus.ui.data.grid.Paginator( {
			grid: this,
			store: this.store
		} );
	};

	OOJSPlus.ui.data.GridWidget.prototype.makeLoadingOverlay = function( ) {
		this.$loadingOverlay = $( '<div>' ).addClass( 'grid-loading-overlay' );
		var progress = new OO.ui.ProgressBarWidget( { progress: false } );

		this.$loadingOverlay.append( progress.$element );
		this.$element.append( this.$loadingOverlay );
		this.$loadingOverlay.hide();
	};

	OOJSPlus.ui.data.GridWidget.prototype.onFilter = function( filter, field ) {
		this.clearItems();
		this.store.filter( filter, field );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onStoreLoaded = function( rows ) {
		this.setActiveFilters( Object.keys( this.store.getFilters() ) );
		this.$loadingOverlay.hide();
	};

	OOJSPlus.ui.data.GridWidget.prototype.onStoreLoading = function() {
		this.$loadingOverlay.show();
	};

	OOJSPlus.ui.data.GridWidget.prototype.setLoading = function( loading ) {
		if ( !this.$loadingOverlay ) {
			return;
		}
		loading ? this.$loadingOverlay.show() : this.$loadingOverlay.hide();
	};

	OOJSPlus.ui.data.GridWidget.prototype.setActiveFilters = function( fields ) {
		for ( var columnKey in this.columns ) {
			if ( !this.columns.hasOwnProperty( columnKey ) ) {
				continue;
			}
			this.columns[columnKey].setHasActiveFilter( fields.indexOf( columnKey ) !== -1 );
		}
	};


	OOJSPlus.ui.data.GridWidget.prototype.addHeader = function() {
		if ( this.noHeader ) {
			return;
		}
		var $header = this.$table.find( 'thead' );
		var $row = $( '<tr>' ).addClass( 'oojsplus-data-gridWidget-row oojsplus-data-gridWidget-header' );
		for( var field in this.columns ) {
			if ( !this.columns.hasOwnProperty( field ) ) {
				continue;
			}
			var $cell = this.columns[field].getHeader();
			$cell.attr( 'data-field', field );
			// Set the default filter values from the store
			var filters = this.store.getFilters();
			if ( filters.hasOwnProperty( field ) ) {
				this.columns[field].setFilter( filters[field].getValue() );
			}
			$row.append( $cell );
		}
		$header.append( $row );
	};

	OOJSPlus.ui.data.GridWidget.prototype.getGridSettingsWidget = function() {
		var options = [];
		for ( var field in this.columns ) {
			if ( !this.columns.hasOwnProperty( field ) ) {
				continue;
			}
			if ( this.alwaysVisibleColumns.indexOf( field ) !== -1 ) {
				continue;
			}
			if ( this.columns[field].type === 'action' || this.columns[field].type === 'selection' ) {
				// Do not allow hiding of "system" columns
				continue;
			}
			options.push( {
				data: field,
				label: this.columns[field].headerText || field
			} );
		}
		var columnsWidget = new OO.ui.CheckboxMultiselectInputWidget( {
			options: options,
			value: this.visibleColumns
		} );

		columnsWidget.connect( this, {
			change: 'setColumnsVisibility'
		} );

		var settingsPanel = new OO.ui.PanelLayout( {
			expanded: false,
			padded: false,
		} );
		settingsPanel.$element.append( columnsWidget.$element );

		return new OO.ui.PopupButtonWidget( {
			icon: 'settings',
			classes: [ 'oojsplus-data-gridWidget-column-selector' ],
			framed: false,
			label: 'Settings',
			invisibleLabel: true,
			popup: {
				head: true,
				label: mw.message( "oojsplus-data-grid-toolbar-settings-columns-label" ).text(),
				$content: settingsPanel.$element,
				padded: true,
				align: 'backwards',
				autoFlip: true,
				verticalPosition: 'top'
			}
		} );
	};

	OOJSPlus.ui.data.GridWidget.prototype.setColumnsVisibility = function( visible ) {
		this.visibleColumns = visible;
		visible = visible.concat( this.alwaysVisibleColumns );
		for ( var field in this.columns ) {
			if ( !this.columns.hasOwnProperty( field ) ) {
				continue;
			}
			this.doSetColumnVisibility( field, visible.indexOf( field ) !== -1 );
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.doSetColumnVisibility = function( field, visible ) {
		// Find cells by data `field` attribute
		this.$table.find( '[data-field="' + field + '"]' ).toggle( visible );
	};

	OOJSPlus.ui.data.GridWidget.prototype.addItemsInternally = function( data ) {
		for( var i = 0; i < data.length; i++ ) {
			if ( this.schemaFits( data[i] ) ) {
				this.appendItem( data[i] );
			}
		}
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
			var relevantField = column.display || field;
			if( !( relevantField in item ) ) {
				console.error( 'OOJSPlus.ui.data.Grid: Missing field in row data', {
					field: relevantField,
					row: item
				} );
				return false;
			}
		}
		return true;
	};

	OOJSPlus.ui.data.GridWidget.prototype.addGroupHeader = function( value, $row ) {
		// Used for "current" group, for incrementing the counter
		this.currentGroupHeader = {
			value: value,
			counter: new OO.ui.LabelWidget( {
				data: 1,
				label: '(' + 1 + ')'
			} )
		};

		// Determine if group is expanded or not. Useful only when switching pages, to carry over the state
		var groupExpanded = true;
		if ( this.groupers.hasOwnProperty( value ) && !this.groupers[value].expanded ) {
			groupExpanded = false;
			$row.hide();
		}
		this.groupers[value] = {
			expanded: groupExpanded,
			rows: [ $row ]
		}
		var expandButton = new OO.ui.ButtonWidget( {
				icon: groupExpanded ? 'collapse' : 'expand',
				framed: false,
				data: value
			} ),
			grid = this;
		expandButton.connect( expandButton, {
			click: function() {
				if ( grid.groupers.hasOwnProperty( this.getData() ) ) {
					var expanded = grid.groupers[this.getData()].expanded;
					for ( var i = 0; i < grid.groupers[this.getData()].rows.length; i++ ) {
						var row = grid.groupers[this.getData()].rows[i];
						expanded ? row.hide() : row.show();
					}
					this.setIcon( expanded ? 'expand' : 'collapse' );
					grid.groupers[this.getData()].expanded = !expanded;
				}
			}
		} );

		var headerLayout = new OO.ui.HorizontalLayout( {
			items: [
				expandButton,
				new OO.ui.LabelWidget( {
					label: value || this.unspecifiedGroupHeader || mw.message( 'oojsplus-data-grid-grouper-no-group' ).text(),
				} ),
				this.currentGroupHeader.counter
			]
		} );
		var $grouperCell = $( '<td>' )
		.attr( 'colspan', Object.keys( this.columns ).length )
		.append( headerLayout.$element ),
			$grouperRow = $( '<tr>' ).addClass( 'oojsplus-data-gridWidget-group-header' ).append( $grouperCell );
		this.$table.append( $grouperRow );
	};

	OOJSPlus.ui.data.GridWidget.prototype.appendItem = function( item ) {
		var $row = $( '<tr>' ).addClass( 'oojsplus-data-gridWidget-row' );
		$( $row ).attr( 'id', this.getItemID( item ) );
		$row.addClass( item.classes || [] );

		if ( this.store.groupField ) {
			if ( this.currentGroupHeader && this.currentGroupHeader.value === item[this.store.groupField] ) {
				// If we already started a group, and the current item is in the same group, just increment the counter
				this.currentGroupHeader.counter.setData( this.currentGroupHeader.counter.getData() + 1 );
				this.currentGroupHeader.counter.setLabel( '(' + this.currentGroupHeader.counter.getData() + ')' );
				this.groupers[this.currentGroupHeader.value].rows.push( $row );
				this.groupers[this.currentGroupHeader.value].expanded ? $row.show() : $row.hide();
			} else {
				// If new group is detected, add a new group header
				this.addGroupHeader( item[this.store.groupField] || '', $row );
			}
		}
		var sortedColumns = this.getCurrentColumnOrder();
		for( var i = 0; i < sortedColumns.length; i++ ) {
			var columnField = sortedColumns[i];
			if ( !this.columns.hasOwnProperty( columnField ) ) {
				continue;
			}
			var $cell = this.columns[columnField].renderCell( item[columnField], item );
			$cell.attr( 'data-field', columnField );
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

		if ( !this.multiSelect ) {
			$row.on( 'click', { $row: $row, item: item },
				this.clickOnRow.bind( this ) );
		}

		this.$table.find( 'tbody.oojsplus-data-gridWidget-tbody' ).append( $row );
	};

	OOJSPlus.ui.data.GridWidget.prototype.clearItems = function() {
		this.$table.find( 'tbody.oojsplus-data-gridWidget-tbody' ).find( 'tr' ).remove();
	};

	OOJSPlus.ui.data.GridWidget.prototype.onCellClick = function( e ) {
		this.emit( 'cellClick', e );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onCellDblClick = function( e ) {
		var $cell = $( e.data.$cell );
		this.emit( 'cellDblClick', $cell, e );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onSort = function( sorter, field ) {
		this.clearItems();
		this.store.sort( sorter, field );
	};

	OOJSPlus.ui.data.GridWidget.prototype.setItems = function( data ) {
		this.clearItems();
		this.addItemsInternally( data );
		this.setColumnsVisibility( this.visibleColumns );

		this.emit( 'datasetChange' );
	};

	OOJSPlus.ui.data.GridWidget.prototype.clickOnRow = function( e ) {
		if ( !this.multiSelect ) {
			$( '.oojsplus-data-gridWidget-row' ).removeClass( 'row-selected' );
			e.data.$row.addClass( 'row-selected' );
		} else {
			var positionInArray = this.selectedRows.indexOf( e.data.item );
			if ( positionInArray >= 0 ) {
				this.selectedRows.splice( positionInArray, 1 );
			} else {
				this.selectedRows.push( e.data.item );
			}
		}
		this.emit( 'rowSelected', e.data );
	};

	OOJSPlus.ui.data.GridWidget.prototype.getSelectedRows = function( ) {
		return this.selectedRows;
	};

	OOJSPlus.ui.data.GridWidget.prototype.getItemID = function( item ) {
		let itemText = JSON.stringify( item );
		let hash = 0;
		for ( let i = 0; i < itemText.length; i++ ) {
			hash = itemText.charCodeAt( i ) + ( ( hash << 5 ) - hash );
		}
		let uniqueId = "";
		for ( let i = 0; i < 32; i++ ) {
			let char = Math.floor( Math.random() * 16 ).toString( 16 );
			uniqueId += char;
		}
		return uniqueId;
	};

	OOJSPlus.ui.data.GridWidget.prototype.getCurrentColumnOrder = function() {
		// Get all th's and read out data-field attribute
		var $head = this.$table.find( 'thead' );
		if ( !this.orderable || $head.length === 0 ) {
			// No header
			return Object.keys( this.columns );
		}
		var $ths = $head.find( 'th' );
		var columnOrder = [];
		for ( var i = 0; i < $ths.length; i++ ) {
			columnOrder.push( $( $ths[i] ).attr( 'data-field' ) );
		}
		return columnOrder;
	};
} )( mediaWiki, jQuery );
