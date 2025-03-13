OOJSPlus.ui.data.filter.Boolean = function ( cfg ) {
	this.conditionValue = cfg.value || false;
	this.value = this.getFilterValue();
	this.trueLabel = cfg.trueLabel || mw.message( 'oojsplus-data-grid-filter-boolean-true' ).text();
	this.falseLabel = cfg.falseLabel || mw.message( 'oojsplus-data-grid-filter-boolean-false' ).text();
	cfg.closePopupOnChange = true;
	OOJSPlus.ui.data.filter.Boolean.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.filter.Boolean, OOJSPlus.ui.data.filter.Filter );

OOJSPlus.ui.data.filter.Boolean.prototype.getLayout = function () {
	this.valueInput = new OO.ui.RadioSelectWidget( {
		items: [
			new OO.ui.RadioOptionWidget( {
				data: true,
				label: this.trueLabel
			} ),
			new OO.ui.RadioOptionWidget( {
				data: false,
				label: this.falseLabel
			} )
		]
	} );
	this.valueInput.connect( this, {
		select: 'changeValue'
	} );

	return new OO.ui.FieldLayout( this.valueInput, {
		label: mw.message( 'oojsplus-data-grid-filter-label' ).text(),
		align: 'top'
	} );
};

OOJSPlus.ui.data.filter.Boolean.prototype.getFilterValue = function () {
	const item = this.valueInput ? this.valueInput.findSelectedItem() : null;
	let val = this.conditionValue;
	if ( item ) {
		val = item.getData();
	}
	return {
		value: val,
		operator: 'eq',
		comparison: 'eq',
		type: 'boolean'
	};
};

OOJSPlus.ui.data.filter.Boolean.prototype.setValue = function ( value ) {
	OOJSPlus.ui.data.filter.Boolean.parent.prototype.setValue.call( this, value );
	if ( this.valueInput && ( value === true || value === false ) ) {
		const item = this.valueInput.selectItemByData( value ); // eslint-disable-line no-unused-vars
	}

};

OOJSPlus.ui.data.filter.Boolean.prototype.clearValues = function () {
	const selected = this.valueInput.findSelectedItem();
	if ( selected ) {
		this.valueInput.unselectItem( selected );
	}
};

OOJSPlus.ui.data.filter.Boolean.prototype.matches = function ( value ) {
	return value === this.value.value;
};

OOJSPlus.ui.data.filter.Boolean.prototype.doChangeValue = function ( value ) {
	value = value ? value.getData() : null;
	let shouldClosePopup = this.closePopupOnChange;
	if ( value === null ) {
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

OOJSPlus.ui.data.registry.filterRegistry.register( 'boolean', OOJSPlus.ui.data.filter.Boolean );
