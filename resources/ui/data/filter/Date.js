OOJSPlus.ui.data.filter.Date = function ( cfg ) {
	OOJSPlus.ui.data.filter.Date.parent.call( this, cfg );
	this.operator = cfg.operator || 'eq';
	this.value = this.getFilterValue();
	this.connect( this, {
		change: 'announce'
	} );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Date, OOJSPlus.ui.data.filter.Number );

OOJSPlus.ui.data.filter.Date.prototype.getLayout = function() {
	this.makeOperatorWidget();

	this.input = new mw.widgets.CalendarWidget(  );
	this.input.$element.addClass( 'oojsplus-date-filter' );
	this.input.upButton.$element.remove();
	this.input.connect( this, {
		change: 'changeValue'
	} );

	var $layout = new OO.ui.FieldsetLayout( { items: [
			new OO.ui.FieldLayout( new OO.ui.LabelWidget( {
				label: mw.message( 'oojsplus-data-grid-filter-label' ).text()
			} ) ),
			new OO.ui.FieldLayout( this.operatorWidget, {
				label: mw.message( 'oojsplus-data-grid-filter-operator' ).text(),
				align: 'left'
			} ),
			this.input
		]
	} );
	// `aria-atomic` will also announce changes to the grid dataset, as changing date will auto-apply filter
	this.$announcer = $( '<div>' ).attr( 'aria-live', 'polite' ).attr( 'aria-atomic', 'true' ).addClass( 'visually-hidden' );
	$layout	.$element.append( this.$announcer );
	return $layout;
};

OOJSPlus.ui.data.filter.Date.prototype.changeOperator = function( operator ) {
	this.operator = operator.getData();
	if ( this.conditionValue ) {
		this.changeValue( this.conditionValue );
	}
};

OOJSPlus.ui.data.filter.Date.prototype.getFilterValue = function() {
	return {
		value: this.convertToFilterDate( this.conditionValue ),
		operator: this.operator,
		type: 'date'
	};
};

OOJSPlus.ui.data.filter.Date.prototype.setValue = function( value ) {
	OOJSPlus.ui.data.filter.String.parent.prototype.setValue.call( this, value );
	this.input.setValue( value.value );
	this.operator = value.operator;
};

OOJSPlus.ui.data.filter.Date.prototype.clearValues = function() {
	this.input.setDate( null );
	this.input.resetUI();
};

OOJSPlus.ui.data.filter.Date.prototype.convertToFilterDate = function( value ) {
	if ( !value ) {
		return value;
	}
	// Convert Y-m-d to Ymd
	var date = value.split( '-' );
	return date.join( '' );
};

OOJSPlus.ui.data.filter.Date.prototype.announce = function() {
	var operator = this.operator;
	var value = this.conditionValue;

	// oojsplus-data-grid-date-filter-announce-lt
	// oojsplus-data-grid-date-filter-announce-eq
	// oojsplus-data-grid-date-filter-announce-qt
	this.$announcer.text( mw.msg( 'oojsplus-data-grid-date-filter-announce-' + operator, value ) );
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'date', OOJSPlus.ui.data.filter.Date );
