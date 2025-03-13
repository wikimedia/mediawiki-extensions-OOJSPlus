OOJSPlus.ui.data.column.Boolean = function ( cfg ) {
	cfg = cfg || {};
	cfg.align = 'center';
	cfg.autoClosePopup = true;
	OOJSPlus.ui.data.column.Boolean.parent.call( this, cfg );
	this.showOnlyTrue = cfg.onlyShowTrue || false;
	this.$element.addClass( 'boolean-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Boolean, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Boolean.prototype.renderCell = function ( value, row ) {
	const $cell = OOJSPlus.ui.data.column.Boolean.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'boolean-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.Boolean.prototype.getViewControls = function ( value ) {
	if ( typeof value === 'string' ) {
		value = value === 'true';
	}
	const widget = new OO.ui.IconWidget( {
		icon: value ? 'color-check' : this.showOnlyTrue ? '' : 'color-cross'
	} );
	widget.$element.attr( 'aria-label', value ? 'checked' : 'unchecked' );
	return widget;
};

OOJSPlus.ui.data.column.Boolean.prototype.sort = function ( a, b ) {
	if ( a === b ) {
		return 0;
	} else if ( a === true && b === false ) {
		return 1;
	} else {
		return -1;
	}
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'boolean', OOJSPlus.ui.data.column.Boolean );
