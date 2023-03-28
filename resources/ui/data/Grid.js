( function( mw, $ ) {
	OOJSPlus.ui.data.GridWidget = function( cfg ) {
		OOJSPlus.ui.data.GridWidget.parent.call( this, cfg );

		this.$element.addClass( 'oojsplus-data-gridWidget' );
		this.$table = $( '<table>' ).addClass( 'oojsplus-data-gridWidget-table' );

		this.style = cfg.style || 'none';
		this.noHeader = cfg.noHeader || false;
		this.border = cfg.border || 'none';
		this.pageSize = cfg.pageSize || 25;
		this.store = cfg.store || this.createLocalStore( cfg.data || [] );
		this.paginator = typeof cfg.paginator === 'undefined' ? this.makePaginator() : cfg.paginator;
		this.toolbar = typeof cfg.toolbar === 'undefined' ? this.makeToolbar() : cfg.toolbar;

		this.data = cfg.data || [];

		this.columns = {};
		this.buildColumns( cfg.columns );
		this.addHeader();

		this.$table.addClass( 'style-' + this.style );
		this.$table.addClass( 'border-' + this.border );
		this.$element.append( $( '<div>' ).addClass( 'grid-container' ).append( this.$table ) );
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
		}
	};


	OOJSPlus.ui.data.GridWidget.prototype.makeToolbar = function() {
		return new OOJSPlus.ui.data.grid.Toolbar( {
			store: this.store,
			paginator: this.paginator
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
		this.emit( 'datasetChange' );
	};
} )( mediaWiki, jQuery );
