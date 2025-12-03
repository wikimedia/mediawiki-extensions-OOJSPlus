OOJSPlus.ui.data.filter.Filter = function ( cfg ) {
	OOJSPlus.ui.data.filter.Filter.parent.call( this, {} );
	this.type = cfg.type;
	this.conditionValue = cfg.value || '';
	this.value = this.getFilterValue();
	this.filterName = cfg.filterName || '';
	this.closePopupOnChange = cfg.autoClosePopup || false;
	this.delayChange = cfg.delayChange || false;
	this.icon = cfg.icon || 'funnel';

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
		shouldClosePopup = true;
	} else {
		this.conditionValue = value;
		this.value = this.getFilterValue();
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

OOJSPlus.ui.data.filter.Filter.prototype.getDisplayValue = function () {
	if ( this.value && this.value.value ) {
		return this.value.value.toString();
	}
};
