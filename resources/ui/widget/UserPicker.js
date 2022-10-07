OOJSPlus.ui.widget.UserPickerWidget = function( cfg ) {
	cfg = cfg || {};
	this.selectedUser = null;
	this.ignoreChange = false;
	this.groups = cfg.groups || null;
	this.excludeGroups = cfg.excludeGroups || null;
	this.menuItemConfig = cfg.menuItemConfig || {};

	OOJSPlus.ui.widget.UserPickerWidget.parent.call( this, $.extend( {}, cfg, { autocomplete: false } ) );

	this.$element.addClass( 'oojsplus-UserPicker' );

	this.connect( this, { change: 'unselectUser' } );
};

OO.inheritClass( OOJSPlus.ui.widget.UserPickerWidget, mw.widgets.UserInputWidget );

OOJSPlus.ui.widget.UserPickerWidget.prototype.getSelectedUser = function () {
	return this.selectedUser;
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.unselectUser = function () {
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

OOJSPlus.ui.widget.UserPickerWidget.prototype.getValidity = function () {
	var dfd = $.Deferred();

	if ( this.getSelectedUser() !== null ) {
		dfd.resolve();
	} else {
		dfd.reject();
	}
	return dfd.promise();
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
	return response || [];
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getValidity = function () {
	if ( this.selectedUser ) {
		return $.Deferred().resolve().promise();
	}
	return $.Deferred().reject().promise();
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.onLookupMenuChoose = function ( item ) {
	this.closeLookupMenu();
	this.setLookupsDisabled( true );
	this.ignoreChange = true;
	this.setValue( item );
	this.ignoreChange = false;
	this.setLookupsDisabled( false );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.onEdit = function () {
	var value = this.$input.val();
	if ( value !== this.value ) {
		this.value = value;
		this.emit( 'change', value );
	}
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.setValue = function ( item ) {
	if ( !( item instanceof OOJSPlus.ui.widget.UserMenuOptionWidget ) ) {
		if ( !item ) {
			return;
		}
		this.setDisabled( true );
		this.pushPending();
		mws.commonwebapis.user.getByUsername( item ).done( function ( user ) {
			if ( !user ) {
				// Cannot find user, just set value as-is
				this.setDisabled( false );
				this.popPending();
				this.$input.val( item );
				this.onEdit();
				return;
			}
			this.ignoreChange = true;
			this.setValue(  new OOJSPlus.ui.widget.UserMenuOptionWidget( user ) );
			this.ignoreChange = false;
			this.setDisabled( false );
			this.popPending();
		}.bind( this ) ).fail( function () {
			this.popPending();
			this.setDisabled( false );
		}.bind( this ) );
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
	var inputValue = this.value,
		filters = [ {
			type: 'boolean',
			value: true,
			operator: '==',
			property: 'enabled',
		} ];

	if ( this.excludeGroups ) {
		filters.push( {
			type: 'list',
			value: this.excludeGroups,
			operator: 'nct',
			property: 'groups',
		} );
	}
	if ( this.groups ) {
		filters.push( {
			type: 'list',
			value: this.groups,
			operator: 'in',
			property: 'groups',
		} );
	}
	return this.makeLookup( {
		query: inputValue,
		filter: JSON.stringify( filters ),
	} );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.makeLookup = function ( data ) {
	return mws.commonwebapis.user.query( data );
};

OOJSPlus.ui.widget.UserPickerWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
	var len, i, user, items = [];

	for ( i = 0, len = data.length; i < len; i++ ) {
		user = data[ i ] || {};
		items.push( new OOJSPlus.ui.widget.UserMenuOptionWidget( $.extend( {}, this.menuItemConfig, user ) ) );
	}

	return items;
};
