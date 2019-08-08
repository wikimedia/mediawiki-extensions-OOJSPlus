( function( mw, $ ) {

	OOJSPlus.ui.data.Paginator = function( cfg ) {
		OOJSPlus.ui.data.Paginator.parent.call( this, cfg );

		this.grid = cfg.grid;
		this.pageSize = cfg.pageSize;
		this.data = cfg.data || {};

		this.$element.addClass( 'oojsplus-data-paginator' );

		this.firstShown = -1;
		this.lastShown = -1;
	};

	OO.inheritClass( OOJSPlus.ui.data.Paginator, OO.ui.Widget );

	OOJSPlus.ui.data.Paginator.prototype.setData = function( data ) {
		this.data = data;
	};

	OOJSPlus.ui.data.Paginator.prototype.needsPagination = function() {
		return Object.keys( this.data ).length > this.pageSize;
	};

	OOJSPlus.ui.data.Paginator.prototype.reset = function() {
		this.firstShown = -1;
		this.lastShown = -1;
	};

	OOJSPlus.ui.data.Paginator.prototype.next = function() {
		this.grid.clearItems();

		var total = Object.keys( this.data ).length - 1;
		this.firstShown = this.lastShown + 1;
		this.lastShown = this.pageSize - 1 + this.firstShown;
		if( this.lastShown > total ) {
			this.lastShown = total;
		}

		for( var idx in this.data ) {
			idx = parseInt( idx );
			if( idx >= this.firstShown && idx <= this.lastShown ) {
				this.grid.appendItem( this.data[idx], idx );
			}
		}

	};

	OOJSPlus.ui.data.Paginator.prototype.previous = function() {
		this.grid.clearItems();

		this.firstShown -= this.pageSize;
		if( this.firstShown < 0 ) {
			this.firstShown = 0;
		}

		this.lastShown = this.pageSize - 1 + this.firstShown;


		for( var idx in this.data ) {
			idx = parseInt( idx );
			if( idx >= this.firstShown && idx <= this.lastShown ) {
				this.grid.appendItem( this.data[idx], idx );
			}
		}
	};

	OOJSPlus.ui.data.GridWidget.static.tagName = 'div';
} )( mediaWiki, jQuery );