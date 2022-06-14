OOJSPlus.ui.data.filter.Number = function ( cfg ) {
	this.operator = cfg.operator || 'eq';
	this.value = this.getFilterValue();
	OOJSPlus.ui.data.filter.Number.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Number, OOJSPlus.ui.data.filter.Filter );

OOJSPlus.ui.data.filter.Number.prototype.getLayout = function() {
	this.operatorWidget = new OO.ui.ButtonSelectWidget( {
		items: [
			new OO.ui.ButtonOptionWidget( {
				data: 'eq',
				label: '='
			} ),
			new OO.ui.ButtonOptionWidget( {
				data: 'gt',
				label: '>'
			} ),
			new OO.ui.ButtonOptionWidget( {
				data: 'lt',
				label: '<'
			} )
		]
	} );
	this.operatorWidget.selectItemByData( this.operator );
	this.operatorWidget.connect( this, {
		select: 'changeOperator'
	} );
	this.input = new OO.ui.NumberInputWidget( { step: 1 } );
	this.input.connect( this, {
		change: 'changeValue'
	} );

	return new OO.ui.FieldsetLayout( { items: [
			new OO.ui.FieldLayout( this.operatorWidget, {
				label: mw.message( 'oojsplus-data-grid-filter-number-operator' ).text(),
				align: 'left'
			} ),
			new OO.ui.FieldLayout( this.input, {
				label: mw.message( 'oojsplus-data-grid-filter-number-value' ).text(),
				align: 'left'
			} )
		]
	} );
};

OOJSPlus.ui.data.filter.Number.prototype.focus = function() {
	this.input.focus();
};

OOJSPlus.ui.data.filter.Number.prototype.getFilterValue = function() {
	return {
		value: this.conditionValue,
		operator: this.operator,
		type: 'string'
	};
};

OOJSPlus.ui.data.filter.Number.prototype.changeOperator = function( operator ) {
	this.operator = operator.getData();
	if ( this.input.getValue() !== '' ) {
		this.changeValue( this.input.getValue() );
	}
};

OOJSPlus.ui.data.filter.Number.prototype.setValue = function( value ) {
	OOJSPlus.ui.data.filter.Number.parent.prototype.setValue.call( this, value );
	this.input.setValue( value.value );
	this.operator = value.operator;
};

OOJSPlus.ui.data.filter.Number.prototype.clearValues = function() {
	this.input.setValue( '' );
	this.operator = 'eq';
	this.operatorWidget.selectItemByData( this.operator );
};

OOJSPlus.ui.data.filter.Number.prototype.matches = function( value ) {
	switch ( this.operator ) {
		case 'eq':
			return value === this.value.value;
		case 'lt':
			return value < this.value.value;
		case 'gt':
			return value > this.value.value;
		default:
			return true;
	}
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'number', OOJSPlus.ui.data.filter.Number );
