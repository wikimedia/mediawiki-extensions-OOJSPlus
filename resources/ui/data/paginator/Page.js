( function( mw, $ ) {
	OOJSPlus.ui.data.paginator.Page = function ( cfg ) {
		OOJSPlus.ui.data.paginator.Page.parent.call( this, cfg );
	};

	OO.inheritClass( OOJSPlus.ui.data.paginator.Page, OOJSPlus.ui.data.Paginator );

	OOJSPlus.ui.data.paginator.Page.prototype.setData = function( data ) {
		OOJSPlus.ui.data.paginator.Page.parent.prototype.setData.apply( this, [ data ] );
		this.paginate();
	};

	OOJSPlus.ui.data.paginator.Page.prototype.next = function() {
		OOJSPlus.ui.data.paginator.Page.parent.prototype.next.apply( this, [] );
		if( this.needsPagination() ) {
			this.currentPage++;
			this.updateNavigation();
		}
	};

	OOJSPlus.ui.data.paginator.Page.prototype.previous = function() {
		OOJSPlus.ui.data.paginator.Page.parent.prototype.previous.apply( this, [] );
		if( this.needsPagination() ) {
			this.currentPage--;
			this.updateNavigation();
		}
	};

	OOJSPlus.ui.data.paginator.Page.prototype.makeToolbar = function() {
		this.$element.addClass( 'page-paginator' );

		this.totalWidget = new OO.ui.LabelWidget();
		this.totalWidget.$element.addClass( 'item-count' );
		this.updateTotal();

		this.currentPageWidget = new OO.ui.LabelWidget();
		this.updatePageCount();

		this.previousButton= new OO.ui.ButtonWidget( {
			icon: 'previous',
			disabled: true
		} );
		this.previousButton.on( 'click', function() {
			this.previous();
		}.bind( this ) );

		this.nextButton= new OO.ui.ButtonWidget( {
			icon: 'next'
		} );
		this.nextButton.on( 'click', function() {
			this.next();
		}.bind( this ) );

		this.$element.append(
			this.previousButton.$element,
			this.currentPageWidget.$element,
			this.nextButton.$element,
			this.totalWidget.$element
		);
	};

	OOJSPlus.ui.data.paginator.Page.prototype.paginate = function() {
		this.$element.children().remove();

		if( this.needsPagination() ) {
			this.totalPages = Math.ceil( Object.keys( this.data ).length / this.pageSize );
			this.currentPage = 0;
			this.makeToolbar();
		}
	};

	OOJSPlus.ui.data.paginator.Page.prototype.updatePageCount = function() {
		this.currentPageWidget.setLabel( this.currentPage.toString() + ' of ' + this.totalPages.toString() );
	};

	OOJSPlus.ui.data.paginator.Page.prototype.updateNavigation = function() {
		this.nextButton.setDisabled( this.currentPage === this.totalPages );
		this.previousButton.setDisabled( this.currentPage === 1 );
		this.updatePageCount();
	};

	OOJSPlus.ui.data.paginator.Page.prototype.updateTotal = function() {
		var total = Object.keys( this.data ).length;
		var labelMessage = mw.message( 'oojsplus-data-paginator-page-total-count-label', total ).parse();
		this.totalWidget.setLabel( labelMessage );
	}

} )( mediaWiki, jQuery );