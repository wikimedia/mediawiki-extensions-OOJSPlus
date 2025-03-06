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
	 *	   actionsVisibleOnHover: true|false, // Default to false
	 * }
	 * @type {OOJSPlus.ui.data.GridWidget}
	 */
	OOJSPlus.ui.data.GridWidget = function( cfg ) {
		mw.hook( 'oojsplus.grid.init' ).fire( this, cfg );

		OOJSPlus.ui.data.GridWidget.parent.call( this, cfg );

		this.$element.addClass( 'oojsplus-data-gridWidget' );
		this.$filterCnt = $( '<div>' ).attr( 'id', 'grid-filter-announcement' )
			.attr( 'aria-live', 'polite' ).addClass( 'visually-hidden' );
		this.$sortCnt =  $( '<div>' ).attr( 'id', 'grid-sorting-announcement' )
			.attr( 'aria-live', 'polite' ).addClass( 'visually-hidden' );
		this.$element.append( this.$filterCnt );
		this.$element.append( this.$sortCnt );
		this.$table = $( '<table>' ).addClass( 'oojsplus-data-gridWidget-table' );
		this.$table.append( $( '<caption>' ).addClass( 'oojsplus-data-gridWidget-caption' ) );
		this.$table.append( $( '<thead>' ).addClass( 'oojsplus-data-gridWidget-header' ) );
		this.$table.append( $( '<tbody>' ).addClass( 'oojsplus-data-gridWidget-tbody' ) );
		this.$wrapper = $( '<div>' );
		this.$element.append( this.$wrapper.append( this.$table ) );
		this.$overlay = cfg.$overlay || null;

		OO.ui.mixin.PendingElement.call( this, {
			$pending: $(this.$table).find( 'thead' )
		} );

		this.style = cfg.style || 'none';
		this.noHeader = cfg.noHeader || false;
		this.caption = cfg.caption || '';
		this.border = cfg.border || 'none';
		this.pageSize = cfg.pageSize || 25;
		this.multiSelect = cfg.multiSelect || false;
		this.multiSelectSelectedByDefault = cfg.multiSelectSelectedByDefault || false;
		this.store = cfg.store || this.createLocalStore( cfg.data || [] );
		this.sticky = false;
		this.groupers = {};
		this.unspecifiedGroupHeader = cfg.unspecifiedGroupHeader || null;
		this.data = cfg.data || [];
		this.resizable = typeof cfg.resizable === 'undefined' ? true : cfg.resizable;
		this.orderable = typeof cfg.orderable === 'undefined' ? true : cfg.orderable;
		this.collapsible = cfg.collapsible || false;
		this.collapsed = cfg.collapsed || false;
		this.actionsVisibleOnHover = cfg.actionsVisibleOnHover || false;
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
		this.addCaption();
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
			var filterAnnouncement = mw.message( 'oojsplus-data-grid-filter-update-results', this.store.getTotal() ).text();
			this.$filterCnt.text( filterAnnouncement );
		}.bind( this ) );

		this.connect( this, {
			selected: 'clickOnRow'
		} );

		if ( this.orderable ) {
			this.$table.sorttable( {} );
		}
		this.$countAnnouncer = $( '<div>' ).attr( 'aria-live', 'polite' ).addClass( 'visually-hidden' );
		this.$element.append( this.$countAnnouncer );
		this.connect( this, {
			datasetChange: 'onDatasetChange'
		} );
		if ( this.collapsible ) {
			this.appendCollapseButton();
		}
	};

	OO.inheritClass( OOJSPlus.ui.data.GridWidget, OO.ui.Widget );
	OO.mixinClass( OOJSPlus.ui.data.GridWidget, OO.ui.mixin.PendingElement );

	OOJSPlus.ui.data.GridWidget.static.tagName = 'div';

	OOJSPlus.ui.data.GridWidget.prototype.buildColumns = function( cfg ) {
		if ( this.multiSelect ) {
			var multiselect = {};
			multiselect.check = {
				type: 'selection',
				title: mw.message( 'oojsplus-data-grid-selection-column-label' ).text(),
				actionId: 'checkRow',
				selected: this.multiSelectSelectedByDefault
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
				columnWidget = new columnClass( $.extend( column, { resizable: this.resizable, $overlay: this.$overlay } ) );
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
			columnWidget.bindToGrid( this );
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

	OOJSPlus.ui.data.GridWidget.prototype.onFilter = function( filter, field ) {
		this.clearItems();
		this.store.filter( filter, field );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onStoreLoaded = function( rows ) {
		this.setActiveFilters( Object.keys( this.store.getFilters() ) );
		this.setLoading( false );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onStoreLoading = function() {
		this.setLoading( true );
	};

	OOJSPlus.ui.data.GridWidget.prototype.setLoading = function( loading ) {
		if ( loading ) {
			this.pushPending();
			return;
		}
		while ( this.isPending() ) {
			this.popPending();
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.setActiveFilters = function( fields ) {
		for ( var columnKey in this.columns ) {
			if ( !this.columns.hasOwnProperty( columnKey ) ) {
				continue;
			}
			this.columns[columnKey].setHasActiveFilter( fields.indexOf( columnKey ) !== -1 );
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.addCaption = function() {
		if ( this.caption.length === 0 ) {
			return;
		}
		var $caption = this.$table.find( 'caption' );
		$caption.append( this.caption );
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
			label: mw.message( 'oojsplus-data-grid-toolbar-settings-aria-label' ).text(),
			invisibleLabel: true,
			$overlay: this.$overlay || true,
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
			if ( column instanceof OOJSPlus.ui.data.column.Action ||
				column instanceof OOJSPlus.ui.data.column.Image ) {
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
		if ( this.actionsVisibleOnHover ) {
			$row.addClass( 'actions-visible-on-hover' );
		}

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

		if ( this.multiSelect && this.multiSelectSelectedByDefault ) {
			this.selectedRows.push( item );
		}
		if ( !this.multiSelect ) {
			$row.on( 'click', { $row: $row, item: item },
				this.clickOnRow.bind( this ) );
		}
		$row.on( 'mouseenter', this.mouseEnterRow.bind( this ) );
		$row.on( 'mouseleave', this.mouseOutRow.bind( this ) );

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
		var columnName = this.columns[ field ].headerText;
		var directionMsg = mw.message( 'oojsplus-data-grid-sort-direction-desc', columnName ).text();
		if ( !sorter ) {
			directionMsg = mw.message( 'oojsplus-data-grid-sort-direction-none', columnName ).text();
		} else if ( sorter.direction === 'ASC' ) {
			directionMsg = mw.message( 'oojsplus-data-grid-sort-direction-asc', columnName ).text();
		}
		this.$sortCnt.text( directionMsg ).text();
		this.clearItems();
		this.store.sort( sorter, field );
	};

	OOJSPlus.ui.data.GridWidget.prototype.setItems = function( data ) {
		if ( data.length === 0 ) {
			this.setLoading( false );
			this.addEmptyRow();
			this.emit( 'datasetChange' );
			return;
		}
		this.clearItems();
		this.addItemsInternally( data );
		this.setColumnsVisibility( this.visibleColumns );
		this.setLoading( false );
		this.adjustFilterAnnouncement();
		this.emit( 'datasetChange' );
	};

	OOJSPlus.ui.data.GridWidget.prototype.adjustFilterAnnouncement = function() {
		var filters = this.store.getFilters();
		var filterKeys = Object.keys( filters );
		if ( filterKeys.length === 0 ) {
			var announcement = mw.message( 'oojsplus-data-grid-filter-update-no-filter' ).text();
			this.$filterCnt.text( announcement );
		} else {
			var filterNames = '';
			filterKeys.forEach( key => {
				var filterName = filters[ key ].getName();
				var filterValue = filters[ key ].getFilterValue()['value'];
				filterNames += mw.message( 'oojsplus-data-grid-filter-list-with-value', filterName, filterValue ).text()
				if ( filterKeys[ filterKeys.length - 1] !== key ) {
					filterNames += ', ';
				} else {
					filterNames += '.';
				}
			} );
			var filterAnnouncement = mw.message( 'oojsplus-data-grid-filter-update-active-filter',
				filterKeys.length, filterNames ).text();
			this.$filterCnt.text( filterAnnouncement );
		}
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
		this.emit( 'rowSelected', e.data, this.getSelectedRows() );
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

	OOJSPlus.ui.data.GridWidget.prototype.announceCount = function() {
		var count = this.store.getTotal();
		var countMsg = mw.message( 'oojsplus-data-grid-filter-update-results', count ).text();
		this.$countAnnouncer.text( countMsg );
	};

	OOJSPlus.ui.data.GridWidget.prototype.onDatasetChange = function() {
		this.announceCount();
		this.selectedRows = [];
	};

	OOJSPlus.ui.data.GridWidget.prototype.appendCollapseButton = function() {
		let label = mw.message( 'oojsplus-data-grid-collapse-collapse' ).text();
		if ( this.collapsed ) {
			label = mw.message( 'oojsplus-data-grid-collapse-expand' ).text();
		}
		this.$collapseButton = $( '<button>' ).addClass(
			'oojsplus-data-grid-collapse mw-collapsible-toggle-default mw-collapsible-toggle'
		);
		this.$collapseLabel = $( '<span>' ).addClass( 'mw-collapsible-text' ).text( label );
		this.$collapseButton.append( this.$collapseLabel );
		this.$collapseButton.attr( 'aria-expanded', !this.collapsed );
		this.$collapseButton.on( 'click', function () {
			if ( this.collapsed ) {
				this.collapsed = false;
				this.$collapseLabel.text( mw.message( 'oojsplus-data-grid-collapse-collapse' ).text() );
				this.toggleTableVisibility();
			} else {
				this.collapsed = true;
				this.$collapseLabel.text( mw.message( 'oojsplus-data-grid-collapse-expand' ).text() );
				this.toggleTableVisibility();
			}
			this.$collapseButton.attr( 'aria-expanded', !this.collapsed );
		}.bind( this ) );
		if ( this.collapsed ) {
			this.toggleTableVisibility();
		}
		this.$element.prepend( this.$collapseButton );
	};

	OOJSPlus.ui.data.GridWidget.prototype.toggleTableVisibility = function() {
		if ( this.collapsed ) {
			var $header = this.$table.find( 'thead' );
			$header.attr( 'style', 'display: none' );
			var $body = this.$table.find( 'tbody' );
			$body.attr( 'style', 'display: none' );
			this.toolbar.$element.attr( 'style', 'display: none' );
		} else {
			var $header = this.$table.find( 'thead' );
			$header.removeAttr( 'style' );
			var $body = this.$table.find( 'tbody' );
			$body.removeAttr( 'style' );
			this.toolbar.$element.removeAttr( 'style' );
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.setActionsVisibleOnHover = function( visible ) {
		this.actionsVisibleOnHover = visible;
	};

	OOJSPlus.ui.data.GridWidget.prototype.mouseEnterRow = function( e ) {
		if ( this.actionsVisibleOnHover ) {
			$( '.secondary-actions-menu' ).addClass( 'oo-ui-element-hidden' );
			// Hide all visible action cells
			this.$element.find( '.action-cell.col-visible' ).removeClass( 'col-visible' );
			$( e.currentTarget ).find( '.action-cell.action-cell-visible-on-hover' ).addClass( 'col-visible' );
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.mouseOutRow = function( e ) {
		if ( !$( e.relatedTarget ).closest( '.oo-ui-menuSelectWidget' ).length ) {
			// Hide unless going to secondary action menu
			$( e.currentTarget ).find( '.action-cell.action-cell-visible-on-hover' ).removeClass( 'col-visible' );
		}
	};

	OOJSPlus.ui.data.GridWidget.prototype.addEmptyRow = function() {
		var $body = this.$table.find( 'tbody' );
		var $row = $( '<tr>' ).addClass( 'oojsplus-data-gridWidget-row' );
		var columns = this.getCurrentColumnOrder();
		var $cell = $( '<td>' ).attr( 'colspan', columns.length );
		$cell.addClass( 'oojsplus-data-gridWidget-no-results' );
		var placeHolderWidget = new OOJSPlus.ui.widget.NoContentPlaceholderWidget({
			icon: 'grid-no-entries',
			label: mw.message( 'oojsplus-data-grid-no-results' ).text()
		} );
		$cell.append( placeHolderWidget.$element );
		$row.append( $cell );
		$body.append( $row );
	};
} )( mediaWiki, jQuery );
