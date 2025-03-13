OOJSPlus.ui.data.column.Number = function ( cfg ) {
	OOJSPlus.ui.data.column.Number.parent.call( this, cfg );

	this.$element.addClass( 'number-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Number, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Number.prototype.renderCell = function ( value, row ) {
	const $cell = OOJSPlus.ui.data.column.Number.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'number-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.Number.prototype.getViewControls = function ( value, row ) { // eslint-disable-line no-unused-vars
	return new OOJSPlus.ui.widget.ExpandableLabelWidget( { label: value.toString() || '', maxLength: this.maxLabelLength } );
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'number', OOJSPlus.ui.data.column.Number );
