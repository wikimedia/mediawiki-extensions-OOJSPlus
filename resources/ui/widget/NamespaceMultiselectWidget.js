OOJSPlus.ui.widget.NamespaceMultiSelectWidget = function ( config ) {
	config = config || {};
	config.menu = config.menu || {};
	config.hideHeadings = true;
	config.options = this.getNamespaceOptions( config );
	config.allowArbitrary = false;
	config.menu.filterFromInput = true;
	// Parent constructor
	OOJSPlus.ui.widget.NamespaceMultiSelectWidget.parent.call( this, Object.assign( {}, config, {} ) );

	if ( 'name' in config ) {
		// Use this instead of <input type="hidden">, because hidden inputs do not have separate
		// 'value' and 'defaultValue' properties. The script on Special:Preferences
		// (mw.special.preferences.confirmClose) checks this property to see if a field was changed.
		this.$hiddenInput = $( '<textarea>' )
			.addClass( 'oo-ui-element-hidden' )
			.attr( 'name', config.name )
			.appendTo( this.$element );
		// Update with preset values
		this.updateHiddenInput();
		// Set the default value (it might be different from just being empty)
		this.$hiddenInput.prop( 'defaultValue', this.getValue().join( ',' ) );
	}

	if ( config.value ) {
		this.setValue( config.value );
	}
	// Events
	// When list of selected usernames changes, update hidden input
	this.connect( this, {
		change: 'onMultiselectChange'
	} );
	this.menu.filterFromInput = true;
};

OO.inheritClass( OOJSPlus.ui.widget.NamespaceMultiSelectWidget, OO.ui.MenuTagMultiselectWidget );
OO.mixinClass( OOJSPlus.ui.widget.NamespaceMultiSelectWidget, OO.ui.mixin.PendingElement );
OO.mixinClass( OOJSPlus.ui.widget.NamespaceMultiSelectWidget, OOJSPlus.ui.mixin.NamespaceOptions );

OOJSPlus.ui.widget.NamespaceMultiSelectWidget.prototype.setValue = function ( value ) {
	if ( !value ) {
		return;
	}
	if ( Array.isArray( value ) ) {
		value = value.map( ( v ) => ( { data: v, label: this.getNamespaceLabel( v ) } ) );
	}

	OOJSPlus.ui.widget.NamespaceMultiSelectWidget.parent.prototype.setValue.apply( this, [ value ] );
};
OOJSPlus.ui.widget.NamespaceMultiSelectWidget.prototype.updateHiddenInput = function () {
	if ( '$hiddenInput' in this ) {
		this.$hiddenInput.val( this.getValue().join( ',' ) );
		// Trigger a 'change' event as if a user edited the text
		// (it is not triggered when changing the value from JS code).
		this.$hiddenInput.trigger( 'change' );
	}
};

/**
 * React to the 'change' event.
 *
 * Updates the hidden input and clears the text from the text box.
 */
OOJSPlus.ui.widget.NamespaceMultiSelectWidget.prototype.onMultiselectChange = function () {
	this.updateHiddenInput();
	this.input.setValue( '' );
};
