OOJSPlus.ui.data.filter.Boolean = function ( cfg ) {
	this.value = this.getFilterValue();
	cfg.closePopupOnChange = true;
	OOJSPlus.ui.data.filter.Boolean.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Boolean, OOJSPlus.ui.data.filter.Filter );

OOJSPlus.ui.data.filter.Boolean.prototype.getLayout = function() {
	this.valueWidget = new OO.ui.ToggleSwitchWidget();
	this.valueWidget.connect( this, {
		change: 'changeValue'
	} );

	return new OO.ui.FieldLayout( this.valueWidget, {
		label: mw.message( 'oojsplus-data-grid-filter-boolean' ).text(),
		align: 'left'
	} )
};

OOJSPlus.ui.data.filter.Boolean.prototype.getFilterValue = function() {
	return {
		value: this.valueWidget ? this.valueWidget.getValue() : false,
		operator: 'eq',
		type: 'boolean'
	};
};

OOJSPlus.ui.data.filter.Boolean.prototype.setValue = function( value ) {
	OOJSPlus.ui.data.filter.Boolean.parent.prototype.setValue.call( this, value );
	this.valueWidget.setValue( value.value );
};

OOJSPlus.ui.data.filter.Boolean.prototype.clearValues = function() {
	this.valueWidget.setValue( false );
};

OOJSPlus.ui.data.filter.Boolean.prototype.matches = function( value ) {
	return value === this.value.value;
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'boolean', OOJSPlus.ui.data.filter.Boolean );
