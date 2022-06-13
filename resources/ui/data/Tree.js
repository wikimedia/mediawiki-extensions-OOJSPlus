( function( mw, $ ) {
	OOJSPlus.ui.data.Tree = function( cfg ) {
		OOJSPlus.ui.data.Tree.parent.call( this, cfg );

		this.fixed = cfg.fixed || false;
		this.data = cfg.data || [];
		this.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : true;
		this.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : true;
		this.$itemsContainer = new $( '<div>' ).addClass( 'oojsplus-data-tree-items' );
		// Flat list of nodes
		this.flat = {};
		this.$element.append( this.$itemsContainer );
		this.draw( this.build( this.data ) );

		this.$element.addClass( 'oojsplus-data-treeWidget' );
		if ( this.fixed ) {
			this.$element.addClass( 'static-tree' );
		}
	};

	OO.inheritClass( OOJSPlus.ui.data.Tree, OO.ui.Widget );

	OOJSPlus.ui.data.Tree.static.tagName = 'div';

	/** Build structure from data */
	OOJSPlus.ui.data.Tree.prototype.build = function( data, lvl ) {
		var nodes = {};
		lvl = lvl || 0;
		for( var i = 0; i < data.length; i++ ) {
			var item = data[i],
				isLeaf = true;

			if (
				( item.hasOwnProperty( 'leaf' ) && item.leaf === false )  ||
				( item.hasOwnProperty( 'items' ) && item.items.length > 0 )
			) {
				isLeaf = false;
			}
			var widget = this.createItemWidget( item, lvl, isLeaf );

			widget.connect( this, {
				selected: function( item ) {
					this.setSelected( item );
					this.emit( 'itemSelected', item );
				}
			} );
			this.flat[widget.getName()] = widget;
			nodes[widget.getName()] = {
				widget: widget,
				children: !isLeaf ? this.build( item.items || [], lvl + 1 ) : {}
			};
		}

		return nodes;
	};

	OOJSPlus.ui.data.Tree.prototype.createItemWidget = function( item, lvl, isLeaf ) {
		return new OOJSPlus.ui.data.tree.Item( {
			name: item.name,
			type: item.type || '',
			icon: item.icon || '',
			label: item.label || '',
			indicator: item.indicator || '',
			level: lvl,
			leaf: item.leaf || false,
			tree: this
		} );
	};

	/** Generate HTML */
	OOJSPlus.ui.data.Tree.prototype.draw = function( nodes ) {
		this.$itemsContainer.children().remove();
		this.$itemsContainer.append( this.doDraw( nodes ) );

		if ( this.allowAdditions ) {
			var addButton = new OO.ui.ButtonWidget( {
				label: mw.message( 'oojsplus-data-tree-new-root-item-label' ).text(),
				classes: [ 'tree-node-add' ],
				framed: false
			} );
			addButton.connect( this, {
				click: 'addSubnode'
			} );
			this.$itemsContainer.append( addButton.$element );
		}
	};

	OOJSPlus.ui.data.Tree.prototype.doDraw = function( items, parent ) {
		var $ul = $( '<ul>' ).addClass( 'tree-node-list' );
		if ( !this.fixed ) {
			var tree = this;
			$ul.attr( 'data-level', parent ? parent.getLevel() + 1 : 0 ) ;
			$ul.addClass( 'tree-sortable' ).sortable( {
				connectWith: '.tree-sortable',
				placeholder: "drop-target",
				forceHelperSize: true,
				items: '.oojs-ui-data-tree-item',
				forcePlaceholderSize: true,
				//containment: this.$element,
				start: function( e, ui ) {
					tree.$itemsContainer.addClass( 'in-drag' );
					$( ui.item ).addClass( 'dragged' );
					tree.onDragStart( tree.flat[$( ui.item ).data( 'name' )], $( this ), e, ui );
				},
				over: function( e, ui ) {
					tree.onDragOver( $( this ), e, ui );
				},
				out: function( e, ui ) {
					tree.onDragOut( $( this ), e, ui );
				},
				stop: function( e, ui ) {
					tree.$itemsContainer.removeClass( 'in-drag' );
					$( ui.item ).removeClass( 'dragged' );
					tree.onDragStop( tree.flat[$( ui.item ).data( 'name' )], $( this ), e, ui );
				},
				receive: function( e, ui ) {
					// When dropping to another level
					tree._onListUpdate( $( this ), e, ui, true );
				},
				update: function( e, ui ) {
					// When dropping to the same level
					tree._onListUpdate( $( this ), e, ui );
				},
				remove: function( e, ui ) {
					var $source = $( this ),
						$parent = $source.data( 'level' ) === 0 ? null : $source.parent( 'li.oojs-ui-data-tree-item' );

					if ( $parent ) {
						tree.reEvaluateParent( $parent.data( 'name' ) );
					}
				}
			} ).disableSelection();
		}
		for ( var name in items ) {
			if ( !items.hasOwnProperty( name ) ) {
				continue;
			}
			if ( !parent ) {
				$ul.addClass( 'tree-root' );
			}
			var $li = items[name].widget.$element;
			$li.append( this.doDraw( items[name].children || {}, items[name].widget ) );
			$ul.append( $li );
			// Once we add children, re-evaluate parent
			this.reEvaluateParent( name );
		}

		return $ul;
	};

	OOJSPlus.ui.data.Tree.prototype._onListUpdate = function( $targetList, e, ui, crossDrop ) {
		var $item = $( ui.item ),
			$parent = $targetList.data( 'level' ) === 0 ? null : $targetList.parent( 'li.oojs-ui-data-tree-item' ),
			itemWidget = this.flat[$item.data( 'name' ) ],
			$previous = null;

		if ( $item.index() > 0 ) {
			$previous = $targetList.children( 'li.oojs-ui-data-tree-item' ).eq( $item.index() - 1 );
		}

		this.onDrop(
			$targetList, itemWidget,
			$previous ? this.getItem( $previous.data( 'name' ) ) : null,
			$parent ? this.flat[$parent.data( 'name' )]: null,
			crossDrop || false
		);
	};

	OOJSPlus.ui.data.Tree.prototype.onDrop = function( $targetList, item, previous, parent, crossDrop ) {
		if ( parent ) {
			this.reEvaluateParent( parent.getName() );
		}
		this.updateLevels( item, $targetList.data( 'level' ) );
	};

	OOJSPlus.ui.data.Tree.prototype.onDragStart = function( item, $target, e, ui  ) {
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.onDragOver = function( $target, e, ui ) {
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.onDragOut = function( $target, e, ui ) {
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.onDragStop = function( item, $target, e, ui  ) {
		// STUB
	};

	OOJSPlus.ui.data.Tree.prototype.reEvaluateParent = function( name ) {
		var parent = this.getItem( name );
		if ( !parent ) {
			return;
		}
		parent.onChildrenChanged();
	};

	OOJSPlus.ui.data.Tree.prototype.updateLevels = function( item, level ) {
		item.setLevel( level );
		var children = item.getChildren(),
			newLevel = level + 1;
		for ( var i = 0; i < children.length; i++ ) {
			this.updateLevels( children[i], newLevel );
		}
	};

	OOJSPlus.ui.data.Tree.prototype.isLeaf = function( name ) {
		var node = this.getItem( name );
		if ( !node ) {
			return null;
		}
		return node.getChildren().length === 0;
	};

	OOJSPlus.ui.data.Tree.prototype.getNodes = function() {
		// Get tree nodes, in order as they appear in the tree
		var nodes = [];
		this.$itemsContainer.find( 'li.oojs-ui-data-tree-item' ).each( function( k, el ) {
			var name = $( el ).attr( 'data-name' ),
				node = this.getItem( name );
			if ( node ) {
				nodes.push( node );
			}
		}.bind( this ) );

		return nodes;
	};

	OOJSPlus.ui.data.Tree.prototype.getItem = function( name ) {
		if ( !this.flat.hasOwnProperty( name ) ) {
			return null;
		}
		return this.flat[name];
	};

	OOJSPlus.ui.data.Tree.prototype.collapseNode = function( name ) {
		var node = this.getItem( name );
		if ( !node ) {
			return;
		}
		node.$element.find( 'ul.tree-node-list' ).hide();
	};

	OOJSPlus.ui.data.Tree.prototype.expandNode = function( name ) {
		var node = this.getItem( name );
		if ( !node ) {
			return;
		}
		node.$element.find( 'ul.tree-node-list' ).show();
	};

	OOJSPlus.ui.data.Tree.prototype.assertNodeLoaded = function( name ) {
		var dfd = $.Deferred();

		if ( this.flat.hasOwnProperty( name ) ) {
			dfd.resolve();
		} else {
			dfd.reject();
		}
		return dfd.promise();
 	};

	OOJSPlus.ui.data.Tree.prototype.removeNode = function( name ) {
		var node = this.getItem( name );
		var subnodes = node.getChildren();
		delete( this.flat[name] );
		this.$itemsContainer.find( 'li[data-name="' + name + '"]' ).remove();
		for ( var i = 0; i < subnodes.length; i++ ) {
			delete( this.flat[subnodes[i]] );
		}
		this.emit( 'nodeRemoved', node );
	};

	OOJSPlus.ui.data.Tree.prototype.addSubnode = function( parentName ) {
		this.getDataFromUser( parentName ).done( function( data ) {
			this.addSubnodeWithData( data, parentName );
		}.bind( this ) );
	};

	OOJSPlus.ui.data.Tree.prototype.addSubnodeWithData = function( data, parentName ) {
		var parent = parentName ? this.getItem( parentName ) : null;
		var level = parent !== null ? parent.getLevel() + 1 : 0;

		if ( !data ) {
			return;
		}
		var widget = this.createItemWidget( data, level, true );
		widget.connect( this, {
			selected: function( item ) {
				this.setSelected( item );
			}
		} );

		this.flat[widget.getName()] = widget;
		var drawingConfig = {};
		drawingConfig[widget.getName()] = {
			widget: widget,
			children: []
		};
		this.doDraw( drawingConfig, parent );
		if ( !parent ) {
 			this.$itemsContainer.find( '.tree-root' ).append( widget.$element );
		} else {
			parent.$element.find( '> ul.tree-node-list' ).append( widget.$element );
		}
		this.emit( 'nodeAdded', widget );
	};

	OOJSPlus.ui.data.Tree.prototype.getDataFromUser = function( parentName ) {
		var instance,
			dfd = $.Deferred(),
			manager = OO.ui.getWindowManager(),
			nameField = new OO.ui.TextInputWidget( {
				required: true
			} ),
			labelField = new OO.ui.TextInputWidget( {
				required: true
			} ),
			nameLayout = new OO.ui.FieldLayout( nameField, {
				align: 'top',
				label: 'Name/id'
			} ),
			labelLayout = new OO.ui.FieldLayout( labelField, {
				align: 'top',
				label: 'Label'
			} ),
			mainLayout = new OO.ui.PanelLayout( {
				expanded: false,
				content: [
					nameLayout,
					labelLayout
				]
			} );


		instance = manager.openWindow( 'message', $.extend( {
			message: mainLayout.$element
		} ) );

		// TODO: This will not validate the fields
		instance.closed.then( function ( data ) {
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

	OOJSPlus.ui.data.Tree.prototype.setSelected = function( item ) {
		if ( this.selectedItem ) {
			this.selectedItem.deselect();
		}
		this.selectedItem = this.getItem( item.getName() );
		this.emit( 'itemSelected', item );
	};
} )( mediaWiki, jQuery );
