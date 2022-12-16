( function( mw, $ ) {

	OOJSPlus.ui.data.grid.Paginator = function( cfg ) {
		OOJSPlus.ui.data.grid.Paginator.parent.call( this, cfg );

		this.store = cfg.store;
		this.grid = cfg.grid;
		this.pageSize = this.store.getPageSize();
		this.total = 0;
		this.loaded = 0;
		this.rows = {};
		this.range = { start: 0, end: 0 };
		this.hasPages = false;

		this.store.connect( this, {
			// Reload happens when dataset changes (filter conditions change, sorting, setting data...)
			// Here we need to re-init the pagination as the totals may have changed
			reload: 'init'
		} );

		this.navigation = new OO.ui.HorizontalLayout();
		this.$element.addClass( 'oojsplus-data-paginator' );
		this.$element.append( this.navigation.$element );
	};

	OO.inheritClass( OOJSPlus.ui.data.grid.Paginator, OO.ui.Widget );

	OOJSPlus.ui.data.grid.Paginator.static.tagName = 'div';

	OOJSPlus.ui.data.grid.Paginator.prototype.init = function() {
		this.total = this.store.getTotal();
		this.rows = this.store.getData();
		this.loaded = Object.keys( this.rows ).length;
		this.paginate();
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.next = function() {
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
			this.updateControls();
		}.bind( this ) ).fail( function () {
			// In case call to get next page's data fails, we cannot switch page,
			// so reset the page number to the one we are currently at (rollback page change)
			this.currentPage--;
			this.grid.setItems( [] );
		}.bind( this ) );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.assertLoaded = function( max ) {
		if ( !this.rows.hasOwnProperty( max ) ) {
			return this.store.load();
		}

		return $.Deferred().resolve( this.rows ).promise();
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.previous = function() {
		if ( this.currentPage === 1 ) {
			return;
		}

		this.currentPage--;
		this.range.start = this.pageSize * ( this.currentPage - 1 );
		this.range.end = this.range.start + this.pageSize - 1;
		this.grid.clearItems();
		this.grid.setItems( this.subsetRows( this.range ) );
		this.updateControls();

	};

	OOJSPlus.ui.data.grid.Paginator.prototype.createControls = function() {
		this.currentPageWidget = new OO.ui.LabelWidget();
		this.updatePageCount();

		this.previousButton = new OO.ui.ButtonWidget( {
			icon: 'previous',
			title: mw.message( 'oojsplus-data-paginator-previous' ).plain(),
			disabled: true
		} );
		this.previousButton.connect( this, {
			click: 'previous'
		} );

		this.nextButton= new OO.ui.ButtonWidget( {
			icon: 'next',
			title: mw.message( 'oojsplus-data-paginator-next' ).plain(),
		} );
		this.nextButton.connect( this, {
			click: 'next'
		} );

		this.currentEntriesShown = new OO.ui.LabelWidget( {
			classes: [ 'current-entries-visible' ]
		} );

		this.navigation.addItems( [ this.previousButton, this.currentPageWidget, this.nextButton, this.currentEntriesShown ] );
		this.hasPages = true;
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.updatePageCount = function() {
		this.currentPageWidget.setLabel(
			mw.message( 'oojsplus-data-paginator-page-count', this.currentPage, this.numberOfPages ).plain()
		);
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.paginate = function() {
		this.navigation.clearItems();
		this.grid.setItems( [] );

		this.currentPage = 0;
		this.currentRange = { start: 0, end: 0 };
		this.numberOfPages = Math.ceil( this.total / this.pageSize );
		if ( this.total > this.pageSize ) {
			// There is more than one page
			this.createControls();
		}
		this.next();
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.subsetRows = function( range ) {
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

	OOJSPlus.ui.data.grid.Paginator.prototype.updateControls = function() {
		if ( !this.hasPages ) {
			return;
		}
		this.nextButton.setDisabled( this.currentPage === this.numberOfPages );
		this.previousButton.setDisabled( this.currentPage === 1 );
		this.updatePageCount();
		this.calculateShowedEntries();
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.calculateShowedEntries = function() {
		var start = 1 + this.pageSize * ( this.currentPage - 1 );
		var end = this.pageSize * this.currentPage;
		if ( end > this.total ) {
			end = this.total;
		}

		this.currentEntriesShown.setLabel(
			start + ' - ' + end + '/' + this.total
		);
	};
} )( mediaWiki, jQuery );
