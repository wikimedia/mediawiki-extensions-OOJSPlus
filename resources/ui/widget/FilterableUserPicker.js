OOJSPlus.ui.widget.FilterableUserPicker = function ( config ) {
	// Deprecated since 4.2.3 - Use OOJSPlus.ui.widget.EnhanchedUserPickerWidget instead
	OOJSPlus.ui.widget.FilterableUserPicker.parent.call( this, Object.assign( {}, config, {} ) );

	this.rights = config.rights || null;
	this.groups = config.groups || null;
	this.excludeGroups = config.excludeGroups || null;
};

OO.inheritClass( OOJSPlus.ui.widget.FilterableUserPicker, mw.widgets.UserInputWidget );

/**
 * @inheritdoc
 */
OOJSPlus.ui.widget.FilterableUserPicker.prototype.getLookupRequest = function () {
	const inputValue = this.value;

	const data = {
		action: 'query',
		list: 'allusers',
		// Prefix of list=allusers is case sensitive. Normalise first
		// character to uppercase so that "fo" may yield "Foo".
		auprefix: inputValue[ 0 ].toUpperCase() + inputValue.slice( 1 ),
		aulimit: this.limit
	};
	if ( this.rights ) {
		data.aurights = this.rights.join( '|' );
	}
	if ( this.groups ) {
		data.augroup = this.groups.join( '|' );
	}
	if ( this.excludeGroups ) {
		data.auexcludegroup = this.excludeGroups.join( '|' );
	}

	return new mw.Api().get( data );
};
