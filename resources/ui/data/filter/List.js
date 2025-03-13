OOJSPlus.ui.data.filter.List = function ( cfg ) {
	this.list = cfg.list || [];
	OOJSPlus.ui.data.filter.List.parent.call( this, cfg );
	this.value = this.getFilterValue();
};

OO.inheritClass( OOJSPlus.ui.data.filter.List, OOJSPlus.ui.data.filter.Filter );

OOJSPlus.ui.data.filter.List.prototype.getLayout = function () {
	this.input = new OO.ui.CheckboxMultiselectInputWidget( {
		options: this.list.map( ( i ) => {
			if ( typeof i === 'object' ) {
				return i;
			}
			return { data: i };
		} )
	} );
	this.input.connect( this, {
		change: 'changeValue'
	} );

	return new OO.ui.FieldLayout( this.input, {
		label: mw.message( 'oojsplus-data-grid-filter-label' ).text(),
		align: 'top'
	} );
};

OOJSPlus.ui.data.filter.List.prototype.setOptions = function ( list ) {
	this.list = list;
	this.stopEvents();
	this.input.setOptions( list.map( ( i ) => {
		if ( typeof i === 'object' ) {
			return i;
		}
		return { data: i };
	} ) );
	this.resumeEvents();
};

OOJSPlus.ui.data.filter.List.prototype.getFilterValue = function () {
	return {
		value: this.conditionValue,
		operator: 'in',
		comparison: 'in',
		type: 'list'
	};
};

OOJSPlus.ui.data.filter.List.prototype.setValue = function ( value ) {
	OOJSPlus.ui.data.filter.List.parent.prototype.setValue.call( this, value );
	this.input.setValue( value.value );
};

OOJSPlus.ui.data.filter.List.prototype.changeValue = function ( value ) {
	if ( value.length === 0 ) {
		value = null;
	}
	OOJSPlus.ui.data.filter.List.parent.prototype.changeValue.call( this, value );
};

OOJSPlus.ui.data.filter.List.prototype.clearValues = function () {
	this.input.setValue( [] );
};

OOJSPlus.ui.data.filter.List.prototype.matches = function ( value ) {
	if ( !this.value.value ) {
		return false;
	}
	return this.value.value.indexOf( value ) !== -1;
};

OOJSPlus.ui.data.filter.List.prototype.stopEvents = function () {
	this.input.disconnect( this, {
		change: 'changeValue'
	} );
};

OOJSPlus.ui.data.filter.List.prototype.resumeEvents = function () {
	this.input.connect( this, {
		change: 'changeValue'
	} );
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'list', OOJSPlus.ui.data.filter.List );
