OOJSPlus.ui.data.filter.Filter = function ( cfg ) {
	OOJSPlus.ui.data.filter.Filter.parent.call( this, {} );
	this.type = cfg.type;
	this.conditionValue = cfg.value || '';
	this.value = this.getFilterValue();
	this.filterName = '';
	this.closePopupOnChange = cfg.closePopupOnChange || false;
	this.delayChange = cfg.delayChange || false;

	this.$element.append( new OO.ui.HorizontalLayout( {
		items: [ this.getCloseButton(), this.getClearButton() ],
		classes: [ 'grid-filter-popup-head' ]
	} ).$element );
	this.$element.append( this.getLayout().$element );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Filter, OO.ui.Widget );

OOJSPlus.ui.data.filter.Filter.prototype.getLayout = function () {
	return new OO.ui.FieldsetLayout();
};

OOJSPlus.ui.data.filter.Filter.prototype.getType = function () {
	return this.type;
};

OOJSPlus.ui.data.filter.Filter.prototype.focus = function () {
	const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
	const firstFocusableElement = this.$element[ 0 ].querySelector( focusableElements );

	// If there is a focusable element, focus on it
	if ( firstFocusableElement ) {
		firstFocusableElement.focus();
	}
};

OOJSPlus.ui.data.filter.Filter.prototype.setName = function ( name ) {
	this.filterName = name;
};

OOJSPlus.ui.data.filter.Filter.prototype.getName = function () {
	return this.filterName;
};

OOJSPlus.ui.data.filter.Filter.prototype.setOverlay = function ( $overlay ) {
	this.$overlay = $overlay;
};

OOJSPlus.ui.data.filter.Filter.prototype.getClearButton = function () {
	this.clearButton = new OO.ui.ButtonWidget( {
		framed: true,
		label: mw.message( 'oojsplus-data-grid-filter-clear' ).text(),
		flags: [ 'primary', 'destructive' ],
		classes: [ 'grid-filter-popup-clear' ],
		disabled: true
	} );

	this.clearButton.connect( this, {
		click: function () {
			this.clearValues();
			this.emit( 'clear' );

		}
	} );
	return this.clearButton;
};

OOJSPlus.ui.data.filter.Filter.prototype.getCloseButton = function () {
	this.closeButton = new OO.ui.ButtonWidget( {
		framed: false,
		title: mw.message( 'oojsplus-data-grid-filter-close' ).text(),
		classes: [ 'grid-filter-popup-close' ],
		icon: 'close'
	} );

	this.closeButton.connect( this, {
		click: function () {
			this.emit( 'closePopup' );
		}
	} );
	return this.closeButton;
};

OOJSPlus.ui.data.filter.Filter.prototype.getValue = function () {
	return this.value;
};

OOJSPlus.ui.data.filter.Filter.prototype.setValue = function ( value ) {
	this.value = value;
};

OOJSPlus.ui.data.filter.Filter.prototype.changeValue = function ( value ) {
	if ( !this.delayChange ) {
		this.doChangeValue( value );
		return;
	}
	if ( this.changeTimeout ) {
		clearTimeout( this.changeTimeout );
	}
	this.changeTimeout = setTimeout( () => {
		this.doChangeValue( value );
	}, 500 );
};

OOJSPlus.ui.data.filter.Filter.prototype.doChangeValue = function ( value ) {
	let shouldClosePopup = this.closePopupOnChange;
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

OOJSPlus.ui.data.filter.Filter.prototype.clearValues = function () {
	const delayChange = this.delayChange;
	this.delayChange = false;
	this.changeValue( '' );
	this.delayChange = delayChange;
};

OOJSPlus.ui.data.filter.Filter.prototype.getFilterValue = function () {
	return {
		value: this.conditionValue
	};
};

OOJSPlus.ui.data.filter.Filter.prototype.matches = function ( value ) { // eslint-disable-line no-unused-vars
	return true;
};
