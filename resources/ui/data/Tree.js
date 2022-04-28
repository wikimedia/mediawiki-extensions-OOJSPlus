( function( mw, $ ) {
	OOJSPlus.ui.data.Tree = function( cfg ) {
		OOJSPlus.ui.data.Tree.parent.call( this, cfg );

		this.fixed = cfg.fixed || false;
		this.data = cfg.data || [];
		this.allowDeletions = typeof cfg.allowDeletions !== 'undefined' ? cfg.allowDeletions : true;
		this.allowAdditions = typeof cfg.allowAdditions !== 'undefined' ? cfg.allowAdditions : true;
		this.structure = {};
		this.placeholderWidgets = [];
		this.itemsContainer = new OOJSPlus.ui.data.DraggableGroup( this );
		this.itemsContainer.connect( this, {
			reorder: function( item, index ) {
				this.emit( 'reorder', this.getItem( item.getName() ), index );
			}
		} );

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
		if ( this.fixed ) {
			this.$element.addClass( 'static-tree' );
		}
	};

	OO.inheritClass( OOJSPlus.ui.data.Tree, OO.ui.Widget );
	OO.mixinClass( OOJSPlus.ui.data.Tree, OO.ui.mixin.DraggableGroupElement );

	OOJSPlus.ui.data.Tree.static.tagName = 'div';

	/** Build structure from data */
	OOJSPlus.ui.data.Tree.prototype.build = function( data, lvl, parent ) {
		lvl = lvl || 0;
		parent = parent || null;
		for( var i = 0; i < data.length; i++ ) {
			var item = data[i],
				isLeaf = true;

			if (
				( item.hasOwnProperty( 'leaf' ) && item.leaf === false )  ||
				( item.hasOwnProperty( 'items' ) && item.items.length > 0 )
			) {
				isLeaf = false;
			}
			var widget = new this.itemClass( {
				name: item.name,
				type: item.type || '',
				icon: item.icon || '',
				label: item.label || '',
				indicator: item.indicator || '',
				level: lvl,
				isLeaf: isLeaf,
				childrenCount: item.hasOwnProperty( 'items' ) ? item.items.length : 0,
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

	/** Generate HTML */
	OOJSPlus.ui.data.Tree.prototype.draw = function() {
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
			if ( this.placeholderWidgets.length ) {
				for ( var i = 0; i< this.placeholderWidgets.length; i ++) {
					if ( this.placeholderWidgets[i].name === name ) {
						return this.placeholderWidgets[i];
					}
				}
			}
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
		this.foreachNode( this.getChildNodes( name, true ), function( node ) {
			for ( i = 0; i < this.placeholderWidgets.length; i++ ) {
				if ( this.placeholderWidgets[i].name.includes( 'placeholder-' + name ) ) {
					this.placeholderWidgets[i].hide();
				}
			}

			node.widget.hide();
		} );
	};

	OOJSPlus.ui.data.Tree.prototype.expandNode = function( name ) {
		this.foreachNode( this.getChildNodes( name, true ), function( node ) {
			for ( i = 0; i < this.placeholderWidgets.length; i++ ) {
				if ( this.placeholderWidgets[i].name.includes( 'placeholder-' + name ) ) {
					this.placeholderWidgets[i].show();
				}
			}
			node.widget.show();
		} );
	};

	OOJSPlus.ui.data.Tree.prototype.assertNodeLoaded = function( name ) {
		var item = this.getItem( name ),
			dfd = $.Deferred();

		if ( !item ) {
			dfd.reject();
		} else {
			dfd.resolve();
		}

		return dfd.promise();
	};

	OOJSPlus.ui.data.Tree.prototype.removeNode = function( name, subsequent ) {
		subsequent = subsequent || false;
		var item = this.getItem( name );

		this.structure[name].widget.remove();
		delete( this.structure[name] );
		if ( !subsequent ) {
			var children = this.getChildNodes( name , true );
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

	OOJSPlus.ui.data.Tree.prototype.getParent = function( item ) {
		for ( var name in this.structure ) {
			if ( name === item ) {
				return this.structure[item].childOf;
			}
		}
		return '';
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
				index = newIndex + 2;
			}
		}

		this.structure[name].rendered = true;
		this.itemsContainer.addItems( this.structure[name].widget, index );

		var placeholderWidget = new this.itemClass( {
			name: 'placeholder-'+ name,
			icon: '',
			label: '',
			indicator: '',
			level:  this.structure[name].level,
			isLeaf: true,
			childrenCount: 0,
			tree: this,
			classes: ['placeholder-widget']
		} );
		this.placeholderWidgets.push( placeholderWidget );
		this.itemsContainer.addItems( placeholderWidget, index + 1 );
	};

	OOJSPlus.ui.data.Tree.prototype.getLastRendered = function( items ) {
		var lastRendered = null;
		for ( var i = 0; i < items.length; i++ ) {
			if ( items[i].hasOwnProperty( 'rendered' ) && items[i].rendered === true ) {
				lastRendered = items[i];
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

	OOJSPlus.ui.data.Tree.prototype.getOrderedNames = function() {
		var children = this.itemsContainer.getItems(),
			names = [];
		for ( var i = 0; i < children.length; i++ ) {
			var child = children[i];
			names.push( child.getName() );
		}

		return names;
	};

	OOJSPlus.ui.data.Tree.prototype.moveChildren = function( parentName, afterIndex ) {
		var children = this.getChildNodes( parentName );
		var parentItem = this.structure[parentName];
		afterIndex++;
		for ( var i = 0; i < children.length; i++ ) {
			var child = children[i];
			this.structure[child.widget.name].level = parentItem.level + 1;
			this.structure[child.widget.name].widget.setLevel( parentItem.level + 1 );

			this.itemsContainer.itemsOrder.splice( afterIndex, 0,
				this.itemsContainer.itemsOrder.splice( child.widget.index, 1 )[ 0 ]
			);
			this.itemsContainer.reorder( child.widget, afterIndex );
			this.itemsContainer.emit( 'reorder', child.widget, afterIndex );
			this.itemsContainer.updateIndexes();

			this.movePlaceholder( child.widget.getName(), child.widget.index );
			this.moveChildren( child.widget.getName(), child.widget.index + 1 );
		}
	};

	OOJSPlus.ui.data.Tree.prototype.movePlaceholder = function( name, afterIndex ) {
		var parentItem = this.structure[name];
		afterIndex++;

		for ( i = 0; i < this.placeholderWidgets.length; i++ ) {
			placeholderName = this.placeholderWidgets[i].name;
			if ( placeholderName === 'placeholder-' + name ) {
				widget = this.placeholderWidgets[i];
				widget.setLevel( parentItem.level );

				this.itemsContainer.itemsOrder.splice( afterIndex, 0,
					this.itemsContainer.itemsOrder.splice( widget.index, 1 )[ 0 ]
				);
				this.itemsContainer.reorder( widget, afterIndex );
				this.itemsContainer.emit( 'reorder', widget, afterIndex );
				this.itemsContainer.updateIndexes();
			}
		}
	};

	OOJSPlus.ui.data.Tree.prototype.updateUI = function() {
		for( var name in this.structure ) {
			var item = this.structure[name];
			this.reEvaluateParent( item.widget.name );
			item.widget.updateUI();
		}
	};

	/*DRAGGABLE GROUP*/
	OOJSPlus.ui.data.DraggableGroup = function( tree ) {
		this.tree = tree;
		this.placeholder = true;
		var cfg =  {};
		cfg.orientation = 'vertical';
		cfg.draggable = true;
		cfg.classes = [ 'items-cls' ];
		OOJSPlus.ui.data.DraggableGroup.parent.call( this, cfg );
		OO.ui.mixin.DraggableGroupElement.call( this, $.extend( {}, cfg, { $group: this.$element } ) );
	};

	OO.inheritClass( OOJSPlus.ui.data.DraggableGroup, OO.ui.Widget );
	OO.mixinClass( OOJSPlus.ui.data.DraggableGroup, OO.ui.mixin.DraggableGroupElement );

	OOJSPlus.ui.data.DraggableGroup.static.tagName = 'div';

	OOJSPlus.ui.data.DraggableGroup.prototype.onDragOver = function ( e ) {
		var overIndex, targetIndex,
			item = this.getDragItem(),
			dragItemIndex = item.getIndex();

		// Get the OptionWidget item we are dragging over
		overIndex = $( e.target ).closest( '.oo-ui-draggableElement' ).data( 'index' );

		if ( overIndex !== undefined && overIndex !== dragItemIndex ) {
			if( !this.dropAllowed( dragItemIndex, overIndex ) ) {
				return;
			}

			targetIndex = overIndex + ( overIndex > dragItemIndex ? 1 : 0 );
			if ( this.isPlaceholder( e.target ) ) {
				this.placeholder = true;
			} else {
				this.placeholder = false;
			}

			if ( targetIndex > 0 ) {
				this.$group.children().eq( targetIndex - 1 ).after( item.$element );
			} else {
				this.$group.prepend( item.$element );
			}
			// Move item in itemsOrder array
			this.itemsOrder.splice( overIndex, 0,
				this.itemsOrder.splice( dragItemIndex, 1 )[ 0 ]
			);
			this.updateIndexes();
			this.emit( 'drag', item, targetIndex );
		}

		// Prevent default
		e.preventDefault();
	};

	OOJSPlus.ui.data.DraggableGroup.prototype.dropAllowed = function ( dragItemIndex, overIndex ) {
		var over = this.itemsOrder[overIndex];
		var dragged = this.itemsOrder[dragItemIndex];
		dragged = this.tree.getItem( dragged.getName() );
		over = this.tree.getItem( over.getName() );
		if ( over.level < 1 ) {
			return false;
		}
		return true;
	};

	OOJSPlus.ui.data.DraggableGroup.prototype.onItemDropOrDragEnd = function () {
		// For some reason cannot call parent of this function so its copy-pasted here
		var targetIndex, originalIndex,
			item = this.getDragItem();

		// TODO: Figure out a way to configure a list of legally droppable
		// elements even if they are not yet in the list
		if ( item ) {
			//item.removeDraggedClass();
			originalIndex = this.items.indexOf( item );
			// If the item has moved forward, add one to the index to account for the left shift
			targetIndex = item.getIndex() + ( item.getIndex() > originalIndex ? 1 : 0 );

			if ( targetIndex !== originalIndex ) {
				this.reorder( item, targetIndex );
				this.emit( 'reorder', item, targetIndex );
			}

			this.updateIndexes();

			var targetItem = this.getDragItem();

			if ( targetItem ) {
				var newParentWidget = this.items[targetItem.index-1];
				while ( newParentWidget.name.includes( 'placeholder' ) ) {
					this.placeholder = true;
					newParentWidget = this.items[newParentWidget.index -1];
				}

				if ( this.placeholder ) {
					this.tree.structure[targetItem.name].level =
						newParentWidget.isLeaf ? newParentWidget.getLevel(): newParentWidget.getLevel() + 1;

					this.tree.structure[targetItem.name].widget.setLevel(
						newParentWidget.isLeaf ? newParentWidget.getLevel() : newParentWidget.getLevel() + 1 );

					this.tree.structure[targetItem.name].childOf =
						newParentWidget.isLeaf ? this.tree.getParent( newParentWidget.name ) : newParentWidget.name;

					this.tree.movePlaceholder( targetItem.getName(), targetItem.index );
					this.tree.moveChildren( targetItem.getName(), targetItem.index + 1 );
				}
				else {
					this.tree.movePlaceholder( newParentWidget.getName(), newParentWidget.index );

					this.tree.structure[targetItem.name].level = newParentWidget.getLevel() + 1;
					this.tree.structure[targetItem.name].widget.setLevel( newParentWidget.getLevel() + 1 );
					this.tree.structure[targetItem.name].childOf = newParentWidget.name;

					/** insert target widget after placeholder of parent widget */
					this.itemsOrder.splice( newParentWidget.index + 2 , 0,
						this.itemsOrder.splice( targetItem.index, 1 )[ 0 ]
					);
					this.reorder( targetItem, newParentWidget.index + 2 );
					this.emit( 'reorder', targetItem, newParentWidget.index + 2 );
					this.updateIndexes();

					this.tree.movePlaceholder( targetItem.getName(), targetItem.index );
					this.tree.moveChildren( targetItem.getName(), targetItem.index + 1 );
				}
			}

		}
		this.unsetDragItem();
		this.tree.updateUI();

		// Return false to prevent propogation
		return false;
	};

	OOJSPlus.ui.data.DraggableGroup.prototype.getIndexForItem = function ( itemName ) {
		for( var i = 0; i < this.itemsOrder.length; i++ ) {
			if ( this.itemsOrder[i].getName() === itemName ) {
				return i;
			}
		}
		return -1;
	};

	OOJSPlus.ui.data.DraggableGroup.prototype.isPlaceholder = function ( item ) {
		classList = $( item ).attr( "class" );
		classes = classList.split( /\s+/ );

		if ( classes.indexOf( 'placeholder-widget' ) != -1 ) {
			return true;
		}

		return false;
	};

} )( mediaWiki, jQuery );
