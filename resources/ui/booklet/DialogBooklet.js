( function () {
	OOJSPlus.ui.booklet.DialogBooklet = function ( cfg ) {
		OOJSPlus.ui.booklet.DialogBooklet.parent.call( this, cfg );
		this.addPages( cfg.pages );
		this.$element.addClass( 'oojsplus-dialog-booklet' );
	};

	OO.inheritClass( OOJSPlus.ui.booklet.DialogBooklet, OO.ui.BookletLayout );
}() );
