OOJSPlus.ui.widget.UserPickerWidget = function ( cfg ) {
	cfg = cfg || {};
	this.selectedUser = null;
	this.ignoreChange = false;
	this.groups = cfg.groups || null;
	this.excludeGroups = cfg.excludeGroups || null;
	this.menuItemConfig = cfg.menuItemConfig || {};

	OOJSPlus.ui.widget.UserPickerWidget.parent.call( this, Object.assign( {}, cfg, {
		autocomplete: false
	} ) );

	this.lookupMenu.connect( this, {
		toggle: 'onLookupMenuToggle'
	} );

	this.$element.addClass( 'oojsplus-UserPicker' );

	this.connect( this, { change: 'deselectUser' } );
};

OO.inheritClass( OOJSPlus.ui.widget.UserPickerWidget, mw.widgets.UserInputWidget );

OOJSPlus.ui.widget.UserPickerWidget.prototype.getSelectedUser = function () {
	return this.selectedUser;
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.deselectUser = function () {
	if ( this.ignoreChange ) {
		return;
	}
	this.selectedUser = null;
	if ( this.value !== '' ) {
		this.setValidityFlag( false );
	}
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.abortRequest = function () {
	// DO NOTHING
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.onLookupMenuToggle = function ( visible ) { // eslint-disable-line no-unused-vars
	if ( this.lookupInputFocused ) {
		this.focus();
	}
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.onLookupInputFocus = function () {
	if ( this.lookupInputFocused ) {
		return;
	}
	// Return parent value
	return OOJSPlus.ui.widget.UserPickerWidget.parent.prototype.onLookupInputFocus.call( this );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.focus = function () {
	this.$input.trigger( 'focus' );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
	if ( !this.allowSuggestionsWhenEmpty && this.$input.val() === '' ) {
		// Seems that config alone does not prevent the menu from opening on empty input
		return [];
	}
	return response || [];
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getValidity = function () {
	if ( this.selectedUser ) {
		return $.Deferred().resolve().promise();
	} else if ( this.isRequired() ) {
		return $.Deferred().reject().promise();
	}
	return $.Deferred().resolve().promise();
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.onLookupMenuChoose = function ( item ) {
	this.closeLookupMenu();
	this.setLookupsDisabled( true );
	this.ignoreChange = true;
	this.setValue( item );
	this.emit( 'choose', item );
	this.ignoreChange = false;
	this.setLookupsDisabled( false );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.onEdit = function () {
	const value = this.$input.val();
	if ( value !== this.value ) {
		this.value = value;
		this.emit( 'change', value );
	}
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.setValue = function ( item ) {
	if ( !( item instanceof OOJSPlus.ui.widget.UserMenuOptionWidget ) ) {
		if ( !item ) {
			this.$input.val( '' );
			this.value = '';
			this.deselectUser();
			return;
		}
		this.setDisabled( true );
		this.pushPending();
		mws.commonwebapis.user.getByUsername( item ).done( ( user ) => {
			if ( !user || $.isEmptyObject( user ) ) {
				// Cannot find user, just set value as-is
				this.setDisabled( false );
				this.popPending();
				OOJSPlus.ui.widget.UserPickerWidget.parent.prototype.setValue.call( this, item );
				this.selectedUser = null;
				this.onEdit();
				return;
			}
			this.ignoreChange = true;
			this.setValue( new OOJSPlus.ui.widget.UserMenuOptionWidget( user ) );
			this.ignoreChange = false;
			this.setDisabled( false );
			this.popPending();
		} ).fail( () => {
			this.popPending();
			this.setDisabled( false );
			OOJSPlus.ui.widget.UserPickerWidget.parent.prototype.setValue.call( this, item );
			this.selectedUser = null;
		} );
	} else {
		OOJSPlus.ui.widget.UserPickerWidget.parent.prototype.setValue.call( this, item.getDisplayName() );
		this.selectedUser = item;
	}
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getValue = function () {
	if ( this.selectedUser ) {
		return this.selectedUser.getUsername();
	}
	return OOJSPlus.ui.widget.UserPickerWidget.parent.prototype.getValue.call( this );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getLookupRequest = function () {
	const inputValue = this.value,
		filters = [ {
			type: 'boolean',
			value: true,
			operator: '==',
			property: 'enabled'
		} ];

	if ( this.excludeGroups ) {
		filters.push( {
			type: 'list',
			value: this.excludeGroups,
			operator: 'nct',
			property: 'groups'
		} );
	}
	if ( this.groups ) {
		filters.push( {
			type: 'list',
			value: this.groups,
			operator: 'in',
			property: 'groups'
		} );
	}

	return this.makeLookup( {
		query: inputValue,
		filter: JSON.stringify( filters ),
		limit: inputValue !== '' ? 10 : 5
	} );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.makeLookup = function ( data ) {
	return mws.commonwebapis.user.query( data );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
	const items = [];
	let len, i, user;

	for ( i = 0, len = data.length; i < len; i++ ) {
		user = data[ i ] || {};
		items.push( new OOJSPlus.ui.widget.UserMenuOptionWidget( Object.assign( {}, this.menuItemConfig, user ) ) );
	}
	return items;
};
