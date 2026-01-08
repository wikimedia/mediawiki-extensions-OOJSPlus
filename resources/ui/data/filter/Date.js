OOJSPlus.ui.data.filter.Date = function ( cfg ) {
	cfg = cfg || {};
	cfg.icon = 'calendar';
	cfg.autoClosePopup = false;
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

	this.conditionValue = new Date().toISOString().substring( 0, 10 );
	this.input = new OOJSPlus.ui.widget.DateInputWidget( {
		value: this.conditionValue
	} );
	this.input.$element.addClass( 'oojsplus-date-filter' );
	this.input.connect( this, {
		change: 'inputChangeValue'
	} );

	const $layout = new OO.ui.FieldsetLayout( {
		items: [
			new OO.ui.FieldLayout( this.input, {
				label: mw.msg( 'oojsplus-data-grid-filter-date-input-label' ),
				align: 'top'
			} ),
			new OO.ui.FieldLayout( this.operatorWidget, {
				label: mw.msg( 'oojsplus-data-grid-filter-date-operator-input-label' ),
				align: 'top'
			} )
		]
	} );
	// `aria-atomic` will also announce changes to the grid dataset, as changing date will auto-apply filter
	this.$announcer = $( '<div>' ).attr( 'aria-live', 'polite' ).attr( 'aria-atomic', 'true' ).addClass( 'visually-hidden' );
	$layout.$element.append( this.$announcer );
	return $layout;
};

// Prevent closing filter if delete is used in calendar popup
OOJSPlus.ui.data.filter.Date.prototype.inputChangeValue = function ( value ) {
	if ( !value ) {
		return;
	}
	this.changeValue( value );
};

OOJSPlus.ui.data.filter.Date.prototype.makeOperatorWidget = function () {
	this.operatorWidget = new OO.ui.DropdownInputWidget( {
		options: [
			{
				data: 'eq',
				label: mw.msg( 'oojsplus-data-grid-filter-date-operator-eq-label' )
			},
			{
				data: 'gt',
				label: mw.msg( 'oojsplus-data-grid-filter-date-operator-gt-label' )
			},
			{
				data: 'lt',
				label: mw.msg( 'oojsplus-data-grid-filter-date-operator-lt-label' )
			}
		],
		$overlay: true
	} );
	this.operatorWidget.setValue( this.operator );
	this.operatorWidget.connect( this, {
		change: 'changeOperator'
	} );
};

OOJSPlus.ui.data.filter.Date.prototype.changeOperator = function ( operator ) {
	this.operator = operator;
	this.changeValue( this.conditionValue );
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
	OOJSPlus.ui.data.filter.Filter.prototype.setValue.call( this, value );
	this.operator = value.operator;
};

OOJSPlus.ui.data.filter.Date.prototype.clearValues = function () {
	OOJSPlus.ui.data.filter.Filter.prototype.clearValues.call( this );
	this.input.setValue( '' );
};

OOJSPlus.ui.data.filter.Date.prototype.convertToFilterDate = function ( value ) {
	if ( !value ) {
		return value;
	}
	// Convert Y-m-d to Ymd
	const date = value.split( '-' );
	return date.join( '' );
};

OOJSPlus.ui.data.filter.Date.prototype.getDisplayValue = function () {
	if ( this.value && this.value.value ) {
		const language = mw.user.options.get( 'language' );
		const value = new Date( this.conditionValue ).toLocaleDateString( [ language, 'en' ] );
		return mw.msg( 'oojsplus-data-grid-date-filter-operator-label-' + this.operator, value );
	}
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
