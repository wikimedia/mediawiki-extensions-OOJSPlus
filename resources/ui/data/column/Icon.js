OOJSPlus.ui.data.column.Icon = function ( cfg ) {
	OOJSPlus.ui.data.column.Icon.parent.call( this, cfg );

	this.ariaLabel = cfg.ariaLabel || null;
	this.title = cfg.title || null;
	this.$element.addClass( 'icon-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Icon, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Icon.prototype.renderCell = function ( value, row ) {
	const $cell = OOJSPlus.ui.data.column.Icon.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'icon-cell' );
	$cell.find( '.oo-ui-iconWidget' ).css( 'display', 'block' );
	return $cell;
};

OOJSPlus.ui.data.column.Icon.prototype.getViewControls = function ( value, row ) {
	const widget = new OO.ui.IconWidget( {
		icon: value
	} );
	if ( this.ariaLabel ) {
		const label = typeof this.ariaLabel === 'function' ? this.ariaLabel( value, row ) : this.ariaLabel;
		widget.$element.attr( 'aria-label', label );
	}
	if ( this.title ) {
		const titleValue = typeof this.title === 'function' ? this.ariaLabel( value, row ) : this.title;
		widget.$element.attr( 'title', titleValue );
	}
	return widget;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'icon', OOJSPlus.ui.data.column.Icon );
