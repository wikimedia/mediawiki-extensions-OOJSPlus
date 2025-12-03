OOJSPlus.ui.data.filter.TagList = function ( cfg ) {
	this.list = cfg.list || [];
	cfg.$overlay = cfg.$overlay || true;
	OOJSPlus.ui.data.filter.TagList.parent.call( this, cfg );
	this.value = this.getFilterValue();
};

OO.inheritClass( OOJSPlus.ui.data.filter.TagList, OOJSPlus.ui.data.filter.List );

OOJSPlus.ui.data.filter.TagList.prototype.getLayout = function () {
	this.input = new OO.ui.MenuTagMultiselectWidget( {
		options: this.list.map( ( i ) => {
			if ( typeof i === 'object' ) {
				return i;
			}
			return { data: i };
		} ),
		allowArbitrary: false,
		$overlay: true,
		menu: { $overlay: true }
	} );
	this.input.connect( this, {
		change: 'changeValue'
	} );

	let label = mw.message( 'oojsplus-data-grid-filter-label' ).text();
	if ( this.filterName !== '' ) {
		label = mw.message( 'oojsplus-data-grid-filter-input-label', this.filterName ).text();
	}
	return new OO.ui.FieldLayout( this.input, {
		label: label,
		align: 'top'
	} );
};

OOJSPlus.ui.data.filter.TagList.prototype.setOptions = function ( list ) {
	this.list = list;
	this.stopEvents();
	this.input.menu.clearItems();
	this.input.addOptions( this.list.map( ( i ) => {
		if ( typeof i === 'object' ) {
			return i;
		}
		return { data: i };
	} ) );
	this.resumeEvents();
};

OOJSPlus.ui.data.filter.TagList.prototype.changeValue = function ( value ) {
	if ( !value || value.length === 0 ) {
		value = [];
	}

	OOJSPlus.ui.data.filter.TagList.parent.prototype.changeValue.call( this, value.map( ( item ) => item.getData() ) );
	this.input.menu.toggle( false );
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'tag_list', OOJSPlus.ui.data.filter.TagList );
