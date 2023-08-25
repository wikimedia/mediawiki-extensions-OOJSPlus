OOJSPlus.ui.data.column.User = function ( cfg ) {
	cfg = cfg || {};
	OOJSPlus.ui.data.column.User.parent.call( this, cfg );

	this.showImage = cfg.showImage || false;
	this.$element.addClass( 'user-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.User, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.User.prototype.renderCell = function( value, row ) {
	var $cell = OOJSPlus.ui.data.column.User.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'user-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.User.prototype.getViewControls = function( value ) {
	if ( !value ) {
		return OOJSPlus.ui.data.column.User.parent.prototype.getViewControls.call( this, '' );
	}
	return new OOJSPlus.ui.widget.UserWidget( {
		user_name: value,
		showImage: this.showImage,
		showLink: true,
		showRawUsername: false
	} );
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'user', OOJSPlus.ui.data.column.User );
