OOJSPlus.ui.data.filter.Number = function ( cfg ) {
	cfg = cfg || {};
	cfg.icon = cfg.icon || 'number';
	this.operator = cfg.operator || 'eq';
	this.value = this.getFilterValue();
	cfg.autoClosePopup = false;

	OOJSPlus.ui.data.filter.Number.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Number, OOJSPlus.ui.data.filter.Filter );

OOJSPlus.ui.data.filter.Number.prototype.getLayout = function () {
	this.makeOperatorWidget();
	this.input = new OO.ui.NumberInputWidget( { step: 1 } );
	this.input.connect( this, {
		change: 'changeValue'
	} );

	return new OO.ui.FieldsetLayout( { items: [
		new OO.ui.FieldLayout( this.input, {
			label: mw.msg( 'oojsplus-data-grid-filter-number-input-label' ),
			align: 'top'
		} ),
		new OO.ui.FieldLayout( this.operatorWidget, {
			label: mw.msg( 'oojsplus-data-grid-filter-number-operator-input-label' ),
			align: 'top'
		} )
	]
	} );
};

OOJSPlus.ui.data.filter.Number.prototype.makeOperatorWidget = function () {
	this.operatorWidget =  new OO.ui.DropdownInputWidget( {
		options: [
			{
				data: 'eq',
				label: mw.msg( 'oojsplus-data-grid-filter-number-operator-eq-label' )
			},
			{
				data: 'gt',
				label: mw.msg( 'oojsplus-data-grid-filter-number-operator-gt-label' )
			},
			{
				data: 'lt',
				label: mw.msg( 'oojsplus-data-grid-filter-number-operator-lt-label' )
			}
		],
		$overlay: true
	} );
	this.operatorWidget.setValue( this.operator );
	this.operatorWidget.connect( this, {
		change: 'changeOperator'
	} );
};

OOJSPlus.ui.data.filter.Number.prototype.getFilterValue = function () {
	return {
		value: this.conditionValue,
		operator: this.operator,
		comparison: this.operator,
		type: 'numeric'
	};
};

OOJSPlus.ui.data.filter.Number.prototype.changeOperator = function ( operator ) {
	this.operator = operator;
	if ( this.input.getValue() !== '' ) {
		this.changeValue( this.input.getValue() );
	}
};

OOJSPlus.ui.data.filter.Number.prototype.setValue = function ( value ) {
	OOJSPlus.ui.data.filter.Number.parent.prototype.setValue.call( this, value );
	this.input.setValue( value.value );
	this.operator = value.operator;
};

OOJSPlus.ui.data.filter.Number.prototype.clearValues = function () {
	this.input.setValue( '' );
	this.operator = 'eq';
	this.operatorWidget.selectItemByData( this.operator );
};

OOJSPlus.ui.data.filter.Number.prototype.matches = function ( value ) {
	const cmpValue = parseInt( this.value.value );
	switch ( this.operator ) {
		case 'eq':
			return value === cmpValue;
		case 'lt':
			return value < cmpValue;
		case 'gt':
			return value > cmpValue;
		default:
			return true;
	}
};

OOJSPlus.ui.data.filter.Number.prototype.getDisplayValue = function () {
	if ( this.value && this.value.value !== undefined && this.value.value !== null ) {
		const operatorLabel = mw.msg( 'oojsplus-data-grid-number-filter-operator-label-' + this.operator, this.value.value.toString() );
		return operatorLabel;
	}
	return null;
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'number', OOJSPlus.ui.data.filter.Number );
