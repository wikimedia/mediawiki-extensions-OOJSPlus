OOJSPlus.ui.data.column.Boolean = function ( cfg ) {
	cfg = cfg || {};
	cfg.align = 'center';
	OOJSPlus.ui.data.column.Boolean.parent.call( this, cfg );
	this.showOnlyTrue = cfg.onlyShowTrue || false;
	this.$element.addClass( 'boolean-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Boolean, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Boolean.prototype.renderCell = function( value, row ) {
	var $cell = OOJSPlus.ui.data.column.Boolean.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'boolean-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.Boolean.prototype.getViewControls = function( value ) {
	if( typeof value === 'string' ) {
		value = value === 'true';
	}
	return new OO.ui.IconWidget( {
		icon: value ? 'check' : this.showOnlyTrue ? '' : 'close'
	} );
};

OOJSPlus.ui.data.column.Boolean.prototype.sort = function( a, b ) {
	if( a === b ) {
		return 0;
	}
	else if( a === true && b === false ) {
		return 1;
	} else {
		return -1;
	}
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'boolean', OOJSPlus.ui.data.column.Boolean );
