OOJSPlus.ui.data.column.Text = function ( cfg ) {
	OOJSPlus.ui.data.column.Text.parent.call( this, cfg );

	this.$element.addClass( 'text-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Text, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Text.prototype.renderCell = function( value, row ) {
	value = this.getDisplayText( value, row );
	var $cell = OOJSPlus.ui.data.column.Text.parent.prototype.renderCell.apply( this, [ value ] );
	$cell.addClass( 'text-cell' );
	return $cell;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'text', OOJSPlus.ui.data.column.Text );
