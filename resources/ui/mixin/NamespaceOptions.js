OOJSPlus.ui.mixin.NamespaceOptions = function () {};

OO.initClass( OOJSPlus.ui.mixin.NamespaceOptions );

OOJSPlus.ui.mixin.NamespaceOptions.prototype.getNamespaceOptions = function ( config ) {
	let i = 0, name = '';
	const namespaces = mw.config.get( 'wgFormattedNamespaces' );
	const options = [];
	const content = mw.config.get( 'wgContentNamespaces' );
	const exclude = config.exclude || [];
	const groups = {
		content: {
			label: mw.msg( 'oojsplus-namespace-content' ),
			options: []
		},
		system: {
			label: mw.msg( 'oojsplus-namespace-system' ),
			options: []
		},
		content_talk: { // eslint-disable-line camelcase
			label: mw.msg( 'oojsplus-namespace-content-talk' ),
			options: []
		},
		system_talk: { // eslint-disable-line camelcase
			label: mw.msg( 'oojsplus-namespace-system-talk' ),
			options: []
		}
	};

	for ( let ns in namespaces ) {
		if ( !namespaces.hasOwnProperty( ns ) ) {
			continue;
		}
		ns = Number( ns );
		if ( ns < 0 || exclude.indexOf( ns ) !== -1 ) {
			continue;
		}
		name = namespaces[ ns ];
		if ( ns === 0 ) {
			name = mw.msg( 'blanknamespace' );
		}

		if ( content.indexOf( ns ) !== -1 || content.indexOf( ns - 1 ) !== -1 ) {
			if ( ns % 2 === 0 ) {
				groups.content.options.push( { data: ns, label: name } );
			} else {
				groups.content_talk.options.push( { data: ns, label: name } );
			}
		} else {
			if ( ns % 2 === 0 ) {
				groups.system.options.push( { data: ns, label: name } );
			} else {
				groups.system_talk.options.push( { data: ns, label: name } );
			}
		}
	}

	if ( config.specialOptionAll ) {
		options.push( new OO.ui.MenuOptionWidget( {
			data: -99,
			label: mw.msg( 'namespacesall' )
		} ) );
	}
	for ( const group in groups ) {
		if ( !groups.hasOwnProperty( group ) ) {
			continue;
		}
		if ( config.groups && config.groups.indexOf( group ) === -1 ) {
			continue;
		}
		// Sort options
		groups[ group ].options.sort( ( a, b ) => a.label - b.label );
		if ( groups[ group ].options.length ) {
			if ( !config.hideHeadings ) {
				options.push( new OO.ui.MenuSectionOptionWidget( {
					label: groups[ group ].label
				} ) );
			}
			for ( i = 0; i < groups[ group ].options.length; i++ ) {
				options.push( new OO.ui.MenuOptionWidget( {
					data: groups[ group ].options[ i ].data,
					label: groups[ group ].options[ i ].label
				} ) );
			}
		}
	}

	if ( config.includeAllValue !== null && config.includeAllValue !== undefined ) {
		options.unshift( {
			data: config.includeAllValue,
			label: mw.msg( 'namespacesall' )
		} );
	}

	return options;
};

OOJSPlus.ui.mixin.NamespaceOptions.prototype.getNamespaceLabel = function ( ns ) {
	const namespaces = mw.config.get( 'wgFormattedNamespaces' );
	return namespaces[ ns ] || '-';
};
