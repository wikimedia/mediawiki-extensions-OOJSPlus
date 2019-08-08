( function( mw, $ ) {
	/* WIP */
	OOJSPlus.ui.data.tree.DraggableItem = function ( cfg ) {
		OOJSPlus.ui.data.tree.DraggableItem.parent.call( this, cfg );

		this.$element.data( 'item-name', this.name );
		OO.ui.mixin.DraggableElement.call( this, $.extend( { $handle: this.labelWidget.$element }, cfg ) );

		this.$element.addClass( 'draggable-tree-item' );

		/*this.connect( this, {
			dragstart: 'drag',
			drop: 'drop'
		} );*/
	};

	OO.inheritClass( OOJSPlus.ui.data.tree.DraggableItem, OOJSPlus.ui.data.tree.Item );
	OO.mixinClass(  OOJSPlus.ui.data.tree.DraggableItem, OO.ui.mixin.DraggableElement );

	OOJSPlus.ui.data.tree.DraggableItem.prototype.drag = function( item ) {
		this.tree.draggedItem = item.getName();
	};

	OOJSPlus.ui.data.tree.DraggableItem.prototype.onDrop = function ( e ) {
		console.log( e );
	};

	OOJSPlus.ui.data.tree.DraggableItem.prototype.drop = function( e ) {
		if ( !this.tree.draggedItem ) {
			// No drag ongoing
			return;
		}
		var $target = $( e.currentTarget );
		var name = $target.data( 'item-name' );
		if ( !name ) {
			// Invalid drop target
			return;
		}
		var targetItem = this.tree.getItem( name );
		var draggedItem = this.tree.getItem( this.tree.draggedItem );

		this.tree.draggedItem = null;
	};
} )( mediaWiki, jQuery );