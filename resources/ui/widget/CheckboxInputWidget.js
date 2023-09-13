OOJSPlus.ui.widget.CheckboxInputWidget = function( cfg ) {
	OOJSPlus.ui.widget.CheckboxInputWidget.parent.call( this, cfg );

	this.$element.on( 'keypress', function ( e ) {
		if ( e.key === 'Enter' ) {
			var state = this.$input.prop( 'checked' );
			this.setSelected( !state );
		}
	}.bind( this ) );
};

OO.inheritClass( OOJSPlus.ui.widget.CheckboxInputWidget , OO.ui.CheckboxInputWidget );
