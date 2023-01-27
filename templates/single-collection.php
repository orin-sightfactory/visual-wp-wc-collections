<?php
/**
 * The Template for displaying all Collections
 *
 * This template can be overridden by copying it to yourtheme/vwp-wc-collections/single-collection.php.
 *
 * HOWEVER, on occasion WC COLLECTIONS will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see         https://collections.sightfactory.com/resources/template-structure/
 * @package     WC_Collections\Templates
 * @version     1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

get_header();

vwpwc_get_collection(); // If you override this template ensure that this function call is added to your new template to display the collection


//get_sidebar();

get_footer();
?>
