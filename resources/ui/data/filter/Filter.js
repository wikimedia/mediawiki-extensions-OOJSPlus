OOJSPlus.ui.data.filter.Filter = function ( cfg ) {
	OOJSPlus.ui.data.filter.Filter.parent.call( this, {} );
	this.type = cfg.type;
	this.conditionValue = cfg.value || '';
	this.value = this.getFilterValue();
	this.closePopupOnChange = cfg.closePopupOnChange || false;

	this.label = new OO.ui.LabelWidget( { label: mw.message( 'oojsplus-data-grid-filter-label' ).text() } );

	this.$element.append( new OO.ui.HorizontalLayout( {
		items: [ this.label, this.getClearButton() ],
		classes: [ 'grid-filter-popup-head' ]
	} ).$element );
	this.$element.append( this.getLayout().$element );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Filter, OO.ui.Widget );

OOJSPlus.ui.data.filter.Filter.prototype.getLayout = function() {
	return new OO.ui.FieldsetLayout();
};

OOJSPlus.ui.data.filter.Filter.prototype.getType = function() {
	return this.type;
};

OOJSPlus.ui.data.filter.Filter.prototype.focus = function() {
	// STUB
};

OOJSPlus.ui.data.filter.Filter.prototype.getClearButton = function() {
	this.clearButton = new OO.ui.ButtonWidget( {
		framed: false,
		label: mw.message( 'oojsplus-data-grid-filter-clear' ).text(),
		flags: [ 'primary', 'destructive' ],
		disabled: true
	} );

	this.clearButton.connect( this, {
		click: function() {
			this.clearValues();
			this.emit( 'clear' );

		}
	} );
	return this.clearButton;
};

OOJSPlus.ui.data.filter.Filter.prototype.getValue = function() {
	return this.value;
};

OOJSPlus.ui.data.filter.Filter.prototype.setValue = function( value ) {
	this.value = value;
};

OOJSPlus.ui.data.filter.Filter.prototype.changeValue = function( value ) {
	var shouldClosePopup = this.closePopupOnChange;
	if ( !value ) {
		this.value = null;
		this.clearButton.setDisabled( true );
		shouldClosePopup = true;
	} else {
		this.conditionValue = value;
		this.value = this.getFilterValue();
		this.clearButton.setDisabled( false );
	}

	this.emit( 'change', this, shouldClosePopup );
};

OOJSPlus.ui.data.filter.Filter.prototype.clearValues = function() {
	this.changeValue( '' );
};

OOJSPlus.ui.data.filter.Filter.prototype.getFilterValue = function() {
	return {
		value: this.conditionValue
	};
};

OOJSPlus.ui.data.filter.Filter.prototype.matches = function( value ) {
	return true;
};
