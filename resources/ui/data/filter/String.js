OOJSPlus.ui.data.filter.String = function ( cfg ) {
	cfg = cfg || {};
	cfg.delayChange = true;
	OOJSPlus.ui.data.filter.String.parent.call( this, cfg );
	this.operator = cfg.operator || 'ct';
	this.value = this.getFilterValue();
	this.$element.addClass( 'oojsplus-string-filter' );
};

OO.inheritClass( OOJSPlus.ui.data.filter.String, OOJSPlus.ui.data.filter.Filter );

OOJSPlus.ui.data.filter.String.prototype.getLayout = function () {
	this.input = new OO.ui.TextInputWidget();

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

OOJSPlus.ui.data.filter.String.prototype.getFilterValue = function () {
	return {
		value: this.conditionValue,
		operator: this.operator,
		comparison: this.operator,
		type: 'string'
	};
};

OOJSPlus.ui.data.filter.String.prototype.setValue = function ( value ) {
	OOJSPlus.ui.data.filter.String.parent.prototype.setValue.call( this, value );
	this.input.setValue( value.value );
	this.operator = value.operator;
};

OOJSPlus.ui.data.filter.String.prototype.clearValues = function () {
	this.input.setValue( '' );
	OOJSPlus.ui.data.filter.String.parent.prototype.clearValues.call( this );
};

OOJSPlus.ui.data.filter.String.prototype.matches = function ( value ) {
	switch ( this.operator ) {
		case 'eq':
			return value.toLocaleLowerCase() === this.value.value.toLocaleLowerCase();
		case 'ct':
			return value.toLocaleLowerCase().includes( this.value.value.toLocaleLowerCase() );
		default:
			return true;
	}
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'string', OOJSPlus.ui.data.filter.String );
