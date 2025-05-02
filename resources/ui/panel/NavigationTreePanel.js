OOJSPlus.ui.panel.NavigationTreePanel = function ( cfg ) {
	OOJSPlus.ui.panel.NavigationTreePanel.super.apply( this, cfg );
	this.skeletonID = cfg.skeletonID || '';
	this.store = cfg.store || new OOJSPlus.ui.data.store.NavigationTreeStore( {
		path: cfg.path
	} );
	this.$element = $( '<div>' ).addClass( 'oojsplus-panel-nav-tree' );

	this.setupTree();
};

OO.inheritClass( OOJSPlus.ui.panel.NavigationTreePanel, OO.ui.PanelLayout );

OOJSPlus.ui.panel.NavigationTreePanel.prototype.setupTree = function () {
	this.$treeCnt = $( '<div>' ).addClass(
		'oojsplus-panel-nav-tree-cnt' );
	this.$element.append( this.$treeCnt );

	const pageName = mw.config.get( 'wgPageName' );
	const pageRoot = pageName.split( '/' );
	const ns = mw.config.get( 'wgCanonicalNamespace' );

	let root = pageRoot[0];
	if ( ns === '' ) {
		root = ns + ':' + pageRoot[0];
	}

	const expandPaths = [];
	let subpageName = root;
	expandPaths.push( subpageName );
	for ( let i = 1; i < pageRoot.length - 1; i++ ) {
		subpageName += '/' + pageRoot[ i ];
		expandPaths.push( subpageName );
	}
	this.store.getExpandedPath( root, expandPaths ).done( ( data ) => {
		this.pages = data;
		if ( $( document ).find( '#' + this.skeletonID ) ) {
			$( '#' + this.skeletonID ).empty();
		}
		this.updatePages();
	} );
};

OOJSPlus.ui.panel.NavigationTreePanel.prototype.updatePages = function () {
	this.$treeCnt.children().remove();

	const pageTree = new OOJSPlus.ui.data.NavigationTree( {
		style: {
			IconExpand: 'next',
			IconCollapse: 'expand'
		},
		data: this.pages,
		allowDeletions: false,
		allowAdditions: false,
		store: this.store,
		includeRedirect: false
	} );
	this.$treeCnt.append( pageTree.$element );
};
