OOJSPlus.ui.mixin.TitleQuery = function ( cfg ) {
	cfg = cfg || {};
	this.namespaces = cfg.namespaces || null;
	this.contentPagesOnly = cfg.hasOwnProperty( 'contentPagesOnly' ) ? cfg.contentPagesOnly : true;
	this.mustExist = cfg.hasOwnProperty( 'mustExist' ) ? cfg.mustExist : true;
	this.contentModels = cfg.contentModels || null;
	this.prefix = cfg.prefix || '';
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
		limit: inputValue !== '' ? 10 : 5
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
	let len, i;

	for ( i = 0, len = data.length; i < len; i++ ) {
		items.push( new OO.ui.MenuOptionWidget( { data: data[ i ], label: data[ i ].prefixed } ) );
	}
	return items;
};
