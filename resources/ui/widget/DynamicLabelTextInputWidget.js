( function () {
	OOJSPlus.ui.widget.DynamicLabelTextInputWidget = function ( config ) {
		config = config || {};
		this.maxLength = config.maxLength || 255;
		// Configuration initialization
		config = Object.assign( { getLabelText: function () {} }, config );
		// Parent constructor
		OOJSPlus.ui.widget.DynamicLabelTextInputWidget.parent.call( this, config );
		// Events
		this.connect( this, {
			change: 'onChange'
		} );
		// Initialization
		this.setLabel( this.getLabelText( this.getValue() ) );
	};
	OO.inheritClass( OOJSPlus.ui.widget.DynamicLabelTextInputWidget, OO.ui.TextInputWidget );

	OOJSPlus.ui.widget.DynamicLabelTextInputWidget.prototype.onChange = function ( value ) {
		this.setLabel( this.getLabelText( value ) );
	};

	OOJSPlus.ui.widget.DynamicLabelTextInputWidget.prototype.getLabelText = function ( value ) {
		return String( this.maxLength - value.length );
	};
}() );
