OOJSPlus.ui.data.filter.Date = function ( cfg ) {
	OOJSPlus.ui.data.filter.Date.parent.call( this, cfg );
	this.operator = cfg.operator || 'eq';
	this.value = this.getFilterValue();
	this.connect( this, {
		change: 'announce'
	} );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Date, OOJSPlus.ui.data.filter.Number );

OOJSPlus.ui.data.filter.Date.prototype.getLayout = function () {
	this.makeOperatorWidget();

	this.input = new mw.widgets.CalendarWidget();
	this.input.$element.addClass( 'oojsplus-date-filter' );
	this.input.upButton.$element.remove();
	this.input.connect( this, {
		change: 'changeValue'
	} );

	const $layout = new OO.ui.FieldsetLayout( { items: [
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
	$layout.$element.append( this.$announcer );
	return $layout;
};

OOJSPlus.ui.data.filter.Date.prototype.makeOperatorWidget = function () {
	this.operatorWidget = new OO.ui.ButtonSelectWidget( {
		items: [
			new OO.ui.ButtonOptionWidget( {
				data: 'eq',
				label: mw.message( 'oojsplus-data-grid-filter-date-on' ).text()
			} ),
			new OO.ui.ButtonOptionWidget( {
				data: 'gt',
				label: mw.message( 'oojsplus-data-grid-filter-date-after' ).text()
			} ),
			new OO.ui.ButtonOptionWidget( {
				data: 'lt',
				label: mw.message( 'oojsplus-data-grid-filter-date-before' ).text()
			} )
		]
	} );
	this.operatorWidget.selectItemByData( this.operator );
	this.operatorWidget.connect( this, {
		select: 'changeOperator'
	} );
};

OOJSPlus.ui.data.filter.Date.prototype.changeOperator = function ( operator ) {
	this.operator = operator.getData();
	if ( this.conditionValue ) {
		this.changeValue( this.conditionValue );
	}
};

OOJSPlus.ui.data.filter.Date.prototype.getFilterValue = function () {
	return {
		value: this.convertToFilterDate( this.conditionValue ),
		operator: this.operator,
		comparison: this.operator,
		type: 'date'
	};
};

OOJSPlus.ui.data.filter.Date.prototype.setValue = function ( value ) {
	OOJSPlus.ui.data.filter.String.parent.prototype.setValue.call( this, value );
	this.input.setValue( value.value );
	this.operator = value.operator;
};

OOJSPlus.ui.data.filter.Date.prototype.clearValues = function () {
	this.input.setDate( null );
	this.input.resetUI();
};

OOJSPlus.ui.data.filter.Date.prototype.convertToFilterDate = function ( value ) {
	if ( !value ) {
		return value;
	}
	// Convert Y-m-d to Ymd
	const date = value.split( '-' );
	return date.join( '' );
};

OOJSPlus.ui.data.filter.Date.prototype.announce = function () {
	const operator = this.operator;
	const value = this.conditionValue;

	// The following messages are used here:
	// * oojsplus-data-grid-date-filter-announce-lt
	// * oojsplus-data-grid-date-filter-announce-eq
	// * oojsplus-data-grid-date-filter-announce-qt
	this.$announcer.text( mw.msg( 'oojsplus-data-grid-date-filter-announce-' + operator, value ) );
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'date', OOJSPlus.ui.data.filter.Date );
