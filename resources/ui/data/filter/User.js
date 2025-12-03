OOJSPlus.ui.data.filter.User = function ( cfg ) {
	cfg = cfg || {};
	cfg.icon = 'userAvatar';
	this.list = cfg.list || [];
	this.displayName = '';
	this.$overlay = cfg.$overlay || true;
	cfg.autoClosePopup = true;
	OOJSPlus.ui.data.filter.User.parent.call( this, cfg );
};

OO.inheritClass( OOJSPlus.ui.data.filter.User, OOJSPlus.ui.data.filter.List );

OOJSPlus.ui.data.filter.User.prototype.getLayout = function () {
	this.input = new OOJSPlus.ui.widget.UserPickerWidget( {
		$overlay: this.$overlay
	} );
	this.input.lookupMenu.$element.css( 'z-index', 100000 );
	this.input.lookupMenu.connect( this, {
		toggle: function ( visible ) {
			if ( visible && this.input.$input.val() === '' ) {
				this.input.lookupMenu.toggle( false );
			}
		}
	} );
	this.input.connect( this, {
		choose: 'changeValue',
		change: function ( value ) {
			if ( value === '' ) {
				this.clearPicker();
			}
		}
	} );

	return new OO.ui.FieldLayout( this.input, {
		label: mw.msg( 'oojsplus-data-grid-filter-user-input-label' ),
		align: 'top'
	} );
};

OOJSPlus.ui.data.filter.User.prototype.setOverlay = function ( $overlay ) {
	this.$overlay = $overlay;
	this.input.$overlay = $overlay;
};

OOJSPlus.ui.data.filter.User.prototype.setValue = function ( value ) {
	OOJSPlus.ui.data.filter.User.parent.prototype.setValue.call( this, value );
	typeof value.value === 'object' ? this.input.setValue( value.value[ 0 ] ) : this.input.setValue( null ); // eslint-disable-line no-unused-expressions
	if ( value.value.length > 0 ) {
		this.input.setValue( value.value[0] );
	} else {
		this.input.setValue( value.value );
	}
};

OOJSPlus.ui.data.filter.User.prototype.clearValues = function () {
	OOJSPlus.ui.data.filter.User.parent.prototype.clearValues.call( this );
	this.clearPicker();
};

OOJSPlus.ui.data.filter.User.prototype.changeValue = function ( item ) {
	let value = [];
	if ( item instanceof OOJSPlus.ui.widget.UserMenuOptionWidget ) {
		value = [ item.getUsername() ];
		this.displayName = item.getDisplayName();
		OOJSPlus.ui.data.filter.User.parent.prototype.changeValue.call( this, value );
	} else if ( item === null ) {
		OOJSPlus.ui.data.filter.User.parent.prototype.changeValue.call( this, value );
	}
};

OOJSPlus.ui.data.filter.User.prototype.getDisplayValue = function () {
	if ( this.displayName ) {
		return this.displayName;
	}
};

OOJSPlus.ui.data.filter.User.prototype.clearPicker = function () {
	this.input.abortRequest();
	this.input.lookupMenu.toggle( false );
	this.changeValue( null );
	this.displayName = '';
};

OOJSPlus.ui.data.registry.filterRegistry.register( 'user', OOJSPlus.ui.data.filter.User );
