( function( mw, $ ) {

	OOJSPlus.ui.data.Paginator = function( cfg ) {
		OOJSPlus.ui.data.Paginator.parent.call( this, cfg );

		this.store = cfg.store;
		this.grid = cfg.grid;
		this.pageSize = this.store.getPageSize();
		this.total = 0;
		this.loaded = 0;
		this.rows = {};
		this.range = { start: 0, end: 0 };

		this.navigation = new OO.ui.HorizontalLayout();
		this.staticControls = new OO.ui.HorizontalLayout();
		this.$element.addClass( 'oojsplus-data-paginator' );
		this.makeToolbar();
	};

	OO.inheritClass( OOJSPlus.ui.data.Paginator, OO.ui.Widget );

	OOJSPlus.ui.data.Paginator.static.tagName = 'div';

	OOJSPlus.ui.data.Paginator.prototype.init = function() {
		this.total = this.store.getTotal();
		this.rows = this.store.getData();
		this.loaded = Object.keys( this.rows ).length;
		this.paginate();
	};

	OOJSPlus.ui.data.Paginator.prototype.reset = function() {
		this.init();
	};

	OOJSPlus.ui.data.Paginator.prototype.next = function() {
		if ( this.currentPage + 1  > this.numberOfPages ) {
			return;
		}

		this.currentPage++;
		var start = this.pageSize * ( this.currentPage - 1 ),
			end = ( start + this.pageSize > this.total ? this.total : start + this.pageSize ) - 1;
		this.store.setOffset( ( this.currentPage - 1 ) * this.pageSize );

		this.assertLoaded( end ).done( function( data ) {
			this.rows = data;
			this.range.start = start;
			this.range.end = end;
			this.loaded = Object.keys( this.rows ).length;
			this.grid.clearItems();
			this.grid.setItems( this.subsetRows( this.range ) );
			this.updateNavigation();
		}.bind( this ) ).fail( function () {
			// In case call to get next page's data fails, we cannot switch page,
			// so reset the page number to the one we are currently at (rollback page change)
			this.currentPage--;
			this.grid.setItems( [] );
		}.bind( this ) );
	};

	OOJSPlus.ui.data.Paginator.prototype.assertLoaded = function( max ) {
		if ( !this.rows.hasOwnProperty( max - 1 ) ) {
			return this.store.load();
		}

		return $.Deferred().resolve( this.rows ).promise();
	};

	OOJSPlus.ui.data.Paginator.prototype.previous = function() {
		if ( this.currentPage === 1 ) {
			return;
		}

		this.currentPage--;
		this.range.start = this.pageSize * ( this.currentPage - 1 );
		this.range.end = this.range.start + this.pageSize - 1;
		this.grid.clearItems();
		this.grid.setItems( this.subsetRows( this.range ) );
		this.updateNavigation();

	};

	OOJSPlus.ui.data.Paginator.prototype.makeToolbar = function() {
		this.totalWidget = new OO.ui.LabelWidget();
		this.totalWidget.$element.addClass( 'row-count' );

		var reloadBtn = new OO.ui.ButtonWidget( {
			title: "Reload",
			icon: 'reload',
			framed: false
		} );
		reloadBtn.connect( this, {
			click: function() {
				this.store.reload().done( function() {
					this.init();
				}.bind( this ) );
			}
		} );

		this.staticControls.$element.addClass( 'static-controls' );
		this.staticControls.addItems( [ reloadBtn, this.totalWidget ] );

		this.$element.append( this.navigation.$element, this.staticControls.$element );
	};

	OOJSPlus.ui.data.Paginator.prototype.updateControls = function() {
		this.navigation.clearItems();

		this.currentPageWidget = new OO.ui.LabelWidget();
		this.updatePageCount();

		this.previousButton = new OO.ui.ButtonWidget( {
			icon: 'previous',
			disabled: true
		} );
		this.previousButton.connect( this, {
			click: 'previous'
		} );

		this.nextButton= new OO.ui.ButtonWidget( {
			icon: 'next'
		} );
		this.nextButton.connect( this, {
			click: 'next'
		} );

		this.navigation.addItems( [ this.previousButton, this.currentPageWidget, this.nextButton ] );
	};

	OOJSPlus.ui.data.Paginator.prototype.paginate = function() {
		this.navigation.clearItems();

		if ( this.total > this.pageSize ) {
			// More than one page
			this.currentPage = 0;
			this.currentRange = { start: 0, end: 0 };
			this.numberOfPages = Math.ceil( this.total / this.pageSize );
			this.updateControls();
			this.next();
		} else {
			// All can fit without paging
			this.grid.setItems( Object.values( this.rows ) );
		}

		this.updateTotal();
	};

	OOJSPlus.ui.data.Paginator.prototype.updatePageCount = function() {
		this.currentPageWidget.setLabel( this.currentPage.toString() + ' of ' + this.numberOfPages.toString() );
	};

	OOJSPlus.ui.data.Paginator.prototype.subsetRows = function( range ) {
		if ( this.loaded < range.end ) {
			return [];
		}
		var subset = [];
		for ( var index in this.rows ) {
			if ( !this.rows.hasOwnProperty( index ) ) {
				continue;
			}
			if ( index < range.start || index > range.end ) {
				continue;
			}
			subset.push( this.rows[index] );
		}

		return subset;
	};

	OOJSPlus.ui.data.Paginator.prototype.updateNavigation = function() {
		this.nextButton.setDisabled( this.currentPage === this.numberOfPages );
		this.previousButton.setDisabled( this.currentPage === 1 );
		this.updatePageCount();
	};

	OOJSPlus.ui.data.Paginator.prototype.updateTotal = function() {
		var labelMessage = mw.message( 'oojsplus-data-paginator-page-total-count-label', this.total ).parse();
		this.totalWidget.setLabel( labelMessage );
	};
} )( mediaWiki, jQuery );
