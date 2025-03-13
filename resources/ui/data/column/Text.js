OOJSPlus.ui.data.column.Text = function ( cfg ) {
	OOJSPlus.ui.data.column.Text.parent.call( this, cfg );

	this.isHtml = cfg.html || false;
	this.$element.addClass( 'text-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Text, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Text.prototype.renderCell = function ( value, row ) {
	if ( this.isHtml && typeof value === 'string' && !this.valueParser ) {
		value = new OO.ui.HtmlSnippet( value );
	}
	const $cell = OOJSPlus.ui.data.column.Text.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'text-cell' );
	return $cell;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'text', OOJSPlus.ui.data.column.Text );
