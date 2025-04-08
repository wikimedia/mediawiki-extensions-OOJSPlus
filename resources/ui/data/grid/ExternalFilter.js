OOJSPlus.ui.data.grid.ExternalFilter = function ( cfg ) {
	OOJSPlus.ui.data.grid.ExternalFilter.parent.call( this, cfg );

	this.store = cfg.store;
	this.input = new OO.ui.SearchInputWidget(
		Object.assign( cfg.queryConfig || {}, { placeholder: mw.msg( 'oojsplus-field-label-query' ) } )
	);
	this.input.connect( this, {
		change: 'onQueryChange'
	} );

	this.$element.addClass( 'oojsplus-ExternalFilter' );
	this.$element.append( this.input.$element );

	if ( cfg.sort ) {
		this.sortWidget = new OOJSPlus.ui.widget.SortWidget( cfg.sort );
		this.sortWidget.connect( this, {
			change: 'onSortChange'
		} );
		this.$element.append( this.sortWidget.$element );
	}
};

OO.inheritClass( OOJSPlus.ui.data.grid.ExternalFilter, OO.ui.Widget );

OOJSPlus.ui.data.grid.ExternalFilter.prototype.onQueryChange = function ( value ) {
	this.store.query( value );
};

OOJSPlus.ui.data.grid.ExternalFilter.prototype.onSortChange = function ( field, direction ) {
	const sorter = new OOJSPlus.ui.data.sorter.Sorter( { direction: direction } );
	this.store.sorters = {};
 	this.store.sort( sorter, field );
};