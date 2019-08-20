( function( mw, $ ) {
	OOJSPlus.ui.data.Tree = function( cfg ) {
		OOJSPlus.ui.data.Tree.parent.call( this, cfg );

		this.fixed = cfg.fixed || false;
		this.data = cfg.data || [];
		this.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : true;
		this.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : true;
		this.structure = {};
		this.itemsContainer = new OOJSPlus.ui.data.DraggableGroup();

		this.itemsContainer.$element.addClass( 'items-cls' );

		this.$element.append( this.itemsContainer.$element );

		this.itemClass = cfg.itemClass || ( this.fixed ? OOJSPlus.ui.data.tree.Item : OOJSPlus.ui.data.tree.DraggableItem );
		this.build( this.data );
		this.draw();

		if ( this.allowAdditions ) {
			this.newRootItemBtn = new OO.ui.ButtonWidget( {
				label: mw.message( "oojsplus-data-tree-new-root-item-label" ).text(),
				icon: 'add',
				framed: false
			} );
			this.newRootItemBtn.connect( this, {
				click: this.addSubnode
			} );
			this.$element.append( this.newRootItemBtn.$element );
		}

		this.$element.addClass( 'oojsplus-data-treeWidget' );
	};

	OO.inheritClass( OOJSPlus.ui.data.Tree, OO.ui.Widget );
	OO.mixinClass( OOJSPlus.ui.data.Tree, OO.ui.mixin.DraggableGroupElement );

	OOJSPlus.ui.data.Tree.static.tagName = 'div';

	OOJSPlus.ui.data.Tree.prototype.build = function( data, lvl, parent ) {
		lvl = lvl || 0;
		parent = parent || null;
		for( var i = 0; i < data.length; i++ ) {
			var item = data[i];
			var widget = new this.itemClass( {
				name: item.name,
				icon: item.icon || '',
				label: item.label || '',
				indicator: item.indicator || '',
				level: lvl,
				isLeaf: !item.hasOwnProperty( 'items' ) || item.items.length === 0,
				tree: this
			} );
			widget.connect( this, {
				selected: function( item ) {
					this.setSelected( item );
					this.emit( 'itemSelected', item );
				}
			} );
			this.structure[item.name] = {
				level: lvl,
				childOf: parent ? parent.getName() : null,
				widget: widget
			};

			this.build( item.items || [], lvl + 1, widget );
		}
	};

	OOJSPlus.ui.data.Tree.prototype.draw = function(  ) {
		var lvl = 0;
		this.itemsContainer.clearItems();
		while ( this.drawLevel( lvl ) !== false ) {
			lvl++;
		}
	};

	OOJSPlus.ui.data.Tree.prototype.drawLevel = function( lvl ) {
		var hasItems = false;
		for( var name in this.structure ) {
			var item = this.structure[name];
			if ( item.level !== lvl ) {
				continue;
			}
			hasItems = true;
			this.appendToParent( name, item.childOf );
		}
		return hasItems;
	};

	OOJSPlus.ui.data.Tree.prototype.isLeaf = function( name ) {
		return this.getChildNodes( name ).length === 0;
	};

	OOJSPlus.ui.data.Tree.prototype.getItem = function( name ) {
		if ( !this.structure.hasOwnProperty( name ) ) {
			throw Error( "Node " + name + " does not exist" );
		}
		return this.structure[name];
	};

	OOJSPlus.ui.data.Tree.prototype.getChildNodes = function( name, indirect ) {
		indirect = indirect || false;
		var children = [];
		for( var itemName in this.structure ) {
			var item = this.structure[itemName];
			if ( item.childOf === name ) {
				children.push( item );
				if ( indirect ) {
					children = children.concat( this.getChildNodes( itemName, true ) );
				}
			}
		}
		return children;
	};

	OOJSPlus.ui.data.Tree.prototype.foreachNode = function( nodes, cb ) {
		for( var i = 0; i < nodes.length; i++ ) {
			cb.call( this, nodes[i] );
		}
	};

	OOJSPlus.ui.data.Tree.prototype.collapseNode = function( name ) {
		var item = this.getItem( name );
		this.foreachNode( this.getChildNodes( name, true ), function( node ) {
			node.widget.hide();
		} );
	};

	OOJSPlus.ui.data.Tree.prototype.expandNode = function( name ) {
		var item = this.getItem( name );
		this.foreachNode( this.getChildNodes( name, true ), function( node ) {
			node.widget.show();
		} );
	};

	OOJSPlus.ui.data.Tree.prototype.removeNode = function( name, subsequent ) {
		subsequent = subsequent || false;
		var item = this.getItem( name );

		this.structure[name].widget.remove();
		delete( this.structure[name] );
		if ( !subsequent ) {
			var children = this.getChildNodes( name , true )
			this.reEvaluateParent( item.childOf );
			this.foreachNode( children, function( node ) {
				this.removeNode( node.widget.getName(), true );
			} );
		}
		this.emit( 'nodeRemoved', item );
	};

	OOJSPlus.ui.data.Tree.prototype.reEvaluateParent = function( name ) {
		if ( !name ) {
			return;
		}
		var parent = this.getItem( name );
		if ( this.getChildNodes( name ).length === 0 ) {
			parent.widget.setIsLeaf( true );
		} else {
			parent.widget.setIsLeaf( false );
		}
	};

	OOJSPlus.ui.data.Tree.prototype.addSubnode = function( parentName ) {
		this.getDataFromUser( parentName ).done( function( data ) {
			this.addSubnodeWithData( data, parentName );
		}.bind( this ) );
	};

	OOJSPlus.ui.data.Tree.prototype.addSubnodeWithData = function( data, parentName ) {
		var parent = typeof parentName !== 'undefined' ? this.getItem( parentName ) : null;
		var level = parent !== null ? parent.level + 1 : 0;

		if ( !data ) {
			return;
		}
		// TODO: Duplicate code
		var widget = new this.itemClass( $.extend( data, {
			level: level,
			isLeaf: true,
			tree: this
		} ) );
		widget.connect( this, {
			selected: function( item ) {
				this.setSelected( item );
				this.emit( 'itemSelected', item );
			}
		} );

		this.structure[widget.getName()] = {
			level: level,
			childOf: parent !== null ? parent.widget.getName() : null,
			widget: widget
		};

		this.appendToParent( widget.getName(), parentName );
		if ( parent ) {
			this.reEvaluateParent(parent.widget.getName());
		}
		this.emit( 'nodeAdded', widget );

		return $.extend( {
			name: widget.getName()
		}, this.structure[widget.getName()] );
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

	OOJSPlus.ui.data.Tree.prototype.appendToParent = function( name, parentName ) {
		var index = this.itemsContainer.getItemCount(), newIndex = -1;
		if ( parentName ) {
			var siblings = this.getChildNodes( parentName );
			var lastRendered = this.getLastRendered( siblings );
			if ( !lastRendered ) {
				newIndex = this.itemsContainer.getItemIndex( this.getItem( parentName ).widget );
			} else {
				newIndex = this.itemsContainer.getItemIndex( lastRendered.widget );
			}
			if ( newIndex !== -1 ) {
				index = newIndex + 1;
			}
		}

		this.structure[name].rendered = true;
		this.itemsContainer.addItems( this.structure[name].widget, index );
	};

	OOJSPlus.ui.data.Tree.prototype.getLastRendered = function( items ) {
		var lastRendered = null;
		for ( var i = 0; i < items.length; i++ ) {
			if ( items[i].hasOwnProperty( 'rendered' ) && items[i].rendered === true ) {
				lastRendered = items[i];
				if ( !this.isLeaf( lastRendered.widget.getName() ) ) {
					lastRendered = this.getLastRendered( this.getChildNodes( lastRendered.widget.getName() ) );
				}
			}
		}
		return lastRendered;
	};

	OOJSPlus.ui.data.Tree.prototype.setSelected = function( item ) {
		if ( this.selectedItem ) {
			this.selectedItem.widget.$element.removeClass( 'item-selected' );
		}
		this.selectedItem = this.getItem( item.getName() );
		this.selectedItem.widget.$element.addClass( 'item-selected' );
	};

	OOJSPlus.ui.data.Tree.prototype.executeDrop = function( origin, target ) {
		return;
		this.structure[origin.widget.getName()].childOf = target.widget.getName();
		var children = this.getChildNodes( origin.widget.getName(), true);
		for( var i = 0; i < children.length; i++ ) {
			var childName = children[i].widget.getName();
			this.structure[childName].childOf = target.widget.getName();
			this.structure.level = target.level + 1;
			this.structure[childName].setLevel( target.level + 1 );
		}
		this.draw();
	};


	/*DRAGGABLE GROUP*/
	OOJSPlus.ui.data.DraggableGroup = function( cfg ) {
		cfg = cfg || {};
		cfg.orientation = 'vertical';
		cfg.draggable = true;
		OOJSPlus.ui.data.DraggableGroup.parent.call( this, cfg );
		OO.ui.mixin.DraggableGroupElement.call( this, $.extend( {}, cfg, { $group: this.$element } ) );
	};

	OO.inheritClass( OOJSPlus.ui.data.DraggableGroup, OO.ui.Widget );
	OO.mixinClass( OOJSPlus.ui.data.DraggableGroup, OO.ui.mixin.DraggableGroupElement );

	OOJSPlus.ui.data.DraggableGroup.static.tagName = 'div';

} )( mediaWiki, jQuery );