OOJSPlus.ui.widget.NamespaceInputWidget = function( config ) {
	config = config || {};
	config.$overlay = config.$overlay || true;
	config.menu = {
		items: OOJSPlus.ui.widget.NamespaceInputWidget.static.getNamespaceDropdownOptions( config )
	};

	OOJSPlus.ui.widget.NamespaceInputWidget.parent.call( this, config );

	var selectable = this.getMenu().findFirstSelectableItem();
	if ( selectable ) {
		this.setValue( selectable.getData() );
	}
	this.$element.addClass( 'oojsplus-widget-namespaceInputWidget' );
};

/* Setup */

OO.inheritClass( OOJSPlus.ui.widget.NamespaceInputWidget, OO.ui.DropdownWidget );

OOJSPlus.ui.widget.NamespaceInputWidget.static.getNamespaceDropdownOptions = function ( config ) {
	var i = 0, name = '',
		namespaces = mw.config.get( 'wgFormattedNamespaces' ),
		options = [],
		content = mw.config.get( 'wgContentNamespaces' ),
		exclude = config.exclude || [],
		groups = {
			content: {
				label: mw.msg( 'oojsplus-namespace-content' ),
				options: []
			},
			system: {
				label: mw.msg( 'oojsplus-namespace-system' ),
				options: []
			},
			content_talk: {
				label: mw.msg( 'oojsplus-namespace-content-talk' ),
				options: []
			},
			system_talk: {
				label: mw.msg( 'oojsplus-namespace-system-talk' ),
				options: []
			}
		};

	for ( var ns in namespaces ) {
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

	for ( var group in groups ) {
		// Sort options
		groups[ group ].options.sort( function ( a, b ) {
			return a.label - b.label;
		} );
		if ( groups[ group ].options.length ) {
			options.push( new OO.ui.MenuSectionOptionWidget( {
				label: groups[ group ].label
			} ) );
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

OOJSPlus.ui.widget.NamespaceInputWidget.prototype.setValue = function( value ) {
	if ( !value ) {
		return;
	}
	value = Number( value );
	this.getMenu().selectItemByData( value );
};

OOJSPlus.ui.widget.NamespaceInputWidget.prototype.getValue = function() {
	var item = this.getMenu().findFirstSelectedItem();
	if ( item ) {
		return item.getData();
	}
	return '';
};
