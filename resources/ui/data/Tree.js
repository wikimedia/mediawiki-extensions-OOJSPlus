( function( mw, $ ) {
	OOJSPlus.ui.data.Tree = function( cfg ) {
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
		if ( cfg.hasOwnProperty( 'expanded' ) ) {
			this.expanded = cfg.expanded
		}
		this.style = cfg.style || {};

		// Flat list of nodes
		this.flat = {};
		this.$element.append( this.$itemsContainer );
		this.draw( this.build( this.data ), this.labelledby );

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
			var widget = this.createItemWidget( item, lvl, isLeaf, this.idGenerator.generate(), this.expanded );

			widget.connect( this, {
				selected: function( item ) {
					this.setSelected( item );
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

	OOJSPlus.ui.data.Tree.prototype.createItemWidget = function( item, lvl, isLeaf, labelledby, expanded ) {
		return new OOJSPlus.ui.data.tree.Item( $.extend( {}, {
			level: lvl,
			leaf: isLeaf,
			tree: this,
			labelledby: labelledby,
			expanded: expanded,
			style: this.style
		}, item ) );
	};

	/** Generate HTML */
	OOJSPlus.ui.data.Tree.prototype.draw = function( nodes, labelledby ) {
		this.$itemsContainer.children().remove();
		this.$itemsContainer.append( this.doDraw( nodes, null, labelledby, true ) );
	};

	OOJSPlus.ui.data.Tree.prototype.doDraw = function( items, parent, labelledby, expanded ) {
		var $ul = $( '<ul>' ).addClass( 'tree-node-list' );
		$ul.attr( 'id', this.idGenerator.generate() );
		$ul.attr( 'role', 'tree' );

		if ( labelledby ) {
			$ul.attr( 'aria-labelledby', labelledby );
		}

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
			var $labelEl =  $( $li ).find( '> div > .oojsplus-data-tree-label' );
			var itemId = $labelEl.attr( 'id' );
			$li.append( this.doDraw( items[name].children || {}, items[name].widget, itemId, this.expanded ) );
			$ul.append( $li );
			// Once we add children, re-evaluate parent
			this.reEvaluateParent( name );
		}

		if ( expanded !== true ) {
			$ul.hide();
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
		var element = node.$element.find( '> ul.tree-node-list' );
		$( element ).hide();
		$( node.$element ).attr( 'aria-expanded', 'false' );
	};

	OOJSPlus.ui.data.Tree.prototype.expandNode = function( name ) {
		var node = this.getItem( name );
		if ( !node ) {
			return;
		}
		var element = node.$element.find( '> ul.tree-node-list' );
		$( element ).show();
		$( node.$element ).attr( 'aria-expanded', 'true' );
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

		var widgetId = this.idGenerator.generate();
		var widget = this.createItemWidget( data, level, true, widgetId, this.expanded );
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
		this.doDraw( drawingConfig, parent, widgetId, this.expanded );
		if ( !parent ) {
 			this.$itemsContainer.find( '> ul.tree-node-list' ).append( widget.$element );
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
