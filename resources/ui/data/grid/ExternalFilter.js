/**
 *
 * @param cfg
 * {
 *     @param {OOJSPlus.ui.data.store.DataStore} store
 *     @param {boolean} [showQueryField=false] Whether to show the query input field
 *     @param {string} [queryPlaceholder] Placeholder for the query input field
 *     @param {Object} [sortOptions] Options for sorting, where keys are field names and values are field labels
 *     @param {Object} [filterOptions] Options for filtering, where keys are field names and values are filter configurations
 * }
 * @constructor
 */
OOJSPlus.ui.data.grid.ExternalFilter = function ( cfg ) {
	OOJSPlus.ui.data.grid.ExternalFilter.parent.call( this, cfg );
	this.setLoading( true );

	this.store = cfg.store;
	this.store.connect( this, {
		loaded: 'onStoreLoad'
	} );
	this.showQueryField = cfg.showQueryField || false;
	this.queryPlaceholder = cfg.queryPlaceholder || mw.msg( 'oojsplus-field-label-query' );
	this.sortOptions = cfg.sortOptions || {};
	this.filterOptions = cfg.filterOptions || {};

	this.$sortCnt = $( '<div>' ).addClass( 'oojsplus-data-gridWidget-filter-section' );
	this.$filterCnt = $( '<div>' ).addClass( 'oojsplus-data-gridWidget-filter-section' );
	this.$queryCont = $( '<div>' ).addClass( 'oojsplus-data-gridWidget-filter-section' );

	this.$filterAnnouncer = $( '<div>' ).attr( 'id', 'grid-filter-announcement' )
		.attr( 'aria-live', 'polite' ).addClass( 'visually-hidden' );
	this.$sortAnnouncer = $( '<div>' ).attr( 'id', 'grid-sorting-announcement' )
		.attr( 'aria-live', 'polite' ).addClass( 'visually-hidden' );
	this.$element.append( this.$sortCnt, this.$sortAnnouncer, this.$queryCont, this.$filterCnt, this.$filterAnnouncer );

	this.filterItems = {};
	this.sortItems = {};

	if ( this.showQueryField ) {
		this.input = new OO.ui.SearchInputWidget( {
			placeholder: this.queryPlaceholder
		} );
		this.input.connect( this, {
			change: 'onQueryChange'
		} );
		this.$queryCont.addClass( 'auto-size' );
		this.$queryCont.append( this.input.$element );
	} else {
		this.$filterCnt.addClass( 'auto-size' );
	}

	this.$element.addClass( 'oojsplus-ExternalFilter' );

	if ( Object.keys( this.sortOptions ).length ) {
		this.sortWidget = new OOJSPlus.ui.data.sorter.SortSelector( {
			options: this.sortOptions
		} );
		Object.entries( this.sortOptions ).map( ( [ key, label ] ) => {
			const item = new OOJSPlus.ui.data.sorter.SortItem(key, label, 'ASC');
			item.connect( this, {
				clear: ( key ) => {
					this.onSort( key, null );
				},
				sort: ( key, direction ) => {
					this.onSort( key, direction );
				}
			} );
			this.sortItems[ key ] = item;
		} );
		this.$sortCnt.append( Object.values( this.sortItems ).map( item => item.$element ) );
		this.sortWidget.connect( this, {
			sortAdded: function( key ) {
				this.onSort( key, 'ASC' );
			}
		} );
		this.$element.append( this.sortWidget.$element );
	}
	if ( Object.keys( this.filterOptions ).length ) {
		Object.entries( this.filterOptions ).map( ( [ key, config ] ) => {
			const item = new OOJSPlus.ui.data.filter.FilterItem( config );
			item.connect( this, {
				filterChange: ( f, key ) => {
					this.store.filter( f, key );
				},
				clear: ( key ) => {
					this.filterItems[ key ].$element.hide();
					this.filterSelector.optionInstances[ key ].setDisabled( false );
				}
			} );
			this.filterItems[ key ] = item;
		} );
		this.$filterCnt.append( Object.values( this.filterItems ).map( item => item.$element ) );
		this.filterSelector = new OOJSPlus.ui.data.filter.FilterSelector( {
			options: this.filterOptions
		} );
		this.filterSelector.connect( this, {
			filterAdded: function( key ) {
				if ( !this.filterItems[ key ] ) {
					return;
				}
				this.filterItems[ key ].$element.show();
				this.filterSelector.optionInstances[ key ].setDisabled( true );
				this.filterItems[ key ].togglePopup( true );
			}
		} );
		this.$element.append( this.filterSelector.$element );
	}
};

OO.inheritClass( OOJSPlus.ui.data.grid.ExternalFilter, OO.ui.Widget );

OOJSPlus.ui.data.grid.ExternalFilter.prototype.onQueryChange = function ( value ) {
	this.store.query( value );
};

OOJSPlus.ui.data.grid.ExternalFilter.prototype.onSort = function ( field, direction ) {
	const columnName = this.sortOptions[ field ];
	let directionMsg = mw.message( 'oojsplus-data-grid-sort-direction-desc', columnName ).text();
	if ( !direction ) {
		directionMsg = mw.message( 'oojsplus-data-grid-sort-direction-none', columnName ).text();
	} else if ( direction === 'ASC' ) {
		directionMsg = mw.message( 'oojsplus-data-grid-sort-direction-asc', columnName ).text();
	}
	this.$sortAnnouncer.text( directionMsg ).text();
	let sorter = null;
	if ( direction ) {
		sorter = new OOJSPlus.ui.data.sorter.Sorter( { direction: direction } );
	}
	this.store.sort( sorter, field );
	this.emit( 'columnSort', field, direction );
};

/**
 * Happens when store is loaded, show current sorters from the store
 */
OOJSPlus.ui.data.grid.ExternalFilter.prototype.addSortItems = function ( sorters ) {
	if ( Object.keys( this.sortItems ).length === 0 ) {
		return;
	}
	Object.values( this.sortItems ).forEach( item => {
		item.$element.hide();
	} );
	Object.values( this.sortWidget.optionInstances ).forEach( option => {
		option.setDisabled( false );
	} );

	Object.entries( sorters ).map( ( [ field, sorter ] ) => {
		if ( !this.sortOptions[ field ] ) {
			return;
		}
		this.sortItems[ field ].$element.show();
		this.sortItems[ field ].setDirection( sorter.direction );
		this.sortWidget.optionInstances[ field ].setDisabled( true );
		this.emit( 'columnSort', field, sorter.direction );
	} );
};

/**
 * Happens when store is loaded, show current filters from the store
 */
OOJSPlus.ui.data.grid.ExternalFilter.prototype.addFilterItems = function ( filters ) {
	if ( Object.keys( this.filterItems ).length === 0 ) {
		return null;
	}
	Object.values( this.filterItems ).forEach( item => {
		item.$element.hide();
	} );
	Object.values( this.filterSelector.optionInstances ).forEach( option => {
		option.setDisabled( false );
	} );

	Object.entries( filters ).map( ( [ field, filter ] ) => {
		if ( !this.filterItems[ field ] ) {
			return;
		}
		this.filterItems[ field ].$element.show();
		this.filterItems[ field ].setValue( filter.getValue() );
		this.filterSelector.optionInstances[ field ].setDisabled( true );
	} );
};

/**
 * Called from the grid itself when dataset changes, in order to announce current filters
 */
OOJSPlus.ui.data.grid.ExternalFilter.prototype.adjustFilterAnnouncement = function () {
	const filters = this.store.getFilters();
	const filterKeys = Object.keys( filters );
	if ( filterKeys.length === 0 ) {
		const announcement = mw.message( 'oojsplus-data-grid-filter-update-no-filter' ).text();
		this.$filterAnnouncer.text( announcement );
	} else {
		let filterNames = '';
		filterKeys.forEach( ( key ) => {
			const filterName = filters[ key ].getName();
			const filterValue = filters[ key ].getFilterValue().value;
			filterNames += mw.message( 'oojsplus-data-grid-filter-list-with-value', filterName, filterValue ).text();
			if ( filterKeys[ filterKeys.length - 1 ] !== key ) {
				filterNames += ', ';
			} else {
				filterNames += '.';
			}
		} );
		const filterAnnouncement = mw.message( 'oojsplus-data-grid-filter-update-active-filter',
			filterKeys.length, filterNames ).text();
		this.$filterAnnouncer.text( filterAnnouncement );
	}
};

OOJSPlus.ui.data.grid.ExternalFilter.prototype.onStoreLoad = function () {
	this.setLoading( false );
	this.announceCount();
	this.addSortItems( this.store.sorters || {} );
	this.addFilterItems( this.store.getFilters() );
};

OOJSPlus.ui.data.grid.ExternalFilter.prototype.announceCount = function () {
	const filterAnnouncement = mw.message( 'oojsplus-data-grid-filter-update-results', this.store.getTotal() ).text();
	this.$filterAnnouncer.text( filterAnnouncement );
};

OOJSPlus.ui.data.grid.ExternalFilter.prototype.setLoading = function ( isLoading ) {
	if ( isLoading ) {
		this.$element.css( 'visibility', 'hidden' );
	} else {
		this.$element.css( 'visibility', 'visible' );
	}
};
