( function( mw, $ ) {
	/**
	 * Definition of the grid
	 * {
	 *     style: 'none'|'differentiate-rows' // Default to 'none'
	 *     border: 'none'|'all'|'horizontal'|'vertical' // Default to 'none'
	 *     noHeader: true|false // Hide header if true. Default to false
	 *     pageSize: {number}, // Default to 10, also affected by the store's pageSize
	 *     columns: { {definition of the columns}  }, // See Column.js
	 *     store: {OOJSPlus.ui.data.store.Store}, // See Store.js
	 *     data: {Array}, // Data to use if no store is specified (only evaluated if no store is specified)
	 *     paginator: {Instance of OOJSPlus.ui.data.grid.Paginator}|null. Nul for no pagination. If not specified, a default paginator will be used
	 *     toolbar: {Instance of OOJSPlus.ui.data.grid.Toolbar}|null. Null for no toolbar. If not specified, a default toolbar will be used
	 *     tools: {Array of OO.ui.ButtonWidget or subclasses of it (eg. OO.ui.PopupButtonWidget)}. Tools to add to the toolbar
	 * }
	 * @type {OOJSPlus.ui.data.GridWidget}
	 */
	OOJSPlus.ui.data.GridWidget = function( cfg ) {
		mw.hook( 'oojsplus.grid.init' ).fire( this, cfg );

		OOJSPlus.ui.data.GridWidget.parent.call( this, cfg );

		this.$element.addClass( 'oojsplus-data-gridWidget' );
		this.$table = $( '<table>' ).addClass( 'oojsplus-data-gridWidget-table' );

		this.style = cfg.style || 'none';
		this.noHeader = cfg.noHeader || false;
		this.border = cfg.border || 'none';
		this.pageSize = cfg.pageSize || 25;
		this.store = cfg.store || this.createLocalStore( cfg.data || [] );
		this.sticky = false;

		this.data = cfg.data || [];
		this.alwaysVisibleColumns = [];
		this.visibleColumns = [];

		this.columns = {};
		this.buildColumns( cfg.columns );
		this.addHeader();
		this.paginator = typeof cfg.paginator === 'undefined' ? this.makePaginator() : cfg.paginator;
		this.toolbar = typeof cfg.toolbar === 'undefined' ?
			this.makeToolbar( ( cfg.tools || [] ).concat( this.getGridSettingsWidget() ) ) : cfg.toolbar;

		this.$table.addClass( 'style-' + this.style );
		this.$table.addClass( 'border-' + this.border );
		this.checkForStickyColumn();
		var classes = 'grid-container';
		if ( this.sticky ) {
			classes += ' sticky-container';
		}
		this.$element.append( $( '<div>' ).addClass( classes ).append( this.$table ) );
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
	};

	OO.inheritClass( OOJSPlus.ui.data.GridWidget, OO.ui.Widget );

	OOJSPlus.ui.data.GridWidget.static.tagName = 'div';

	OOJSPlus.ui.data.GridWidget.prototype.buildColumns = function( cfg ) {
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
				columnWidget = new columnClass( column );
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
		var $header = $( '<thead>' ).addClass( 'oojsplus-data-gridWidget-header' );
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

		this.$table.append( $header );
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
			options.push( {
				data: field,
				label: this.columns[field].headerText || field
			} );
		}
		var columnsWidget = new OO.ui.CheckboxMultiselectInputWidget( {
			options: options,
			value: this.visibleColumns
		} );
		var columnSelectorLayout = new OO.ui.FieldLayout( columnsWidget, {
			label: mw.message( "oojsplus-data-grid-toolbar-settings-columns-label" ).text()
		} );
		columnsWidget.connect( this, {
			change: 'setColumnsVisibility'
		} );

		var settingsPanel = new OO.ui.PanelLayout( {
			expanded: false,
			padded: true,
		} );
		settingsPanel.$element.append( columnSelectorLayout.$element );

		return new OO.ui.PopupButtonWidget( {
			icon: 'settings',
			classes: [ 'oojsplus-data-gridWidget-column-selector' ],
			framed: false,
			popup: {
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
			} else {
				console.error( 'Row does not fit schema: ' + JSON.stringify( data[i] ) );
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
			if( !( field in item ) ) {
				return false;
			}
		}
		return true;
	};

	OOJSPlus.ui.data.GridWidget.prototype.appendItem = function( item ) {
		var $row = $( '<tr>' ).addClass( 'oojsplus-data-gridWidget-row' );
		for( var columnField in this.columns ) {
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

		$row.on( 'click', { $row: $row, item: item }, function( e ) {
			$( '.oojsplus-data-gridWidget-row' ).removeClass( 'row-selected' );
			e.data.$row.addClass( 'row-selected' );
			this.emit( 'rowSelected', e.data );
		}.bind( this ) );

		this.$table.append( $row );
	};

	OOJSPlus.ui.data.GridWidget.prototype.clearItems = function() {
		this.$table.find( 'tr' ).not( 'thead tr').remove();
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
		this.$table.children( ':not(.oojsplus-data-gridWidget-header)' ).remove();
		this.addItemsInternally( data );
		this.setColumnsVisibility( this.visibleColumns );

		this.emit( 'datasetChange' );
	};
} )( mediaWiki, jQuery );
