<?php

namespace OOJSPlus\Special;

use MediaWiki\Html\Html;
use MediaWiki\Html\TemplateParser;
use MediaWiki\SpecialPage\SpecialPage;

abstract class OOJSSpecialPage extends SpecialPage {

	/** @var TemplateParser */
	protected $templateParser;

	/**
	 * @param string $name
	 * @param string $restriction
	 * @param bool $listed
	 * @param bool $function
	 * @param string $file
	 * @param bool $includable
	 */
	public function __construct( $name = '', $restriction = '', $listed = true,
	$function = false, $file = '', $includable = false ) {
		parent::__construct( $name, $restriction, $listed,
		$function, $file, $includable );

		$this->templateParser = new TemplateParser(
			dirname( __DIR__, 2 ) . '/resources/templates'
		);
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subPage ) {
		parent::execute( $subPage );
		$this->buildSkeleton();
		$this->doExecute( $subPage );
	}

	/**
	 *
	 * @return void
	 */
	protected function buildSkeleton() {
		$this->getOutput()->enableOOUI();
		$this->getOutput()->addModuleStyles( [ 'ext.oojsplus.special.skeleton.styles' ] );
		$skeleton = $this->templateParser->processTemplate(
			$this->getTemplateName(),
			[]
		);
		$skeletonCnt = Html::openElement( 'div', [
			'id' => 'oojsplus-skeleton-cnt'
		] );
		$skeletonCnt .= $skeleton;
		$skeletonCnt .= Html::closeElement( 'div' );
		$this->getOutput()->addHTML( $skeletonCnt );
	}

	/**
	 * @return string
	 */
	public function getTemplateName() {
		return '';
	}

	/**
	 * @param string|null $subPage
	 * @return void
	 */
	protected function doExecute( $subPage ) {
		// Implement this in your subclass
	}
}
