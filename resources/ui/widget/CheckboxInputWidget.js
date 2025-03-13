OOJSPlus.ui.widget.CheckboxInputWidget = function ( cfg ) {
	OOJSPlus.ui.widget.CheckboxInputWidget.parent.call( this, cfg );

	this.$element.on( 'keypress', ( e ) => {
		if ( e.key === 'Enter' ) {
			const state = this.$input.prop( 'checked' );
			this.setSelected( !state );
		}
	} );
};

OO.inheritClass( OOJSPlus.ui.widget.CheckboxInputWidget, OO.ui.CheckboxInputWidget );
