OOJSPlus.ui.data.filter.User = function ( cfg ) {
	this.list = cfg.list || [];
	OOJSPlus.ui.data.filter.User.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.filter.User, OOJSPlus.ui.data.filter.List );

OOJSPlus.ui.data.filter.User.prototype.getLayout = function() {
	this.input = new OOJSPlus.ui.widget.UserPickerWidget( {
		$overlay: true,
	} );
	this.input.lookupMenu.$element.css( 'z-index', 100000 );
	this.input.lookupMenu.connect( this, {
		toggle: function( visible ) {
			if ( visible && this.input.$input.val() === '' ) {
				this.input.lookupMenu.toggle( false );
			}
		}
	} );
	this.input.connect( this, {
		choose: 'changeValue',
		change: function( value ) {
			if ( value === '' ) {
				this.clearPicker();
			}
		}
	} );

	return this.input;
};

OOJSPlus.ui.data.filter.User.prototype.setValue = function( value ) {
	OOJSPlus.ui.data.filter.User.parent.prototype.setValue.call( this, value );
	typeof value.value === 'object' ? this.input.setValue( value.value[0] ) : this.input.setValue( null );
	this.input.setValue( value.value );
};

OOJSPlus.ui.data.filter.User.prototype.clearValues = function() {
	OOJSPlus.ui.data.filter.User.parent.prototype.clearValues.call( this );
	this.clearPicker();
};

OOJSPlus.ui.data.filter.User.prototype.changeValue = function( item ) {
	var value = [];
	if ( item ) {
		value = [ item.getUsername() ];
	}
	OOJSPlus.ui.data.filter.User.parent.prototype.changeValue.call( this, value );
};

OOJSPlus.ui.data.filter.User.prototype.clearPicker = function() {
	this.input.abortRequest();
	this.input.lookupMenu.toggle( false );
	this.changeValue( null );
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'user', OOJSPlus.ui.data.filter.User );
