( function ( mw, $ ) {
	OOJSPlus.ui.data.Tree = function ( cfg ) {
		OOJSPlus.ui.data.Tree.parent.call( this, cfg );

		this.fixed = cfg.fixed || false;
		this.data = cfg.data || [];
		this.labelledby = cfg.labelledby || '';
		this.id = cfg.id || 'oojsplus-data-tree';
		this.idGenerator = new OOJSPlus.IDGenerator( { id: this.id } );
		this.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : true;
		this.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : true;
		this.$itemsContainer = new $( '<div>' ).addClass( 'oojsplus-data-tree-items' );
		this.expanded = true;
		this.$containTo = false;

		if ( $( document ).find( '#oojsplus-skeleton-cnt' ) ) {
			$( '#oojsplus-skeleton-cnt' ).empty();
		}

		if ( !this.fixed ) {
			this.$containTo = cfg.$containTo === 'self' ? this.$element : cfg.$containTo || false;
			if ( this.$containTo ) {
				this.$containTo.addClass( 'oojsplus-data-tree-contain-to' );
			}
		}
		if ( cfg.hasOwnProperty( 'expanded' ) ) {
			this.expanded = cfg.expanded;
		}
		this.style = cfg.style || {};

		// Flat list of nodes
		this.flat = {}; // eslint-disable-line es-x/no-array-prototype-flat
		this.$element.append( this.$itemsContainer );
		this.draw( this.build( this.data ), this.labelledby );

		this.$element.addClass( 'oojsplus-data-treeWidget' );
		if ( this.fixed ) {
			this.$element.addClass( 'static-tree' );
		}
	};

	OO.inheritClass( OOJSPlus.ui.data.Tree, OO.ui.Widget );

	OOJSPlus.ui.data.Tree.static.tagName = 'div';

	/**
	 * Build structure from data
	 *
	 * @param {Object[]} data
	 * @param {number} [lvl=0] lvl
	 * @return {Object[]}
	 */
	OOJSPlus.ui.data.Tree.prototype.build = function ( data, lvl ) {
		const nodes = {};
		lvl = lvl || 0;
		for ( let i = 0; i < data.length; i++ ) {
			const item = data[ i ];
			let isLeaf = true;

			if (
				( item.hasOwnProperty( 'leaf' ) && item.leaf === false ) ||
				( item.hasOwnProperty( 'items' ) && item.items.length > 0 )
			) {
				isLeaf = false;
			}
			const widget = this.createItemWidget( item, lvl, isLeaf, this.idGenerator.generate(), this.expanded );

			widget.connect( this, {
				selected: function ( item ) { // eslint-disable-line no-shadow
					this.setSelected( item );
				}
			} );
			this.flat[ widget.getName() ] = widget; // eslint-disable-line es-x/no-array-prototype-flat
			nodes[ widget.getName() ] = {
				widget: widget,
				children: !isLeaf ? this.build( item.items || [], lvl + 1 ) : {}
			};
		}

		return nodes;
	};

	OOJSPlus.ui.data.Tree.prototype.createItemWidget = function ( item, lvl, isLeaf, labelledby, expanded ) {
		return new OOJSPlus.ui.data.tree.Item( Object.assign( {}, {
			level: lvl,
			leaf: isLeaf,
			tree: this,
			labelledby: labelledby,
			expanded: expanded,
			style: this.style
		}, item ) );
	};

	/**
	 * Generate HTML
	 *
	 * @param {Object[]} nodes
	 * @param {string} labelledby
	 */
	OOJSPlus.ui.data.Tree.prototype.draw = function ( nodes, labelledby ) {
		this.$itemsContainer.children().remove();
		this.$itemsContainer.append( this.doDraw( nodes, null, labelledby, true ) );
	};

	OOJSPlus.ui.data.Tree.prototype.doDraw = function ( items, parent, labelledby, expanded ) {
		const $ul = $( '<ul>' ).addClass( 'tree-node-list' );
		$ul.attr( 'id', this.idGenerator.generate() );

		if ( parent ) {
			$ul.attr( 'role', 'group' );
		}

		if ( labelledby ) {
			$ul.attr( 'aria-labelledby', labelledby );
		}

		if ( !this.fixed ) {
			const tree = this;
			$ul.attr( 'data-level', parent ? parent.getLevel() + 1 : 0 );
			$ul.addClass( 'tree-sortable' ).sortable( {
				connectWith: '.tree-sortable',
				containment: this.$containTo,
				placeholder: 'drop-target',
				forceHelperSize: true,
				items: '.oojs-ui-data-tree-item',
				forcePlaceholderSize: true,
				start: function ( e, ui ) {
					tree.$itemsContainer.addClass( 'in-drag' );
					$( ui.item ).addClass( 'dragged' );
					tree.onDragStart( tree.flat[ $( ui.item ).data( 'name' ) ], $( this ), e, ui ); // eslint-disable-line es-x/no-array-prototype-flat
				},
				over: function ( e, ui ) {
					tree.onDragOver( $( this ), e, ui );
				},
				out: function ( e, ui ) {
					tree.onDragOut( $( this ), e, ui );
				},
				stop: function ( e, ui ) {
					tree.$itemsContainer.removeClass( 'in-drag' );
					$( ui.item ).removeClass( 'dragged' );
					tree.onDragStop( tree.flat[ $( ui.item ).data( 'name' ) ], $( this ), e, ui ); // eslint-disable-line es-x/no-array-prototype-flat
				},
				receive: function ( e, ui ) {
					// When dropping to another level
					tree._onListUpdate( $( this ), e, ui, true );
				},
				update: function ( e, ui ) {
					// When dropping to the same level
					tree._onListUpdate( $( this ), e, ui );
				},
				remove: function ( e, ui ) { // eslint-disable-line no-unused-vars
					const $source = $( this ),
						$parent = $source.data( 'level' ) === 0 ? null : $source.parent( 'li.oojs-ui-data-tree-item' );

					if ( $parent ) {
						tree.reEvaluateParent( $parent.data( 'name' ) );
					}
				}
			} ).disableSelection();
		}
		for ( const name in items ) {
			if ( !items.hasOwnProperty( name ) ) {
				continue;
			}
			if ( !parent ) {
				$ul.addClass( 'tree-root' );
			}
			const $li = items[ name ].widget.$element;
			const $labelEl = $( $li ).find( '> div > .oojsplus-data-tree-label' );
			const itemId = $labelEl.attr( 'id' );

			$li.append( this.doDraw( items[ name ].children || {}, items[ name ].widget, itemId, this.expanded ) );

			$ul.append( $li );
			// Once we add children, re-evaluate parent
			this.reEvaluateParent( name );
		}

		if ( expanded !== true ) {
			$ul.hide();
		}

		return $ul;
	};

	OOJSPlus.ui.data.Tree.prototype._onListUpdate = function ( $targetList, e, ui, crossDrop ) {
		const $item = $( ui.item );
		const $parent = $targetList.data( 'level' ) === 0 ? null : $targetList.parent( 'li.oojs-ui-data-tree-item' );
		const itemWidget = this.flat[ $item.data( 'name' ) ]; // eslint-disable-line es-x/no-array-prototype-flat
		let $previous = null;

		if ( $item.index() > 0 ) {
			$previous = $targetList.children( 'li.oojs-ui-data-tree-item' ).eq( $item.index() - 1 );
		}

		this.onDrop(
			$targetList, itemWidget,
			$previous ? this.getItem( $previous.data( 'name' ) ) : null,
			$parent ? this.flat[ $parent.data( 'name' ) ] : null, // eslint-disable-line es-x/no-array-prototype-flat
			crossDrop || false
		);
	};

	OOJSPlus.ui.data.Tree.prototype.onDrop = function ( $targetList, item, previous, parent, crossDrop ) { // eslint-disable-line no-unused-vars
		if ( parent ) {
			this.reEvaluateParent( parent.getName() );
		}
		this.updateLevels( item, $targetList.data( 'level' ) );
	};

	OOJSPlus.ui.data.Tree.prototype.onDragStart = function ( item, $target, e, ui ) { // eslint-disable-line no-unused-vars
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.onDragOver = function ( $target, e, ui ) { // eslint-disable-line no-unused-vars
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.onDragOut = function ( $target, e, ui ) { // eslint-disable-line no-unused-vars
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.onDragStop = function ( item, $target, e, ui ) { // eslint-disable-line no-unused-vars
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.reEvaluateParent = function ( name ) {
		const parent = this.getItem( name );
		if ( !parent ) {
			return;
		}
		parent.onChildrenChanged();
	};

	OOJSPlus.ui.data.Tree.prototype.updateLevels = function ( item, level ) {
		item.setLevel( level );
		const children = item.getChildren(),
			newLevel = level + 1;
		for ( let i = 0; i < children.length; i++ ) {
			this.updateLevels( children[ i ], newLevel );
		}
	};

	OOJSPlus.ui.data.Tree.prototype.isLeaf = function ( name ) {
		const node = this.getItem( name );
		if ( !node ) {
			return null;
		}
		return node.getChildren().length === 0;
	};

	OOJSPlus.ui.data.Tree.prototype.getNodes = function () {
		// Get tree nodes, in order as they appear in the tree
		const nodes = [];
		this.$itemsContainer.find( 'li.oojs-ui-data-tree-item' ).each( ( k, el ) => {
			const name = $( el ).attr( 'data-name' ),
				node = this.getItem( name );
			if ( node ) {
				nodes.push( node );
			}
		} );

		return nodes;
	};

	OOJSPlus.ui.data.Tree.prototype.getItem = function ( name ) {
		if ( !this.flat.hasOwnProperty( name ) ) { // eslint-disable-line es-x/no-array-prototype-flat
			return null;
		}
		return this.flat[ name ]; // eslint-disable-line es-x/no-array-prototype-flat
	};

	OOJSPlus.ui.data.Tree.prototype.collapseNode = function ( name ) {
		const node = this.getItem( name );
		if ( !node ) {
			return;
		}
		const element = node.$element.find( '> ul.tree-node-list' );
		$( element ).hide();
	};

	OOJSPlus.ui.data.Tree.prototype.expandNode = function ( name ) {
		const node = this.getItem( name );
		if ( !node ) {
			return;
		}
		const element = node.$element.find( '> ul.tree-node-list' );
		$( element ).show();
	};

	OOJSPlus.ui.data.Tree.prototype.assertNodeLoaded = function ( name ) {
		const dfd = $.Deferred();

		if ( this.flat.hasOwnProperty( name ) ) { // eslint-disable-line es-x/no-array-prototype-flat
			dfd.resolve();
		} else {
			dfd.reject();
		}
		return dfd.promise();
	};

	OOJSPlus.ui.data.Tree.prototype.removeNode = function ( name ) {
		const node = this.getItem( name );
		const subnodes = node.getChildren();
		delete ( this.flat[ name ] ); // eslint-disable-line es-x/no-array-prototype-flat
		this.$itemsContainer.find( 'li[data-name="' + name + '"]' ).remove();
		for ( let i = 0; i < subnodes.length; i++ ) {
			delete ( this.flat[ subnodes[ i ] ] ); // eslint-disable-line es-x/no-array-prototype-flat
		}
		this.emit( 'nodeRemoved', node );
	};

	OOJSPlus.ui.data.Tree.prototype.addSubnode = function ( parentName ) {
		this.getDataFromUser( parentName ).done( ( data ) => {
			this.addSubnodeWithData( data, parentName );
		} );
	};

	OOJSPlus.ui.data.Tree.prototype.addSubnodeWithData = function ( data, parentName ) {
		const parent = parentName ? this.getItem( parentName ) : null;
		const level = parent !== null ? parent.getLevel() + 1 : 0;

		if ( !data ) {
			return;
		}

		const widgetId = this.idGenerator.generate();
		const widget = this.createItemWidget( data, level, true, widgetId, this.expanded );
		widget.connect( this, {
			selected: function ( item ) {
				this.setSelected( item );
			}
		} );

		this.flat[ widget.getName() ] = widget; // eslint-disable-line es-x/no-array-prototype-flat
		const drawingConfig = {};
		drawingConfig[ widget.getName() ] = {
			widget: widget,
			children: []
		};
		this.doDraw( drawingConfig, parent, widgetId, this.expanded );
		if ( !parent ) {
			this.$itemsContainer.find( '> ul.tree-node-list' ).append( widget.$element );
		} else {
			parent.$element.find( '> ul.tree-node-list' ).append( widget.$element );
		}
		this.emit( 'nodeAdded', widget );
	};

	OOJSPlus.ui.data.Tree.prototype.getDataFromUser = function ( parentName ) { // eslint-disable-line no-unused-vars
		const dfd = $.Deferred();
		const manager = OO.ui.getWindowManager();
		const nameField = new OO.ui.TextInputWidget( {
			required: true
		} );
		const labelField = new OO.ui.TextInputWidget( {
			required: true
		} );
		const nameLayout = new OO.ui.FieldLayout( nameField, {
			align: 'top',
			label: 'Name/id'
		} );
		const labelLayout = new OO.ui.FieldLayout( labelField, {
			align: 'top',
			label: 'Label'
		} );
		const mainLayout = new OO.ui.PanelLayout( {
			expanded: false,
			content: [
				nameLayout,
				labelLayout
			]
		} );

		const instance = manager.openWindow( 'message', $.extend( {
			message: mainLayout.$element
		} ) );

		// TODO: This will not validate the fields
		instance.closed.then( ( data ) => {
			if ( data.action !== 'accept' ) {
				dfd.resolve( null );
			}
			dfd.resolve( {
				name: nameField.getValue(),
				label: labelField.getValue()
			} );
		} );

		return dfd.promise();
	};

	OOJSPlus.ui.data.Tree.prototype.setSelected = function ( item ) {
		if ( this.selectedItem ) {
			this.selectedItem.deselect();
		}
		this.selectedItem = this.getItem( item.getName() );
		this.emit( 'itemSelected', item );
	};
}( mediaWiki, jQuery ) );
