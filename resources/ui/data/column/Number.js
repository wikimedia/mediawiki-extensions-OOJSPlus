OOJSPlus.ui.data.column.Number = function ( cfg ) {
	OOJSPlus.ui.data.column.Number.parent.call( this, cfg );

	this.$element.addClass( 'number-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Number, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Number.prototype.renderCell = function( value, row ) {
	value = this.getDisplayText( value, row );

	var $cell = OOJSPlus.ui.data.column.Number.parent.prototype.renderCell.apply( this, [ value.toString() ] );
	$cell.addClass( 'number-cell' );
	return $cell;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'number', OOJSPlus.ui.data.column.Number );
