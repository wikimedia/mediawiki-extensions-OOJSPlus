OOJSPlus.ui.mixin.TitleQuery = function ( cfg ) {
	cfg = cfg || {};
	this.namespaces = cfg.namespaces || null;
	this.contentPagesOnly = cfg.hasOwnProperty( 'contentPagesOnly' ) ? cfg.contentPagesOnly : true;
	this.mustExist = cfg.hasOwnProperty( 'mustExist' ) ? cfg.mustExist : true;
	this.contentModels = cfg.contentModels || null;
	this.prefix = cfg.prefix || '';

	this.useAdvancedMenuOptions = true;
	if ( cfg.useSimpleOptions || false ) {
		this.useAdvancedMenuOptions = false;
	}

	if ( !OOJSPlus.ui.widget._config.useSplitTitleOption ) {
		this.useAdvancedMenuOptions = false;
	}
	this.typingTimeout = null;
};

OO.initClass( OOJSPlus.ui.mixin.TitleQuery );

OOJSPlus.ui.mixin.TitleQuery.prototype.extractNamespaceText = function ( value ) {
	if ( value.indexOf( ':' ) === -1 ) {
		return [ null, value ];
	}
	const parts = value.split( ':' ),
		ns = parts.shift(),
		title = parts.join( ':' );
	return [ ns, title ];
};

OOJSPlus.ui.mixin.TitleQuery.prototype.getLookupRequest = function () {
	let inputValue = this.getRawValue(),
		filters = [];

	const parsed = this.extractNamespaceText( inputValue ),
		explicitNamespace = parsed[ 0 ];
	inputValue = this.prefix + parsed[ 1 ];
	if ( explicitNamespace !== null ) {
		filters.push( {
			type: 'string',
			value: explicitNamespace,
			operator: 'eq',
			property: 'namespace_text'
		} );
	}

	if ( this.contentPagesOnly ) {
		filters.push( {
			type: 'boolean',
			value: this.contentPagesOnly,
			operator: 'eq',
			property: 'is_content_page'
		} );
	}

	if ( this.namespaces ) {
		filters.push( {
			type: 'list',
			value: this.namespaces,
			operator: 'in',
			property: 'namespace'
		} );
	}
	if ( this.contentModels ) {
		filters.push( {
			type: 'list',
			value: this.contentModels,
			operator: 'in',
			property: 'content_model'
		} );
	}

	filters = this.extendFilters( filters );
	return this.makeLookup( inputValue, {
		filter: JSON.stringify( filters ),
		limit: inputValue !== '' ? 8 : 5
	} );
};

OOJSPlus.ui.mixin.TitleQuery.prototype.makeLookup = function ( query, data ) {
	return mws.commonwebapis.title.query( query, data );
};

OOJSPlus.ui.mixin.TitleQuery.prototype.extendFilters = function ( filters ) {
	return filters;
};

OOJSPlus.ui.mixin.TitleQuery.prototype.getLookupMenuOptionsFromData = function ( data ) {
	const items = [];
	let len, i, label;

	for ( i = 0, len = data.length; i < len; i++ ) {
		label = this.useAdvancedMenuOptions ?
			false :
			( data[ i ].prefixed || data[ i ].base_title );
		items.push( this.getMenuOption( { data: data[ i ], label: label } ) );
	}
	if ( items.length === 0 && !this.mustExist ) {
		items.push( this.getMenuOption( {
			data: {
				prefixed: this.getRawValue(), missing: true
			},
			label: this.getRawValue()
		} ) );
	}
	return items;
};

OOJSPlus.ui.mixin.TitleQuery.prototype.getMenuOption = function ( cfg ) {
	if ( this.useAdvancedMenuOptions ) {
		return new OOJSPlus.ui.widget.TitleWidgetMenuOption( cfg, this.getRawValue() );
	}
	return new OO.ui.MenuOptionWidget( cfg );
};

OOJSPlus.ui.mixin.TitleQuery.prototype.getRawValue = function () {
	return '';
};
