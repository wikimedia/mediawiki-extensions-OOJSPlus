<?php
namespace OOJSPlus\Special;

use Html;
use UnlistedSpecialPage;

class Demo extends UnlistedSpecialPage {
	/**
	 * @inheritDoc
	 */
	public function __construct() {
		parent::__construct( "OOJSPlusDemos" );
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subPage ) {
		parent::execute( $subPage );

		$this->getOutput()->addHTML( Html::element( 'div', [
			'id' => 'oojsplus-data-demos-grid'
		], 'GRID' ) );
		$this->getOutput()->addHTML( Html::element( 'div', [
			'id' => 'oojsplus-data-demos-tree'
		], 'TREE' ) );
		$this->getOutput()->addHTML( Html::element( 'div', [
			'id' => 'oojsplus-data-demos-stepsProgress'
		], 'StepProgressBar' ) );
		$this->getOutput()->addHTML( Html::element( 'div', [
			'id' => 'oojsplus-data-demos-range'
		], 'Range widget' ) );
		$this->getOutput()->addModules( "ext.oOJSPlus.demo" );
	}
}
